const fs = require('fs');
const { Card, FamilyMember } = require('../../models');
const { EXPENSE_CATEGORIES } = require('../../constants');
const expenseService = require('./expense.service');

const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else current += c;
  }
  result.push(current.trim());
  return result;
};

const normalizeHeader = (h) => h.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');

const importFromCsv = async (filePath, userId) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('CSV must have header and at least one row');

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const idx = (names) => headers.findIndex((h) => names.some((n) => h.includes(n)));

  const dateIdx = idx(['date', 'expensedate', 'transactiondate']);
  const merchantIdx = idx(['merchant', 'store', 'description']);
  const amountIdx = idx(['amount', 'amt']);
  const cardIdx = idx(['card', 'cardname', 'lastfour']);
  const categoryIdx = idx(['category', 'cat']);
  const memberIdx = idx(['member', 'familymember', 'person', 'name']);
  const notesIdx = idx(['notes', 'note']);

  if (merchantIdx < 0 || amountIdx < 0) {
    throw new Error('CSV must include merchant and amount columns');
  }

  const [cards, members] = await Promise.all([
    Card.find({ status: 'active' }),
    FamilyMember.find({ isActive: true }),
  ]);

  const findCard = (val) => {
    if (!val) return cards[0];
    const v = val.toLowerCase();
    return (
      cards.find((c) => c.nickname.toLowerCase().includes(v)) ||
      cards.find((c) => c.lastFourDigits === val.replace(/\D/g, '').slice(-4)) ||
      cards.find((c) => c.bankName.toLowerCase().includes(v))
    );
  };

  const findMember = (val) => {
    if (!val) return members[0];
    const v = val.toLowerCase();
    return members.find((m) => m.name.toLowerCase() === v || m.name.toLowerCase().includes(v));
  };

  const results = { created: 0, failed: [], rows: [] };

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (!cols.length || !cols[amountIdx]) continue;

    try {
      const merchant = cols[merchantIdx];
      const amount = parseFloat(String(cols[amountIdx]).replace(/[₹,]/g, ''));
      const card = findCard(cardIdx >= 0 ? cols[cardIdx] : '');
      const member = findMember(memberIdx >= 0 ? cols[memberIdx] : '');
      if (!card) throw new Error('No matching card');
      if (!member) throw new Error('No matching family member');

      let category = categoryIdx >= 0 ? cols[categoryIdx] : 'Other';
      if (!EXPENSE_CATEGORIES.includes(category)) category = 'Other';

      let expenseDate = new Date();
      if (dateIdx >= 0 && cols[dateIdx]) {
        const d = new Date(cols[dateIdx]);
        if (!isNaN(d)) expenseDate = d;
      }

      await expenseService.createExpense(
        {
          merchant,
          amount,
          cardId: card._id,
          familyMemberId: member._id,
          category,
          expenseDate,
          notes: notesIdx >= 0 ? cols[notesIdx] : '',
          splitType: 'single',
        },
        userId
      );
      results.created++;
      results.rows.push({ row: i + 1, merchant, status: 'ok' });
    } catch (e) {
      results.failed.push({ row: i + 1, error: e.message });
    }
  }

  return results;
};

module.exports = { importFromCsv };

const ROLES = Object.freeze({
  ADMIN: 'admin',
  FAMILY_MEMBER: 'family_member',
});

const CARD_STATUS = Object.freeze({
  ACTIVE: 'active',
  BLOCKED: 'blocked',
});

const EXPENSE_CATEGORIES = Object.freeze([
  'Food',
  'Grocery',
  'Fuel',
  'Shopping',
  'EMI',
  'Bills',
  'Entertainment',
  'Travel',
  'Medical',
  'Other',
]);

const EXPENSE_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
});

const PAYMENT_MODES = Object.freeze([
  'credit_card',
  'upi',
  'cash',
  'net_banking',
  'other',
]);

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
});

const BUDGET_TYPES = Object.freeze({
  OVERALL: 'overall',
  MEMBER: 'member',
  CATEGORY: 'category',
  CARD: 'card',
});

const SPLIT_TYPES = Object.freeze({
  SINGLE: 'single',
  EQUAL: 'equal',
  PERCENT: 'percent',
  CUSTOM: 'custom',
});

const MEMBER_PAYMENT_METHODS = Object.freeze([
  'cash',
  'upi',
  'bank_transfer',
  'other',
]);

const NOTIFICATION_TYPES = Object.freeze({
  DUE_DATE: 'due_date',
  CARD_LIMIT: 'card_limit',
  BUDGET_EXCEEDED: 'budget_exceeded',
  NEW_TRANSACTION: 'new_transaction',
  PAYMENT_REMINDER: 'payment_reminder',
});

module.exports = {
  ROLES,
  CARD_STATUS,
  EXPENSE_CATEGORIES,
  EXPENSE_STATUS,
  PAYMENT_MODES,
  PAYMENT_STATUS,
  BUDGET_TYPES,
  SPLIT_TYPES,
  MEMBER_PAYMENT_METHODS,
  NOTIFICATION_TYPES,
};

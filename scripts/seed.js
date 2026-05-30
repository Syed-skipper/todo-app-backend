const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { getMongoConfig } = require('../config/database');
const { User, Card, Budget } = require('../models');
const { ROLES, CARD_STATUS } = require('../constants');

const seed = async () => {
  const { uri, options } = getMongoConfig();
  await mongoose.connect(uri, options);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@family.com';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt),
      role: ROLES.ADMIN,
    });
    console.log('Admin user created:', adminEmail);
  }

  const cardCount = await Card.countDocuments();
  if (cardCount === 0) {
    const cards = [
      { nickname: 'Primary HDFC', bankName: 'HDFC', lastFourDigits: '1234', creditLimit: 200000, billingCycleStart: 1, billingCycleEnd: 30, dueDate: 15, availableBalance: 200000 },
      { nickname: 'SBI Family', bankName: 'SBI', lastFourDigits: '5678', creditLimit: 150000, billingCycleStart: 5, billingCycleEnd: 4, dueDate: 20, availableBalance: 150000 },
      { nickname: 'ICICI Shopping', bankName: 'ICICI', lastFourDigits: '9012', creditLimit: 100000, billingCycleStart: 10, billingCycleEnd: 9, dueDate: 25, availableBalance: 100000 },
      { nickname: 'Axis Fuel', bankName: 'Axis', lastFourDigits: '3456', creditLimit: 80000, billingCycleStart: 15, billingCycleEnd: 14, dueDate: 10, availableBalance: 80000 },
      { nickname: 'Kotak Bills', bankName: 'Kotak', lastFourDigits: '7890', creditLimit: 120000, billingCycleStart: 20, billingCycleEnd: 19, dueDate: 5, availableBalance: 120000 },
      { nickname: 'Amex Travel', bankName: 'Amex', lastFourDigits: '2468', creditLimit: 250000, billingCycleStart: 25, billingCycleEnd: 24, dueDate: 18, availableBalance: 250000 },
    ];
    await Card.insertMany(cards.map((c) => ({ ...c, status: CARD_STATUS.ACTIVE })));
    console.log('6 credit cards seeded');
  }

  const now = new Date();
  const budgetExists = await Budget.findOne({ type: 'overall', month: now.getMonth() + 1, year: now.getFullYear() });
  if (!budgetExists) {
    const admin = await User.findOne({ role: ROLES.ADMIN });
    await Budget.create({
      type: 'overall',
      amount: 150000,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      createdBy: admin?._id,
    });
    console.log('Overall monthly budget seeded');
  }

  console.log('Seed complete');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

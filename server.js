require('dotenv').config();
const { getJwtSecret } = require('./config/jwt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const paymentService = require('./modules/payments/payment.service');

const authRoutes = require('./modules/auth/auth.routes');
const cardRoutes = require('./modules/cards/card.routes');
const expenseRoutes = require('./modules/expenses/expense.routes');
const memberRoutes = require('./modules/members/member.routes');
const budgetRoutes = require('./modules/budgets/budget.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const emiRoutes = require('./modules/emi/emi.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const reportRoutes = require('./modules/reports/report.routes');
const userRoutes = require('./modules/users/user.routes');
const { EXPENSE_CATEGORIES } = require('./constants');
const { getMongoConfig } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Family Expense Tracker API is running' });
});

app.get('/api/constants/categories', (req, res) => {
  res.json({ success: true, data: EXPENSE_CATEGORIES });
});

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/emi', emiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

try {
  getJwtSecret();
  const { uri, options } = getMongoConfig();
  mongoose
    .connect(uri, options)
    .then(() => {
      console.log('MongoDB Connected:', mongoose.connection.name);
      setInterval(() => paymentService.checkOverduePayments().catch(console.error), 24 * 60 * 60 * 1000);
    })
    .catch((err) => console.error('MongoDB Connection Error:', err));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

app.listen(PORT, () => console.log(`Expense Tracker API running on port ${PORT}`));

# Family Credit Card Expense Tracker API

Production-grade Node.js/Express API for tracking shared family credit card expenses.

## Setup

1. Copy `.env` and set:
   ```
   MONGODB_URI=mongodb://localhost:27017/family-expenses
   MONGODB_DB_NAME=family-expenses
   SECRET_KEY=your_jwt_secret
   PORT=5000
   ADMIN_EMAIL=admin@family.com
   ADMIN_PASSWORD=admin123
   ```

2. Install and run:
   ```bash
   npm install
   npm run seed
   npm run dev
   ```

## Architecture

Clean module structure per domain:

```
modules/
  auth/       → auth.routes.js, auth.controller.js, auth.service.js, auth.repository.js, auth.validator.js
  cards/
  expenses/
  members/
  budgets/
  payments/
  emi/
  notifications/
  analytics/
  reports/
```

## API Docs

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full endpoint reference.

## Scripts

- `npm start` — production server
- `npm run dev` — watch mode
- `npm run seed` — seed 6 cards + admin + budget

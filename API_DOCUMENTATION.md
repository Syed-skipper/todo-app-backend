# Family Credit Card Expense Tracker — API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth header:** `access-token: <JWT>` (or `Authorization: Bearer <JWT>`)

All successful responses follow:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Paginated list responses include `pagination`:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

---

## Authentication & Users

### Register

| | |
|---|---|
| **Endpoint** | `POST /api/auth/register` |
| **Auth** | None |
| **Description** | Register a family member. First registered user becomes **admin**. |

**Request body:**

```json
{
  "name": "Syed",
  "email": "syed@family.com",
  "password": "secret123",
  "phone": "+919876543210"
}
```

**Validation:** `name` required; `email` valid; `password` min 6 chars; `phone` optional.

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "_id": "...", "name": "Syed", "email": "syed@family.com", "role": "admin" },
    "token": "eyJhbG..."
  }
}
```

**Errors:** `400` user exists; `400` validation failed.

---

### Login

| | |
|---|---|
| **Endpoint** | `POST /api/auth/login` |
| **Auth** | None |

**Request body:**

```json
{
  "email": "syed@family.com",
  "password": "secret123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user_id": "...",
    "user_name": "Syed",
    "role": "admin",
    "email": "syed@family.com"
  }
}
```

**Errors:** `401` invalid credentials.

---

### Get Profile

| | |
|---|---|
| **Endpoint** | `GET /api/auth/profile` |
| **Auth** | Required |

---

### Update Profile

| | |
|---|---|
| **Endpoint** | `PUT /api/auth/profile` |
| **Auth** | Required |

**Request body:** `{ "name", "phone", "avatar" }` (all optional)

---

### Change Password

| | |
|---|---|
| **Endpoint** | `PUT /api/auth/change-password` |
| **Auth** | Required |

**Request body:**

```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

---

### Activity Logs

| | |
|---|---|
| **Endpoint** | `GET /api/auth/activity-logs` |
| **Auth** | Required |
| **Query** | `page`, `limit`, `userId` (admin only) |

---

### List Users (Admin)

| | |
|---|---|
| **Endpoint** | `GET /api/users` |
| **Auth** | Admin |

---

## Credit Cards

### Create Card

| | |
|---|---|
| **Endpoint** | `POST /api/cards` |
| **Auth** | Admin |

**Request body:**

```json
{
  "nickname": "HDFC Primary",
  "bankName": "HDFC",
  "lastFourDigits": "1234",
  "creditLimit": 200000,
  "billingCycleStart": 1,
  "billingCycleEnd": 30,
  "dueDate": 15,
  "availableBalance": 200000,
  "status": "active",
  "color": "#1976d2"
}
```

**Validation:** `lastFourDigits` exactly 4 digits; cycle days 1–31.

---

### Get All Cards

| | |
|---|---|
| **Endpoint** | `GET /api/cards` |
| **Auth** | Required |

---

### Get Card Summary

| | |
|---|---|
| **Endpoint** | `GET /api/cards/:id/summary` |
| **Query** | `month`, `year` |

**Response includes:** total spent in billing cycle, utilization %, upcoming due payment.

---

### Update / Delete Card

| | |
|---|---|
| **Update** | `PUT /api/cards/:id` (Admin) |
| **Delete** | `DELETE /api/cards/:id` (Admin, fails if expenses exist) |

---

## Expenses

### Add Expense

| | |
|---|---|
| **Endpoint** | `POST /api/expenses` |
| **Auth** | Required |
| **Content-Type** | `application/json` or `multipart/form-data` (field `receipt`) |

**Request body:**

```json
{
  "cardId": "123",
  "memberId": "456",
  "amount": 2500,
  "category": "Food",
  "merchant": "Swiggy",
  "expenseDate": "2026-05-30T10:00:00.000Z",
  "notes": "Dinner",
  "paymentMode": "credit_card",
  "status": "completed"
}
```

**Categories:** Food, Grocery, Fuel, Shopping, EMI, Bills, Entertainment, Travel, Medical, Other

**Response (201):**

```json
{
  "success": true,
  "message": "Expense created",
  "data": {
    "_id": "...",
    "amount": 2500,
    "merchant": "Swiggy",
    "card": { "nickname": "HDFC Primary" },
    "member": { "name": "Syed" }
  }
}
```

**Errors:** `404` card not found; `400` card blocked.

---

### List Expenses

| | |
|---|---|
| **Endpoint** | `GET /api/expenses` |
| **Query** | `page`, `limit`, `sortBy`, `sortOrder`, `cardId`, `memberId`, `category`, `startDate`, `endDate`, `search`, `minAmount`, `maxAmount`, `status` |

---

### Get / Update / Delete Expense

| Method | Endpoint |
|--------|----------|
| GET | `/api/expenses/:id` |
| PUT | `/api/expenses/:id` |
| DELETE | `/api/expenses/:id` |

---

## Members

### List Members

`GET /api/members`

### Member Dashboard

`GET /api/members/:id/dashboard?month=5&year=2026`

Returns total spent, card breakdown, trends, family rank, recent expenses.

### Member Expense History

`GET /api/members/:id/expenses?page=1&limit=20`

---

## Budgets

### Create Budget (Admin)

`POST /api/budgets`

```json
{
  "type": "overall",
  "amount": 150000,
  "month": 5,
  "year": 2026,
  "alertThreshold": 80,
  "memberId": "...",
  "cardId": "...",
  "category": "Food"
}
```

**Types:** `overall`, `member`, `category`, `card`

### List Budgets

`GET /api/budgets?month=5&year=2026` — includes `spent`, `remaining`, `percentUsed`, `status` (`ok` | `warning` | `exceeded`)

### Update / Delete

`PUT /api/budgets/:id` | `DELETE /api/budgets/:id` (Admin)

---

## Bill Payments

### Create Payment Record (Admin)

`POST /api/payments`

```json
{
  "cardId": "...",
  "billingMonth": 5,
  "billingYear": 2026,
  "amountDue": 45000,
  "minimumDue": 5000,
  "dueDate": "2026-06-15",
  "statementGenerated": true,
  "status": "pending"
}
```

**Statuses:** `pending`, `paid`, `overdue`

### List Payments

`GET /api/payments?cardId=&status=&month=&year=`

### Upcoming Due

`GET /api/payments/upcoming?days=7`

### Mark Paid

`PATCH /api/payments/:id/pay`

```json
{ "paidAmount": 45000, "paidDate": "2026-06-10" }
```

---

## EMI Plans

### Create EMI

`POST /api/emi`

```json
{
  "title": "iPhone EMI",
  "purchaseAmount": 120000,
  "tenure": 12,
  "monthlyInstallment": 10000,
  "remainingInstallments": 12,
  "cardId": "...",
  "memberId": "...",
  "startDate": "2026-01-01",
  "merchant": "Amazon"
}
```

### List / Pay Installment / Update / Delete

| Method | Endpoint |
|--------|----------|
| GET | `/api/emi` |
| PATCH | `/api/emi/:id/pay-installment` |
| PUT | `/api/emi/:id` |
| DELETE | `/api/emi/:id` |

---

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List (`unreadOnly=true`) |
| PATCH | `/api/notifications/read-all` | Mark all read |
| PATCH | `/api/notifications/:id/read` | Mark one read |

---

## Analytics

### Monthly Dashboard

`GET /api/analytics/dashboard?month=5&year=2026`

Returns family spend, highest spender, most used card, category breakdown, budget vs actual.

### Smart Insights

`GET /api/analytics/insights`

Returns spending prediction, recurring payments, unusual expenses, savings suggestions.

---

## Reports & Export

| Endpoint | Description |
|----------|-------------|
| `GET /api/reports/monthly/pdf?month=5&year=2026` | PDF download |
| `GET /api/reports/export/csv?month=5&year=2026` | CSV download |
| `GET /api/reports/member/:memberId?month=5&year=2026` | Member report JSON |
| `GET /api/reports/card/:cardId/statement?month=5&year=2026` | Card statement JSON |

---

## Utility

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/constants/categories` | Expense category list |

---

## Roles

| Role | Permissions |
|------|-------------|
| `admin` | Manage cards, budgets, payments, users |
| `family_member` | Add/view expenses, dashboards, reports |

---

## Seed Data

```bash
npm run seed
```

Creates admin user, 6 cards, and monthly overall budget. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.

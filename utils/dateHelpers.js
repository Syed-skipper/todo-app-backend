const getMonthRange = (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

const getBillingCycleRange = (card, month, year) => {
  const startDay = card.billingCycleStart;
  const endDay = card.billingCycleEnd;
  let start = new Date(year, month - 2, startDay);
  let end = new Date(year, month - 1, endDay, 23, 59, 59, 999);
  if (endDay < startDay) {
    end = new Date(year, month, endDay, 23, 59, 59, 999);
  }
  if (start > end) {
    start = new Date(year, month - 2, startDay);
  }
  return { start, end };
};

module.exports = { getMonthRange, getCurrentMonthYear, getBillingCycleRange };

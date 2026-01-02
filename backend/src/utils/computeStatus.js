const computeStatus = (c, today) => {
  if (c.filing_date) return "completed";

  const due = new Date(c.due_date);
  due.setHours(0, 0, 0, 0);

  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "pending";
  return "upcoming";
};

export default computeStatus
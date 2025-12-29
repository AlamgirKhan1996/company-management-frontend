export function getDueStatus(dueDate?: string, status?: string){
  if (!dueDate || status === "DONE") {
    return "NO_DUE_DATE";
  }

  const today = new Date();
  const due = new Date(dueDate);
  
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
    if (due < today) {
      return "OVERDUE";
    }
    if (due.getTime() === today.getTime()) {
      return "DUE_TODAY";
    }
    return "UPCOMING";
  }
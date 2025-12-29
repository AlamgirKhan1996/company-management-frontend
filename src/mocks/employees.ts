export type Employee = {
  id: string;
  name: string;
};

export const employees: Employee[] = [
  { id: "e1", name: "Ali Khan" },
  { id: "e2", name: "Sara Ahmed" },
  { id: "e3", name: "John Smith" },
];

export function getEmployees() {
  return employees;
}

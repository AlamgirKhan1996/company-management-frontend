// BUG FIXED: department was typed as string but the backend returns
// { id: string; name: string } — caused silent type errors wherever
// department.name was accessed (e.g. displaying department in tables).
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  avatarUrl?: string;
  department?: {
    id: string;
    name: string;
  };
  createdAt?: string;
}

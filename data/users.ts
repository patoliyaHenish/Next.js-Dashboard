export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User" | "Manager";
  status: "Active" | "Inactive" | "Pending";
  age: number;
  created_at: string; // ISO date (YYYY-MM-DD)
}

export const users: User[] = [
  { id: 1, name: "herry", email: "herry@gmail.com", role: "Admin", status: "Inactive", age: 23, created_at: "2025-11-30" }
];

export interface IUserSession {
  _id: unknown;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "user" | "admin";
}

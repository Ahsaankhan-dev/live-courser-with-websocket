import { AuthLayoutClient } from "./AuthLayoutClient";

export const metadata = {
  title: "AuthApp - Sign In",
};

export default function AuthLayout({ children }) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
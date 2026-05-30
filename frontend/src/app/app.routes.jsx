import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/Auth/pages/Login";
import Register from "../features/Auth/pages/Register";
import VerifyEmail from "../features/Auth/pages/VerifyEmail";
import Protected from "../features/Auth/components/Protected";
import Dashboard from "../features/Chat/pages/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },
]);

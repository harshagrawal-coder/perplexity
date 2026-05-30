import { RouterProvider } from "react-router-dom";
import { router } from "./app.routes";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { getUser, setInitialized } from "../features/Auth/auth.slice";

function App() {
  const dispatch = useDispatch();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const stored = localStorage.getItem("auth_user");
    if (stored) {
      dispatch(getUser());
    } else {
      dispatch(setInitialized());
    }
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
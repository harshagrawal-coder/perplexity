import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleLogin, handleRegister, getUser, handleLogout as logoutThunk } from "../auth.slice";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const login = useCallback((formData) => {
    return dispatch(handleLogin(formData)).unwrap();
  }, [dispatch]);

  const register = useCallback((formData) => {
    return dispatch(handleRegister(formData)).unwrap();
  }, [dispatch]);

  const getCurrentUser = useCallback(() => {
    return dispatch(getUser()).unwrap();
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch {
      // ignore
    }
    navigate("/login");
  }, [dispatch, navigate]);

  return { login, register, getCurrentUser, handleLogout, loading, error, user };
};
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CheckAuth from "./components/common/CheckAuth";
import AuthLayout from "./components/layout/AuthLayout";
import Layout from "./components/layout/Layout";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import { checkAuth } from "./redux/auth-slice";
import Dashboard from "./pages/Dashboard";
import CodeRoom from "./components/code-editor/CodeRoom";

const App: React.FC = () => {
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/auth"
        element={
          <CheckAuth isAuthenticated={isAuthenticated}>
            <AuthLayout />
          </CheckAuth>
        }
      >
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Protected Main App Routes */}
      <Route
        path="/"
        element={
          <CheckAuth isAuthenticated={isAuthenticated}>
            <Layout />
          </CheckAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/code-editor/:snippetId" element={<CodeRoom />} />
      </Route>
    </Routes>
  );
};

export default App;

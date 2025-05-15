import React from "react";
import { Outlet } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AuthLayout: React.FC = () => {
  return (
    <div className="flex lg:flex-row flex-col min-h-screen">
      <div className="hidden lg:flex items-center justify-center flex-1 bg-gray-900">
        <div className="max-w-md text-center text-white p-8">
          <h2 className="text-3xl font-bold mb-6">Welcome to CodeSnip</h2>
          <p className="text-xl mb-8">
            Create, manage and share your code snippets effortlessly.
          </p>
          <div className="flex justify-center">
            <ArrowRight size={48} />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

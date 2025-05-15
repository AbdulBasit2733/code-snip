import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/reduxHooks";
import { login } from "../redux/auth-slice";
import { toast } from "sonner";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    const formData = {
      email: email,
      password: password,
    };

    try {
      await dispatch(login(formData)).then((data) => {
        console.log(data);
        if (data.payload?.success) {
          toast.success(data.payload.message);
          navigate("/");
        } else {
          toast.error(data.payload?.message);
        }
      });
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter Your email"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="mb-4">
          <label
            className="block mb-1 text-sm text-gray-700"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <div className="mt-2">
          Don't Have an account{" "}
          <Link to={"/auth/register"} className="text-blue-800">
            Register Here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", form);

      // ✅ Save token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Redirect to home
      window.location.href = "/";

    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ================= LEFT SIDE ================= */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white flex-col justify-center items-center p-10">

        <h1 className="text-5xl font-extrabold mb-4">
          Mana Panchayat
        </h1>

        <p className="text-center max-w-md text-lg text-indigo-100 leading-relaxed">
          Create, manage, and share QR codes instantly with anyone.
          Simple, fast, and secure.
        </p>

      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="relative flex w-full md:w-1/2 justify-center items-center bg-gray-100 px-4">

        {/* BACK TO HOME */}
        <Link
          to="/"
          className="absolute top-6 right-6 text-indigo-600 hover:text-indigo-800 font-medium transition"
        >
          ← Back to Home
        </Link>

        {/* LOGIN CARD */}
        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md"
        >

          {/* HEADING */}
          <div className="text-center mb-8">

            <h2 className="text-4xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Login to continue using Mana Panchayati
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 text-sm p-3 rounded-xl mb-5 text-center">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="mb-4">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="mb-6">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />

          </div>

          {/* LOGIN BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* REGISTER LINK */}
          <p className="text-center text-sm text-gray-500 mt-6">

            Don’t have an account?{" "}

            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Register here
            </Link>

          </p>

          {/* TRUST TEXT */}
          <div className="mt-8 border-t pt-5 text-center text-xs text-gray-500 space-y-1">

            <p>🔒 Secure Login</p>
            <p>⚡ Fast QR Management</p>
            <p>🌐 Easy File Sharing</p>

          </div>

        </form>

      </div>

    </div>
  );
}
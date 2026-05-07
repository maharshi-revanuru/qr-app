import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [captcha, setCaptcha] = useState({
    a: Math.floor(Math.random() * 10),
    b: Math.floor(Math.random() * 10),
    answer: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ VALIDATION
  const validate = () => {
    let newErrors = {};

    if (form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (parseInt(captcha.answer) !== captcha.a + captcha.b) {
      newErrors.captcha = "Captcha answer is incorrect";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ✅ HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      alert("Registered successfully ✅");

      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8">

        {/* ✅ TOP SECTION */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mana Panchayat
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Create and share QR codes easily
            </p>
          </div>

          <Link
            to="/"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Home
          </Link>

        </div>

        {/* ✅ HEADING */}
        <div className="mb-6 text-center">

          <h2 className="text-3xl font-bold text-gray-800">
            Create Account
          </h2>

          <p className="text-gray-500 mt-2 text-sm">
            Join Mana Panchayati and start sharing instantly
          </p>

        </div>

        {/* ✅ FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 rounded-xl outline-none transition"
            />

            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 rounded-xl outline-none transition"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 rounded-xl outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 rounded-xl outline-none transition"
            />

            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* CAPTCHA */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Verification
            </label>

            <div className="flex items-center gap-3">

              <div className="bg-gray-100 px-4 py-3 rounded-xl font-semibold text-gray-700">
                {captcha.a} + {captcha.b} =
              </div>

              <input
                type="number"
                placeholder="Answer"
                value={captcha.answer}
                onChange={(e) =>
                  setCaptcha({
                    ...captcha,
                    answer: e.target.value,
                  })
                }
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 rounded-xl outline-none transition"
              />

            </div>

            {errors.captcha && (
              <p className="text-red-500 text-sm mt-1">
                {errors.captcha}
              </p>
            )}

          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold shadow-md disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* ✅ LOGIN LINK */}
        <div className="text-center mt-6">

          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login here
            </Link>
          </p>

        </div>

        {/* ✅ TRUST TEXT */}
        <div className="mt-6 border-t pt-4 text-center text-xs text-gray-500 space-y-1">

          <p>🔒 Secure Registration</p>
          <p>⚡ Fast QR Generation</p>
          <p>🌐 Simple File Sharing</p>

        </div>

      </div>

    </div>
  );
}
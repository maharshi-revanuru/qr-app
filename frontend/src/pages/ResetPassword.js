import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import API from "../services/api";

export default function ResetPassword() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.post(
        `/auth/reset-password/${token}`,
        { password }
      );

      alert(
        "Password reset successful ✅"
      );

      navigate("/login");

    } catch (err) {

      alert(
        err.response?.data?.message
      );

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >

        <h2 className="text-3xl font-bold mb-6 text-center">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-6"
          required
        />

        <button
          className="w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          Reset Password
        </button>

      </form>
    </div>
  );
}
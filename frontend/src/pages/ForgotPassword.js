import { useState } from "react";
import API from "../services/api";

export default function ForgotPassword() {

  const [email, setEmail] =
    useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await API.post(
        "/auth/forgot-password",
        { email }
      );

      alert(res.data.message);

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
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-6"
          required
        />

        <button
          className="w-full bg-indigo-600 text-white py-3 rounded-xl"
        >
          Send Reset Link
        </button>

      </form>
    </div>
  );
}
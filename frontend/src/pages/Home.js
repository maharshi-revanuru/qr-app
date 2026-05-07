import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import logo from "../assets/logo.jpeg";

export default function Home() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setOpen(false);

    window.location.href = "/";
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ================= NAVBAR ================= */}
{/* ================= NAVBAR ================= */}
<div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">

  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-10 py-4 max-w-7xl mx-auto">

    {/* LOGO SECTION */}
    <Link
      to="/"
      className="flex items-center justify-center md:justify-start gap-3"
    >

      <div className="w-14 h-14 md:w-16 md:h-16 overflow-hidden flex items-center justify-center">

        <img
          src={logo}
          alt="Mana Panchayat Logo"
          className="w-full h-full object-contain scale-150"
        />

      </div>

      <div>

        <h1 className="text-2xl md:text-3xl font-bold text-indigo-600 leading-none">
          Mana Panchayat
        </h1>

        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Smart QR Sharing
        </p>

      </div>

    </Link>

    {/* RIGHT SIDE */}
    {!user ? (
      <div className="flex items-center justify-center md:justify-end gap-3 flex-wrap">

        <Link
          to="/login"
          className="px-4 md:px-5 py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition text-sm md:text-base"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="px-4 md:px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition text-sm md:text-base"
        >
          Get Started
        </Link>

      </div>
    ) : (
      <div className="relative flex justify-center md:justify-end">

        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 cursor-pointer bg-white hover:bg-gray-100 px-3 py-2 rounded-xl transition"
        >

          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-10 h-10 rounded-full border"
          />

          <div className="hidden md:block">

            <p className="font-medium text-gray-700">
              {user.name}
            </p>

            <p className="text-xs text-gray-400">
              Welcome back
            </p>

          </div>

          <ChevronDown size={16} />

        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-xl transition"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/upload")}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-xl transition"
            >
              Upload Files
            </button>

            <hr className="my-2" />

            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition"
            >
              Logout
            </button>

          </div>
        )}

      </div>
    )}

  </div>

</div>

      {/* ================= HERO ================= */}
      <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 py-24 text-center px-4">

        <div className="max-w-5xl mx-auto">

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">

            Create & Share <br />

            <span className="text-indigo-600">
              Dynamic QR Codes
            </span>

            {" "}in Seconds
          </h1>

          <p className="mt-6 text-gray-600 text-lg max-w-2xl mx-auto">
            Upload files, generate QR codes, and share links instantly with anyone.
            Simple, fast, and built for everyone.
          </p>

          {/* CTA BUTTONS */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Link
              to="/register"
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition font-semibold"
            >
              Start Free
            </Link>

            <Link
              to="/login"
              className="px-8 py-4 bg-white text-gray-700 rounded-2xl border hover:bg-gray-50 transition font-semibold"
            >
              Login
            </Link>

          </div>

        </div>

        {/* QR TYPE GRID */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-6">

          {[
            "URL / Link",
            "PDF",
            "Image",
            "Email",
            "Apps",
            "Audio",
            "Video",
            "Text",
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition duration-300"
            >
              <p className="font-semibold text-gray-700">
                {item}
              </p>
            </div>
          ))}

        </div>

      </div>

      {/* ================= 3 STEPS ================= */}
      <div className="py-24 px-6 md:px-10 text-center">

        <h2 className="text-4xl font-bold mb-14 text-gray-800">
          Create QR Code in 3 Easy Steps
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          <div className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition">

            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold">
              1
            </div>

            <p className="text-indigo-600 font-semibold mb-2">
              Step 1
            </p>

            <h3 className="text-2xl font-bold text-gray-800">
              Choose Type
            </h3>

            <p className="mt-3 text-gray-500">
              Select files, links, text, or media you want to share.
            </p>

          </div>

          <div className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition">

            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold">
              2
            </div>

            <p className="text-purple-600 font-semibold mb-2">
              Step 2
            </p>

            <h3 className="text-2xl font-bold text-gray-800">
              Generate QR
            </h3>

            <p className="mt-3 text-gray-500">
              Instantly create beautiful and shareable QR codes.
            </p>

          </div>

          <div className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition">

            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold">
              3
            </div>

            <p className="text-blue-600 font-semibold mb-2">
              Step 3
            </p>

            <h3 className="text-2xl font-bold text-gray-800">
              Download & Share
            </h3>

            <p className="mt-3 text-gray-500">
              Share your QR code anywhere in seconds.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileClock,
  Users,
  Home,
  LogOut,
  User,
} from "lucide-react";

export default function Sidebar() {
  // 🔥 GET USER FROM LOCAL STORAGE
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // 🔥 MENU ITEMS (ROLE BASED)
  const menuItems = [
    { name: "Home", path: "/", icon: <Home size={20} /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Upload", path: "/upload", icon: <Upload size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },

    ...(user?.role === "admin"
      ? [{ name: "Users", path: "/users", icon: <Users size={20} /> }]
      : []),

    { name: "Requests", path: "/requests", icon: <FileClock size={20} /> },
  ];

  // 🔥 LOGOUT
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="w-64 min-w-[16rem] h-screen bg-white shadow-md flex flex-col">

      {/* 🔥 PROFILE HEADER */}
      <div className="p-5 border-b flex items-center gap-3">

        <img
          src={
            user?.profilePic
              ? `http://localhost:5000/${user.profilePic}`
              : "https://i.pravatar.cc/100"
          }
          alt="profile"
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="overflow-hidden">
          <p className="text-sm font-semibold truncate">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email || "No email"}
          </p>
        </div>

      </div>

      {/* 🔥 MENU */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">

        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${
                isActive
                  ? "bg-indigo-100 text-indigo-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}

      </div>

      {/* 🔥 LOGOUT */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg text-sm"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

    </div>
  );
}
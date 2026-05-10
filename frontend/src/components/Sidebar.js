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

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },

    {
      name: "Upload",
      path: "/upload",
      icon: <Upload size={20} />,
    },

    {
      name: "Profile",
      path: "/profile",
      icon: <User size={20} />,
    },

    ...(user?.role === "admin"
      ? [
          {
            name: "Users",
            path: "/users",
            icon: <Users size={20} />,
          },
        ]
      : []),

    {
      name: "Requests",
      path: "/requests",
      icon: <FileClock size={20} />,
    },
  ];

  // 🔥 LOGOUT
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div
      className="
        w-64
        md:w-64
        w-full
        h-screen
        bg-white
        shadow-md
        flex
        flex-col
        overflow-hidden
      "
    >

      {/* 🔥 PROFILE HEADER */}
      <div className="p-4 md:p-5 border-b flex items-center gap-3">

        <img
          src={
            user?.profilePic
              ? `https://mana-panchayat.onrender.com/${user.profilePic}`
              : "https://i.pravatar.cc/100"
          }
          alt="profile"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
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
              `
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                transition
                text-sm
                overflow-hidden
                ${
                  isActive
                    ? "bg-indigo-100 text-indigo-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `
            }
          >

            <div className="flex-shrink-0">
              {item.icon}
            </div>

            <span className="truncate">
              {item.name}
            </span>

          </NavLink>
        ))}

      </div>

      {/* 🔥 LOGOUT */}
      <div className="p-4 border-t">

        <button
          onClick={logout}
          className="
            flex
            items-center
            gap-3
            w-full
            px-4
            py-3
            text-red-500
            hover:bg-red-50
            rounded-xl
            text-sm
            transition
          "
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </div>
  );
}
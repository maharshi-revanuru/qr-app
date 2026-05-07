import { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import { Bell } from "lucide-react";
import { io } from "socket.io-client";

export default function Layout({ children, title = "Dashboard" }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef();

  // ================= FETCH NOTIFICATIONS =================
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setNotifications(data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io("http://localhost:5000");

    socket.emit("join", user._id);

    socket.on("new_notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  // ================= CLOSE DROPDOWN ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= UNREAD COUNT =================
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ================= TIME FORMAT =================
  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col bg-gray-100">

        {/* TOPBAR */}
        <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">

          <h1 className="text-lg font-semibold">{title}</h1>

          <div className="flex items-center gap-4">

            {/* 🔍 SEARCH */}
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg w-72"
            />

            {/* 🔔 NOTIFICATIONS */}
            <div className="relative">

              <Bell
                className="cursor-pointer text-gray-600"
                onClick={() => setOpen(!open)}
              />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {unreadCount}
                </span>
              )}

              {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow rounded z-50 max-h-80 overflow-y-auto">

                  <div className="p-3 font-semibold border-b">
                    Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <p className="p-3 text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={async () => {
                          await fetch(
                            `http://localhost:5000/api/notifications/${n._id}/read`,
                            {
                              method: "PUT",
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                              },
                            }
                          );

                          setNotifications((prev) =>
                            prev.map((item) =>
                              item._id === n._id
                                ? { ...item, read: true }
                                : item
                            )
                          );
                        }}
                        className={`p-3 border-b cursor-pointer ${
                          !n.read ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="text-sm">{n.message}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                    ))
                  )}

                </div>
              )}
            </div>

            {/* 👤 PROFILE DROPDOWN */}
            <div className="relative" ref={profileRef}>

              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <img
                  src={
                    user?.profilePic
                      ? `http://localhost:5000/${user.profilePic}`
                      : "https://i.pravatar.cc/40"
                  }
                  className="w-8 h-8 rounded-full"
                  alt="user"
                />

                <span className="text-sm font-medium">
                  {user?.name || "User"}
                </span>
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded z-50">

                  <div
                    onClick={() => window.location.href = "/profile"}
                    className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    👤 Profile
                  </div>

                  <div
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/";
                    }}
                    className="p-3 hover:bg-red-100 text-red-600 cursor-pointer text-sm"
                  >
                    🚪 Logout
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          {typeof children === "function" ? children(search) : children}
        </div>

      </div>
    </div>
  );
}
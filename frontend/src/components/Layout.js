import { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";

import {
  Bell,
  Menu,
  X,
} from "lucide-react";

import { io } from "socket.io-client";

export default function Layout({
  children,
  title = "Dashboard",
}) {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // 🔥 MOBILE SIDEBAR
  const [mobileSidebar, setMobileSidebar] =
    useState(false);

  const profileRef = useRef();

  // ================= FETCH NOTIFICATIONS =================
  const fetchNotifications = async () => {
    try {

      const res = await fetch(
        "https://mana-panchayat.onrender.com/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();

setNotifications(Array.isArray(data) ? data : []);

    } catch (err) {
      console.log(err);
    }
  };

  // ================= SOCKET =================
  useEffect(() => {

    fetchNotifications();

    const socket = io(
      "https://mana-panchayat.onrender.com"
    );

    socket.emit("join", user._id);

    socket.on("new_notification", (data) => {
      setNotifications((prev) => [
        data,
        ...prev,
      ]);
    });

    return () => socket.disconnect();

  }, []);

  // ================= CLOSE DROPDOWN =================
  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  // ================= UNREAD =================
  const unreadCount = Array.isArray(notifications)
  ? notifications.filter((n) => !n.read).length
  : 0;

  // ================= TIME FORMAT =================
  const timeAgo = (date) => {

    const diff = Math.floor(
      (new Date() - new Date(date)) / 1000
    );

    if (diff < 60) return "Just now";

    if (diff < 3600)
      return `${Math.floor(diff / 60)} min ago`;

    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hr ago`;

    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* ================= MOBILE SIDEBAR ================= */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">

          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() =>
              setMobileSidebar(false)
            }
          />

          {/* SIDEBAR */}
          <div className="relative z-50">
            <Sidebar />
          </div>

        </div>
      )}

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ================= TOPBAR ================= */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            px-3
            md:px-6
            py-4
            bg-white
            shadow-sm
          "
        >

          {/* LEFT */}
          <div className="flex items-center gap-3">

            {/* MOBILE MENU */}
            <button
              onClick={() =>
                setMobileSidebar(true)
              }
              className="md:hidden"
            >
              <Menu size={24} />
            </button>

            <h1 className="text-lg font-semibold truncate">
              {title}
            </h1>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 md:gap-4">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                hidden
                sm:block
                px-4
                py-2
                border
                rounded-lg
                w-40
                md:w-72
              "
            />

            {/* NOTIFICATIONS */}
            <div className="relative">

              <Bell
                className="cursor-pointer text-gray-600"
                onClick={() => setOpen(!open)}
              />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -top-2
                    -right-2
                    bg-red-500
                    text-white
                    text-xs
                    px-1
                    rounded-full
                  "
                >
                  {unreadCount}
                </span>
              )}

              {/* DROPDOWN */}
              {open && (
                <div
                  className="
                    absolute
                    right-0
                    mt-2
                    w-72
                    md:w-80
                    bg-white
                    shadow-lg
                    rounded-xl
                    z-50
                    max-h-80
                    overflow-y-auto
                  "
                >

                  <div className="p-3 font-semibold border-b">
                    Notifications
                  </div>

                  {notifications.length === 0 ? (
                    <p className="p-3 text-gray-500">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={async () => {

                          await fetch(
                            `https://mana-panchayat.onrender.com/api/notifications/${n._id}/read`,
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
                                ? {
                                    ...item,
                                    read: true,
                                  }
                                : item
                            )
                          );
                        }}
                        className={`
                          p-3
                          border-b
                          cursor-pointer
                          hover:bg-gray-50
                          ${
                            !n.read
                              ? "bg-blue-50"
                              : ""
                          }
                        `}
                      >

                        <p className="text-sm break-words">
                          {n.message}
                        </p>

                        <div className="text-xs text-gray-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </div>

                      </div>
                    ))
                  )}

                </div>
              )}

            </div>

            {/* PROFILE */}
            <div
              className="relative"
              ref={profileRef}
            >

              <div
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
                className="
                  flex
                  items-center
                  gap-2
                  cursor-pointer
                "
              >

                <img
  src={
    user?.profilePic
      ? user.profilePic
      : "https://i.pravatar.cc/40"
  }
  className="w-8 h-8 rounded-full object-cover"
  alt="user"
/>

                <span
                  className="
                    hidden
                    sm:block
                    text-sm
                    font-medium
                    truncate
                    max-w-[100px]
                  "
                >
                  {user?.name || "User"}
                </span>

              </div>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div
                  className="
                    absolute
                    right-0
                    mt-2
                    w-40
                    bg-white
                    shadow-lg
                    rounded-xl
                    z-50
                    overflow-hidden
                  "
                >

                  <div
                    onClick={() =>
                      (window.location.href =
                        "/profile")
                    }
                    className="
                      p-3
                      hover:bg-gray-100
                      cursor-pointer
                      text-sm
                    "
                  >
                    👤 Profile
                  </div>

                  <div
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/";
                    }}
                    className="
                      p-3
                      hover:bg-red-100
                      text-red-600
                      cursor-pointer
                      text-sm
                    "
                  >
                    🚪 Logout
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ================= CONTENT ================= */}
        <div
          className="
            flex-1
            overflow-y-auto
            p-3
            md:p-6
          "
        >
          {typeof children === "function"
            ? children(search)
            : children}
        </div>

      </div>

    </div>
  );
}

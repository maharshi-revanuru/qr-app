import { useEffect, useState } from "react";
import API from "../services/api";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await API.get("/requests/notifications");
    setNotifications(res.data);
  };

  return (
    <div className="relative">
      
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2"
      >
        <Bell size={22} />

        {/* Red Badge */}
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
          <h3 className="font-bold mb-2">Notifications</h3>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className="text-sm border-b py-2">
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
import NotificationBell from "./NotificationBell";
import { Search, Bell } from "lucide-react";

<div className="flex items-center gap-4">
  <NotificationBell />
</div>
export default function Navbar() {
  return (
    <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      
      {/* LEFT SIDE */}
      <h1 className="text-xl font-semibold text-gray-800">
        Dashboard
      </h1>

      {/* CENTER (Search Bar) */}
      <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg w-1/3">
        <Search size={18} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search files..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        
        {/* Notification */}
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} className="text-gray-600" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <img
            src="https://i.pravatar.cc/40"
            alt="user"
            className="w-9 h-9 rounded-full"
          />
          <span className="hidden md:block text-sm font-medium text-gray-700">
            Admin
          </span>
        </div>
      </div>
    </div>
  );
}
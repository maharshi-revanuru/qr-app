import API from "../services/api";
import { Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function FileCard({ file, onShare }) {
  const [status, setStatus] = useState("none");

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const res = await API.get(`/files/${file._id}/access`);
      setStatus(res.data.status); // "granted", "pending", "none"
    } catch (err) {
      console.error(err);
    }
  };

  const requestAccess = async () => {
    try {
      await API.post(`/requests/${file._id}`);
      setStatus("pending");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition">
      
      <h3 className="font-semibold text-gray-800 truncate">
        {file.originalName}
      </h3>

      <img src={file.qrCodeUrl} className="w-32 mx-auto my-4" />

      {/* ACTIONS */}
      <div className="flex justify-between items-center mt-4">
        <a
          href={file.path}
          target="_blank"
          className="text-indigo-600 flex gap-1"
        >
          <Download size={18} /> Download
        </a>

        <button
          onClick={() => onShare(file)}
          className="text-green-600 flex gap-1"
        >
          <Share2 size={18} /> Share
        </button>
      </div>

      {/* 🔐 ACCESS CONTROL */}
      {status === "granted" && (
        <div className="mt-3 text-green-600 text-center font-medium">
          ✅ Access Granted
        </div>
      )}

      {status === "pending" && (
        <div className="mt-3 text-yellow-600 text-center font-medium">
          ⏳ Request Pending
        </div>
      )}

      {status === "none" && (
        <button
          onClick={requestAccess}
          className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg"
        >
          Request Access
        </button>
      )}
    </div>
  );
}
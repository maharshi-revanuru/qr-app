import { useEffect, useState } from "react";
import API from "../services/api";

export default function PermissionModal({ file, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [access, setAccess] = useState("view");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await API.get("/users");
    setUsers(res.data);
  };

  const handleSubmit = async () => {
    try {
      await API.put(`/files/${file._id}/permissions`, {
        userId: selectedUser,
        access,
      });

      alert("Permission granted!");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to grant permission");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Share File</h2>

        <select
          className="border p-2 w-full mb-4 rounded"
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.email}
            </option>
          ))}
        </select>

        <select
          className="border p-2 w-full mb-4 rounded"
          onChange={(e) => setAccess(e.target.value)}
        >
          <option value="view">View</option>
          <option value="download">Download</option>
          <option value="modify">Modify</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Grant Access
          </button>
        </div>
      </div>
    </div>
  );
}
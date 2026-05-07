import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`, // 🔥 REQUIRED
        },
      });

      console.log("USERS DATA 👉", res.data);
      setUsers(res.data);

    } catch (err) {
      console.log("FULL ERROR 👉", err.response || err);

      if (err.response?.status === 403) {
        setError("You don't have permission to view this page");
      } else if (err.response?.status === 401) {
        setError("Please login again");
      } else if (err.response?.status === 404) {
        setError("Users API not found (check backend route)");
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    }
  };

  return (
    <Layout title="Users">

      {/* ERROR UI */}
      {error ? (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-4">Users</h2>

          <div className="bg-white p-4 rounded-xl shadow">

            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className="py-2 border-b flex justify-between"
                >
                  <span>{user.email}</span>

                  {/* OPTIONAL ROLE DISPLAY */}
                  <span className="text-xs text-gray-500">
                    {user.role || "user"}
                  </span>
                </div>
              ))
            )}

          </div>
        </>
      )}

    </Layout>
  );
}
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);

      if (err.response?.status === 403) {
        setError("You don't have permission to view this page");
      } else if (err.response?.status === 401) {
        setError("Please login again");
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    }
  };

  const deleteUser = async (id, email) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${email}?`
    );

    if (!confirmDelete) return;

    try {
      setLoadingId(id);

      await API.delete(`/admin/users/${id}`);

      alert("User deleted successfully");

      fetchUsers();

    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
        "Unable to delete user."
      );
    }

    setLoadingId("");
  };

  return (
    <Layout title="Users">

      {error ? (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">
            User Management
          </h2>

          <div className="bg-white rounded-xl shadow overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left p-4">
                    Name
                  </th>

                  <th className="text-left p-4">
                    Email
                  </th>

                  <th className="text-left p-4">
                    Role
                  </th>

                  <th className="text-center p-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.length === 0 ? (

                  <tr>
                    <td
                      colSpan="4"
                      className="text-center p-6"
                    >
                      No Users Found
                    </td>
                  </tr>

                ) : (

                  users.map((user) => (

                    <tr
                      key={user._id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4">
                        {user.name || "-"}
                      </td>

                      <td className="p-4">
                        {user.email}
                      </td>

                      <td className="p-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>

                      </td>

                      <td className="p-4 text-center">

                        <button
                          onClick={() =>
                            deleteUser(user._id, user.email)
                          }
                          disabled={loadingId === user._id}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                        >
                          {loadingId === user._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </>
      )}

    </Layout>
  );
}
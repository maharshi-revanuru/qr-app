import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await API.get("/admin/stats");
    setStats(res.data);
  };

  if (!stats) return <Layout>Loading...</Layout>;

  return (
    <Layout title="Users Analytics">

      <div className="grid md:grid-cols-2 gap-6 mb-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Total Files</h3>
          <p className="text-3xl font-bold">{stats.totalFiles}</p>
        </div>

      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-bold mb-4">File Access Details</h2>

        {stats.accessData.map((file, i) => (
          <div key={i} className="mb-4 border-b pb-3">

            <p className="font-semibold">{file.fileName}</p>
            <p className="text-sm text-gray-500">
              Owner: {file.owner}
            </p>

            {file.usersWithAccess.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No users have access
              </p>
            ) : (
              file.usersWithAccess.map((u, idx) => (
                <p key={idx} className="text-sm">
                  {u.email} — {u.access}
                </p>
              ))
            )}

          </div>
        ))}

      </div>

    </Layout>
  );
}
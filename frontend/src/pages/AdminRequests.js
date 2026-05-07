import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

export default function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await API.get("/requests");
    setRequests(res.data);
  };

  const approve = async (id) => {
    await API.post(`/requests/${id}/approve`);
    fetchRequests();
  };

  const reject = async (id) => {
    await API.post(`/requests/${id}/reject`);
    fetchRequests();
  };

  return (
    <Layout title="Requests">

      <div className="space-y-4">

        {requests.map((r) => (
          <div key={r._id} className="bg-white p-4 rounded-xl shadow">

            <p>
              <b>{r.user?.email}</b> requested access to{" "}
              <b>{r.file?.originalName}</b>
            </p>

            <div className="mt-2 flex gap-3">
              <button
                onClick={() => approve(r._id)}
                className="px-4 py-1 bg-green-500 text-white rounded"
              >
                Approve
              </button>

              <button
                onClick={() => reject(r._id)}
                className="px-4 py-1 bg-red-500 text-white rounded"
              >
                Reject
              </button>
            </div>

          </div>
        ))}

      </div>

    </Layout>
  );
}
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const [allFiles, setAllFiles] = useState([]);
  const [myFiles, setMyFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [shareData, setShareData] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [slugData, setSlugData] = useState({});
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    fetchFiles();
    fetchUser();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await API.get("/files");
      setAllFiles(res.data.allFiles || []);
      setMyFiles(res.data.myFiles || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUser = async () => {
  try {
    const res = await API.get("/users/profile");
    setCurrentUser(res.data);

    // update local storage also
    localStorage.setItem("user", JSON.stringify(res.data));

  } catch (err) {
    console.log(err);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    try {
      await API.delete(`/files/${id}`);
      setAllFiles((prev) => prev.filter((f) => f._id !== id));
      setMyFiles((prev) => prev.filter((f) => f._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleInputChange = (fileId, field, value) => {
    setShareData((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [field]: value,
      },
    }));
  };

  const searchUsers = async (value, fileId) => {
    handleInputChange(fileId, "email", value);
    if (value.length < 2) return;

    const res = await API.get(`/users/search?q=${value}`);
    setSuggestions(res.data);
  };

  const handleShare = async (fileId) => {
    try {
      const data = shareData[fileId];
      if (!data?.email) return alert("Enter user email");

      await API.put(`/files/${fileId}/permissions`, {
        userEmail: data.email,
        access: data.access || "view",
      });

      alert("Access granted ✅");
      setSuggestions([]);
      fetchFiles();
    } catch {
      alert("Share failed");
    }
  };

  const handleSlugUpdate = async (fileId) => {
    try {
      const slug = slugData[fileId];
      if (!slug) return alert("Enter slug");

      await API.put(`/files/${fileId}/slug`, { slug });

      alert("Custom URL updated ✅");
      fetchFiles();
    } catch {
      alert("Slug update failed");
    }
  };

  const files = activeTab === "all" ? allFiles : myFiles;

  return (
    <Layout title="Dashboard">
      {(search) => {

        // 🔥 SEARCH FILTER (NEW)
        const filteredFiles = files.filter((file) =>
          file.originalName
            ?.toLowerCase()
            .includes((search || "").toLowerCase())
        );

        return (
          <>
          {currentUser && !currentUser.isVerified && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4 flex justify-between items-center">
              <span>⚠️ Please verify your email to unlock full access.</span>

              <button
                onClick={() => alert("Resend feature coming soon")}
                className="text-sm bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Resend
              </button>
            </div>
          )}
            {/* TABS */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                All Files
              </button>

              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeTab === "my"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                My Files
              </button>
            </div>

            {/* 🔍 NO RESULTS */}
            {filteredFiles.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                No files found for{" "}
                <span className="font-semibold">"{search}"</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                {filteredFiles.map((file) => {

                  const fileLink = file.customSlug
  ? `https://mana-panchayat.onrender.com/f/${file.customSlug}`
  : `https://mana-panchayat.onrender.com/${file.fileUrl}`;

                  const share = shareData[file._id] || {};

                  const permission = file.permissions?.find(
                    (p) => p.user?._id === user._id
                  );

                  return (
                    <div
                      key={file._id}
                      className="bg-white p-4 md:p-5 rounded-xl shadow hover:shadow-lg transition w-full overflow-hidden"
                    >
                      {/* NAME */}
                      <h3 className="font-semibold text-gray-800 truncate">
                        {file.originalName}
                      </h3>

                      {/* OWNER */}
                      <p className="text-xs text-gray-500 mb-2">
                        Uploaded by: {file.uploadedBy?.email || "Unknown"}
                      </p>

                      {/* QR */}
                      <div className="flex justify-center mb-4">
  {file.qrCode ? (
    <img
      src={`https://mana-panchayat.onrender.com/${file.qrCode}`}
      className="w-28 h-28 object-contain"
      alt="qr"
    />
  ) : (
    <p className="text-gray-400 text-xs">
      No QR Available
    </p>
  )}
</div>

                      {/* LINK */}
                      <div className="flex items-center gap-2 bg-gray-100 p-2 rounded mb-4">
                        <input
                          value={fileLink}
                          readOnly
                          className="flex-1 bg-transparent text-xs outline-none truncate"
                        />

                        <button
                          onClick={() => handleCopy(fileLink, file._id)}
                          className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs"
                        >
                          {copiedId === file._id ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      {/* LOCATION (KEPT) */}
                      {file.location?.lat && (
                        <p className="text-xs text-gray-500 mb-2">
                          📍 {file.location.lat}, {file.location.lng}
                        </p>
                      )}

                      {/* CUSTOM URL */}
                      {user?.role === "admin" && (
                        <div className="border-t pt-3 mb-3">
                          <p className="text-xs text-gray-500 mb-1">Custom URL</p>

                          <div className="flex gap-2">
                            <input
                              placeholder="Enter custom slug"
                              value={slugData[file._id] || ""}
                              onChange={(e) =>
                                setSlugData((prev) => ({
                                  ...prev,
                                  [file._id]: e.target.value,
                                }))
                              }
                              className="flex-1 border px-2 py-1 rounded text-xs"
                            />

                            <button
                              onClick={() => handleSlugUpdate(file._id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Save
                            </button>
                          </div>

                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {fileLink}
                          </p>
                        </div>
                      )}

                      {/* SHARE */}
                      {user?.role === "admin" && (
                        <div className="border-t pt-3 mb-3">
                          <p className="text-xs text-gray-500 mb-2">Share Access</p>

                          <div className="relative">
                            <input
                              value={share.email || ""}
                              onChange={(e) =>
                                searchUsers(e.target.value, file._id)
                              }
                              placeholder="Search user email"
                              className="w-full border px-2 py-1 rounded text-xs"
                            />

                            {suggestions.length > 0 && (
                              <div className="absolute bg-white border shadow w-full mt-1 max-h-32 overflow-y-auto z-10">
                                {suggestions.map((u) => (
                                  <div
                                    key={u._id}
                                    onClick={() => {
                                      handleInputChange(file._id, "email", u.email);
                                      setSuggestions([]);
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-xs"
                                  >
                                    {u.email}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <select
                            value={share.access || "view"}
                            onChange={(e) =>
                              handleInputChange(file._id, "access", e.target.value)
                            }
                            className="mt-2 w-full border px-2 py-1 rounded text-xs"
                          >
                            <option value="view">View</option>
                            <option value="download">Download</option>
                            <option value="edit">Edit</option>
                          </select>

                          <button
                            onClick={() => handleShare(file._id)}
                            className="mt-2 w-full bg-indigo-600 text-white py-1 rounded text-xs"
                          >
                            Grant Access
                          </button>
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="flex justify-between items-center text-sm">

                        {(!permission ||
                          ["download", "edit"].includes(permission?.access)) && (
                          <a href={fileLink} target="_blank" rel="noreferrer" className="text-indigo-600 text-xs">
                            Download
                          </a>
                        )}

                        {(user.role === "admin" ||
                          file.uploadedBy?._id === user._id ||
                          permission?.access === "edit") && (
                          <button
                            onClick={() => handleDelete(file._id)}
                            className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        )}

                      </div>
                    </div>
                  );
                })}

              </div>
            )}
          </>
        );
      }}
    </Layout>
  );
}
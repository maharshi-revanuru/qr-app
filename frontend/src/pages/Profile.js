import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

export default function Profile() {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await API.get("/users/profile");
    setUser(res.data);
    setName(res.data.name);
  };

  const updateProfile = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (file) formData.append("profilePic", file);

    const res = await API.put("/users/profile", formData);

    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));

    alert("Profile updated ✅");
  };

  const changePassword = async () => {
    try {
      await API.put("/users/change-password", {
        oldPassword,
        newPassword,
      });

      alert("Password changed ✅");
      setOldPassword("");
      setNewPassword("");

    } catch {
      alert("Wrong old password ❌");
    }
  };

  return (
    <Layout title="Profile">

      <div className="max-w-xl bg-white p-6 rounded-xl shadow">

        {/* PROFILE IMAGE */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={
              user.profilePic
                ? `http://localhost:5000/${user.profilePic}`
                : "https://i.pravatar.cc/100"
            }
            className="w-20 h-20 rounded-full"
            alt="profile"
          />

          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        {/* NAME */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="Name"
        />

        <button
          onClick={updateProfile}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>

        {/* PASSWORD */}
        <div className="mt-8 border-t pt-6">

          <h3 className="font-semibold mb-3">Change Password</h3>

          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <button
            onClick={changePassword}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Change Password
          </button>

        </div>

      </div>

    </Layout>
  );
}
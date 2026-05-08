import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import API from "../services/api";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

function LocationPicker({ setLocation }) {

  useMapEvents({
    click(e) {
      setLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function Upload() {

  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= UPLOAD =================
  const handleUpload = async () => {

    if (!file) {
      return alert("Please select a file");
    }

    const formData = new FormData();

    // ✅ MUST MATCH BACKEND
    formData.append("files", file);

    // ✅ OPTIONAL LOCATION
    if (location) {
      formData.append("lat", location.lat);
      formData.append("lng", location.lng);
    }

    try {

      setLoading(true);

      await API.post(
        "/files/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Uploaded successfully ✅");

      // RESET
      setFile(null);
      setLocation(null);

      // ✅ REDIRECT TO DASHBOARD
      window.location.href = "/dashboard";

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Upload failed ❌"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <Layout title="Upload File">

      <div className="max-w-2xl mx-auto">

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg">

          {/* TITLE */}
          <div className="mb-6">

            <h2 className="text-2xl font-bold text-gray-800">
              Upload File
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Upload files and generate QR codes instantly
            </p>

          </div>

          {/* FILE INPUT */}
          <div className="mb-6">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose File
            </label>

            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
              className="w-full border border-gray-300 rounded-xl p-3"
            />

            {file && (
              <div className="mt-3 text-sm text-gray-600">
                📄 {file.name}
              </div>
            )}

          </div>

          {/* MAP */}
          <div className="mb-6">

            <p className="text-sm font-medium text-gray-700 mb-2">
              Select Location (optional)
            </p>

            <div className="overflow-hidden rounded-2xl border">

              <MapContainer
                center={[17.385, 78.4867]}
                zoom={10}
                style={{
                  height: "250px",
                  width: "100%",
                }}
              >

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationPicker
                  setLocation={setLocation}
                />

                {location && (
                  <Marker
                    position={[
                      location.lat,
                      location.lng,
                    ]}
                  />
                )}

              </MapContainer>

            </div>

          </div>

          {/* LOCATION */}
          {location && (
            <div className="mb-6 bg-indigo-50 text-indigo-700 p-3 rounded-xl text-sm">

              📍 Selected Location
              <br />

              Latitude: {location.lat}
              <br />

              Longitude: {location.lng}

            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-2xl font-semibold shadow-md disabled:opacity-70"
          >
            {loading
              ? "Uploading..."
              : "Upload File"}
          </button>

        </div>

      </div>

    </Layout>
  );
}
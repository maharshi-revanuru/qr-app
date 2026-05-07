import { useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

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
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    // 🔥 ADD LOCATION IF EXISTS
    if (location) {
      formData.append("lat", location.lat);
      formData.append("lng", location.lng);
    }

    try {
      await API.post("/files/upload", formData);
      alert("Uploaded successfully");
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };

  return (
    <Layout title="Upload File">

      <div className="bg-white p-6 rounded-xl shadow w-full max-w-lg">

        {/* FILE */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        {/* MAP */}
        <div className="mb-4">
          <p className="text-sm mb-2">Select Location (optional)</p>

          <MapContainer
            center={[17.385, 78.4867]} // default (Hyderabad example)
            zoom={10}
            style={{ height: "200px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationPicker setLocation={setLocation} />

            {location && (
              <Marker position={[location.lat, location.lng]} />
            )}
          </MapContainer>
        </div>

        {/* SELECTED LOCATION */}
        {location && (
          <p className="text-xs text-gray-500 mb-3">
            📍 {location.lat}, {location.lng}
          </p>
        )}

        {/* UPLOAD */}
        <button
          onClick={handleUpload}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Upload
        </button>

      </div>

    </Layout>
  );
}
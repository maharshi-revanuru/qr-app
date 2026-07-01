import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import axios from "axios";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

const DefaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

function ChangeMap({ location }) {

  const map = useMap();

  useEffect(() => {

    if (!location) return;

    map.flyTo(
      [location.lat, location.lng],
      15
    );

  }, [location, map]);

  return null;

}

export default function Upload() {
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");


  const searchLocation = async () => {
    if (!search.trim()) {
      alert("Please enter a location");
      return;
    }

    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: search,
            format: "json",
            limit: 1,
          },
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (res.data.length === 0) {
        alert("Location not found");
        return;
      }

      const place = res.data[0];

      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);

      setLocation({ lat, lng });

      
    } catch (err) {
      console.log(err);
      alert("Unable to search location");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return alert("Please select a file");
    }

    const formData = new FormData();

    formData.append("files", file);

    if (location) {
      formData.append("lat", location.lat);
      formData.append("lng", location.lng);
    }

    try {
      setLoading(true);

      await API.post("/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Uploaded successfully ✅");

      setFile(null);
      setLocation(null);
      setSearch("");

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

          <h2 className="text-2xl font-bold mb-2">
            Upload File
          </h2>

          <p className="text-gray-500 mb-6">
            Upload files and generate QR codes instantly
          </p>

          <div className="mb-6">
            <label className="block mb-2 font-medium">
              Choose File
            </label>

            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
              className="w-full border rounded-xl p-3"
            />

            {file && (
              <p className="mt-2">
                📄 {file.name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Search Location
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search village, city or address..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="flex-1 border rounded-xl p-3"
              />

              <button
                onClick={searchLocation}
                className="bg-indigo-600 text-white px-6 rounded-xl hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border mb-5">
            <MapContainer
              center={[17.385, 78.4867]}
              zoom={10}
              style={{
                height: "300px",
                width: "100%",
              }}
             
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <LocationPicker
                setLocation={setLocation}
              />

              <ChangeMap location={location} />

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

          {location && (
            <div className="bg-indigo-50 rounded-xl p-4 mb-5">
              <p>
                <strong>Latitude:</strong>{" "}
                {location.lat}
              </p>

              <p>
                <strong>Longitude:</strong>{" "}
                {location.lng}
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-semibold"
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
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function Verify() {
  const { token } = useParams();

  useEffect(() => {
    API.get('/auth/verify/${token}')
      .then(() => {
        alert("Email verified ✅");
        window.location.href = "/login";
      })
      .catch(() => {
        alert("Invalid or expired link ❌");
      });
  }, [token]);

  return <div className="text-center mt-20">Verifying...</div>;
}
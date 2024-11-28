import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TokenHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Store the token in localStorage
      localStorage.setItem("token", token);

      // Success toast
      toast.success("Google login successful!");

      // Redirect to the home page
      setTimeout(() => {
        navigate("/home");
      }, 300);
    } else {
      // Handle case where token is missing
      toast.error("Authentication failed. No token received.");
      navigate("/login"); // Redirect back to login
    }
  }, [navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <h3>Processing login...</h3>
    </div>
  );
};

export default TokenHandler;

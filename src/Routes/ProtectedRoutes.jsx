import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  const appData = JSON.parse(localStorage.getItem("appData") || "{}");
  let token = appData.token || null;

  const queryParams = new URLSearchParams(location.search);
  const urlToken = queryParams.get("token");

  if (urlToken) {
    token = urlToken;

    localStorage.setItem(
      "appData",
      JSON.stringify({
        ...appData,
        token: urlToken,
      })
    );
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decodedToken = JSON.parse(jsonPayload);

    const currentTime = Math.floor(Date.now() / 1000);

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("appData");
      toast.error("Your session has expired. Please log in again.", {
        autoClose: 3000,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);

      return null;
    }
  } catch (error) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

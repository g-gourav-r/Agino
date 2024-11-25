import { useState } from "react";
import { useNavigate } from "react-router-dom";
import createApiCall, { GET, POST } from "../components/api/api";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faLock,
  faEnvelope,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = () => {
    setLoading(true);
    toast.loading("Authenticating...");
    window.location.href = "https://primus-1ppt.onrender.com/auth/google";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    setLoading(true);
    const loginToast = toast.loading("Logging in...");

    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address.", { autoClose: 3000 });
      return;
    }

    if (!password) {
      toast.error("Password cannot be empty.", { autoClose: 3000 });
      return;
    }

    const loginApiCall = createApiCall("login", POST);
    loginApiCall({
      body: { username: email, password: password },
    })
      .then((response) => {
        setLoading(false);
        const token = response.token;
        const data = {
          token: token,
          psid: uuidv4(),
        };
        localStorage.setItem("appData", JSON.stringify(data));

        // Update the toast on success
        toast.update(loginToast, {
          render: "Login successful!",
          type: "success",
          isLoading: false,
          autoClose: 200,
        });

        setTimeout(() => {
          navigate("/home"); // Navigate after toast is displayed
        }, 300);
      })
      .catch(async (error) => {
        setLoading(false);
        let errorMessage = "An unknown error occurred";

        if (error instanceof Response) {
          try {
            const errorResponse = await error.json();
            errorMessage = errorResponse.message || errorMessage;
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
        } else {
          errorMessage = error.message || errorMessage;
        }

        // Update the toast on error
        toast.update(loginToast, {
          render: `Error: ${errorMessage}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  return (
    <>
      <ToastContainer />
      <div className="row g-0 vh-100 authPageWrapper">
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center">
          <h1>Agino</h1>
        </div>
        <div className="col-md-6 col-12 row d-flex align-items-center justify-content-center">
          <div className="col-10 login-card p-5 border rounded">
            <h3 className="text-center">Welcome Back</h3>
            <p className="mb-4 text-center text-green">Login to Agino</p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <div className="input-group justify-content-center">
                  <span className="input-group-text">
                    <FontAwesomeIcon className="icon-width" icon={faEnvelope} />
                  </span>
                  <input
                    type="email"
                    className="form-control p-2"
                    placeholder="Email ID"
                    name="email"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon className="icon-width" icon={faLock} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control p-2"
                    placeholder="Password"
                    name="password"
                    required
                  />

                  <span
                    className="input-group-text"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    <FontAwesomeIcon
                      className={`icon-width ${
                        showPassword ? "text-green" : ""
                      }`}
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </span>
                </div>
              </div>

              {/* Login and Signup Buttons */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <button
                    type="submit"
                    className={`btn-green w-100 rounded p-1 ${
                      loading ? "btn-green-disabled" : ""
                    }`}
                    disabled={loading}
                  >
                    Login
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn-black w-100 rounded p-1"
                    onClick={() => navigate("/signup")}
                  >
                    Signup
                  </button>
                </div>
              </div>

              {/* Google Button */}
              <div>
                <button
                  type="button"
                  className="btn-black rounded w-100 p-1 d-flex align-items-center justify-content-center"
                  onClick={handleAuth}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faGoogle} />
                  &nbsp;&nbsp;Continue with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import createApiCall, { POST } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faUser,
  faLock,
  faEnvelope,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";

function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const repeatPassword = form.repeatPassword.value;

    setLoading(true);

    // Validation

    if (!username.trim()) {
      toast.error("Username cannot be empty.", { autoClose: 3000 });
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address.", { autoClose: 3000 });
      setLoading(false);
      return;
    }

    if (!password.trim() || !repeatPassword.trim()) {
      toast.error("Password cannot be empty.", { autoClose: 3000 });
      setLoading(false);
      return;
    }

    if (password.trim() !== repeatPassword.trim()) {
      toast.error("Passwords don't match.", { autoClose: 3000 });
      setLoading(false);
      return;
    }

    if (!username.trim()) {
      toast.error("Please enter a username.", { autoClose: 3000 });
      setLoading(false);
      return;
    }

    const signupApiCall = createApiCall("signup", POST);

    signupApiCall({
      body: { username, email, password },
    })
      .then(() => {
        setLoading(false);
        toast.success("Account registered successfully. Please login.", {
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
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

        toast.error(`Error: ${errorMessage}`, { autoClose: 3000 });
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
            <h3 className="text-center">Unleash the Power of Your Data</h3>
            <p className="mb-4 text-center text-green">Signup to Agino</p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <div className="input-group justify-content-center">
                  <span className="input-group-text">
                    <FontAwesomeIcon className="icon-width" icon={faUser} />
                  </span>
                  <input
                    type="text"
                    className="form-control p-2"
                    placeholder="Username"
                    name="username"
                    required
                  />
                </div>
              </div>
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
                    inputMode="none"
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
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon className="icon-width" icon={faLock} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control p-2"
                    placeholder="Repeat Password"
                    name="repeatPassword"
                    inputMode="none"
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

              {/* Signup Button */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <button
                    type="submit"
                    className={`btn-green w-100 rounded p-1 ${
                      loading ? "btn-green-disabled" : ""
                    }`}
                    disabled={loading}
                  >
                    Signup
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn-black w-100 rounded p-1"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </button>
                </div>
              </div>

              {/* Google Button */}
              <div>
                <button
                  type="button"
                  className="btn-black rounded w-100 p-1 d-flex align-items-center justify-content-center"
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

export default SignupPage;

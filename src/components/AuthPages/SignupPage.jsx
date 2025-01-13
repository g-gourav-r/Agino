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
import { responsivePropType } from "react-bootstrap/esm/createUtilityClasses";

function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verificationStatus, setVerificationStatus] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const sendVerificationCodeApi = createApiCall("send-2fa", POST);
  const verifyVerificationCodeApi = createApiCall("verify-2fa", POST);

  const sendVerificationCode = () => {
    sendVerificationCodeApi({
      body: {
        email: userEmail,
      },
    });
  };

  const verifyCode = () => {
    setLoading(true); // Optional: Add a loading state if required
    const joinedCode = code.join("");

    verifyVerificationCodeApi({
      body: {
        email: userEmail,
        code: joinedCode,
      },
    })
      .then((response) => {
        setLoading(false);
        toast.success("Code verified successfully! Redirecting to login...", {
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

        toast.error(`Verification failed: ${errorMessage}`, {
          autoClose: 3000,
        });
      });
  };

  // Handle input change and auto-tab to next input
  const handleInputChange = (e, index) => {
    let value = e.target.value;

    // If the value is a valid digit, update the state
    if (/^\d$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // If a digit is entered, focus the next input
      if (value && index < 5) {
        document.getElementById(`input-${index + 1}`).focus();
      }
    }
  };

  // Handle paste event for the entire 6-digit code
  const handlePaste = (e) => {
    const pastedValue = e.clipboardData.getData("Text");
    if (/^\d{6}$/.test(pastedValue)) {
      setCode(pastedValue.split(""));
    }
  };

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
        sendVerificationCode();
        toast.success(
          "Account registered successfully. Verify your account to complete the registration.",
          {
            autoClose: 2500,
          }
        );
        setVerificationStatus(true);
        // Optionally navigate to the login page after 3 seconds
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
        <div className="col-md-6 col-12 row g-0 d-flex align-items-center justify-content-center">
          <div className="col-10 login-card p-5 border rounded">
            <h3 className="text-center">Unleash the Power of Your Data</h3>
            <p className="mb-4 text-center text-green">Signup to Agino</p>
            <form
              onSubmit={handleSubmit}
              noValidate
              className={`${verificationStatus ? `d-none` : ``}`}
            >
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
                    onChange={(e) => setUserEmail(e.target.value)}
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
            <div className={`${!verificationStatus ? `d-none` : ``}`}>
              <p>
                You're almost there! We've sent a{" "}
                <span className="text-green">verification code</span> to your
                email. Please enter the code below to proceed.
              </p>
              <div className="d-flex justify-content-center my-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`input-${index}`}
                    type="text"
                    value={digit}
                    maxLength="1"
                    className="form-control text-center m-2"
                    style={{
                      width: "50px",
                      fontSize: "20px",
                      letterSpacing: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                    }}
                    placeholder="-"
                    onChange={(e) => handleInputChange(e, index)}
                    onPaste={handlePaste} // Handle paste event
                  />
                ))}
              </div>
              <button
                className="btn-green w-100 rounded p-1"
                onClick={() => verifyCode()}
              >
                <span>Verify the code and create your account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignupPage;

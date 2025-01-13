import { useState } from "react";
import { useNavigate } from "react-router-dom";
import createApiCall, { POST } from "../api/api";
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
  const [resetPassword, setPasswordReset] = useState(false);
  const [emailVerified, setEmailVerification] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [emailDisabled, setEmailDisabled] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [passwordDisabled, setPasswordDisabled] = useState(false);
  const [showVerification, setVerificationVisiblity] = useState(false);

  const verifyEmailApi = createApiCall("request-password-reset", POST);
  const resetPasswordApi = createApiCall("verify-2fa-reset-password", POST);
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
        toast.success("Code verified successfully!", {
          autoClose: 3000,
        });
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

  const verifyUser = () => {
    setEmailDisabled(true);
    setPasswordDisabled(true);
    setVerificationVisiblity(true);
    sendVerificationCode();
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

  const handleAuth = () => {
    setLoading(true);
    toast.loading("Authenticating...");
    window.location.href = "https://api.agino.tech/auth/google";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
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

    setLoading(true);
    const loginToast = toast.loading("Logging in...");

    try {
      const loginApiCall = createApiCall("login", POST);
      const response = await loginApiCall({
        body: { username: email, password: password },
      });

      setLoading(false);
      const token = response.token;
      const data = { token: token };
      localStorage.setItem("appData", JSON.stringify(data));

      // Update the toast on success
      toast.update(loginToast, {
        render: "Login successful!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/chat"); // Navigate after toast is displayed
      }, 300);
    } catch (error) {
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

      // Update the toast based on specific errors
      switch (errorMessage) {
        case "User not found, please sign up":
          toast.update(loginToast, {
            render: "User not found. Please sign up to create an account.",
            type: "info",
            isLoading: false,
            autoClose: 3000,
          });
          break;

        case "User not verified":
          verifyUser();
          toast.update(loginToast, {
            render: "User not verified. Please verify your email to proceed.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          break;

        case "Incorrect password":
          toast.update(loginToast, {
            render: "The password you entered is incorrect. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          break;

        default:
          toast.update(loginToast, {
            render: `Error: ${errorMessage}`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
      }
    }
  };

  const handleVerifyEmail = () => {
    const verifyingEmailToast = toast.loading("Verifying the email...");

    verifyEmailApi({
      body: {
        email: verificationEmail,
      },
    })
      .then((response) => {
        setEmailVerification(true); // Update state on success

        // Update the toast to indicate success
        toast.update(verifyingEmailToast, {
          render: "Enter the code sent to your email.",
          type: "success",
          isLoading: false,
          autoClose: 5000, // Automatically close after 5 seconds
        });
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
        // Update the toast to indicate failure
        toast.update(verifyingEmailToast, {
          render: `Error! ${error.message} Please try again.`,
          type: "error",
          isLoading: false,
          autoClose: 5000, // Automatically close after 5 seconds
        });
      });
  };

  const resetStates = () => {
    setCode(["", "", "", "", "", ""]);
    setVerificationEmail("");
    setNewPassword("");
    setVerifyPassword("");
    setEmailVerification(false);
  };
  const handleResetPassword = () => {
    const joinedCode = code.join(""); // Combine the code array into a single string
    const resetToast = toast.loading("Processing your password reset...");
    if (newPassword !== verifyPassword) {
      toast.update(resetToast, {
        render: "Both passwords don't match.",
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
      return;
    }

    resetPasswordApi({
      body: {
        email: verificationEmail,
        code: joinedCode,
        newPassword: newPassword,
      },
    })
      .then((response) => {
        toast.update(resetToast, {
          render: "Your password has been successfully reset!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        setPasswordReset(false);
        resetStates();
      })
      .catch((error) => {
        toast.update(resetToast, {
          render: `An error occurred: ${
            error.message || "Unable to reset the password. Please try again."
          }`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
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
        <div className="col-md-6 col-12 row g-0 d-flex align-items-center justify-content-center">
          <div className="col-10 login-card p-5 border rounded">
            <div className={`login-heading ${resetPassword ? "d-none" : ""}`}>
              <h3 className="text-center">Welcome Back</h3>
              <p className="mb-4 text-center text-green">Login to Agino</p>
            </div>
            <div className={`login-heading ${!resetPassword ? "d-none" : ""}`}>
              <h3 className="text-center">Reset Password</h3>
            </div>
            <form
              className={resetPassword ? "d-none" : ""}
              onSubmit={handleSubmit}
              noValidate
            >
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
                    disabled={emailDisabled}
                    onChange={(e) => setUserEmail(e.target.value)}
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
                    disabled={passwordDisabled}
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

              {/* sdsd */}
              <div className={` ${showVerification ? "" : "d-none"}`}>
                {/* 2FA Code Input Fields */}
                <p className="text-center mt-3">
                  Enter the code recieved via the{" "}
                  <span className="text-green">email</span>
                </p>
                <div className="d-flex justify-content-center mt-3">
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
                  className="w-100 btn-green p-1 rounded mt-2"
                  onClick={() => verifyCode()}
                >
                  Verify account and login
                </button>
              </div>

              <div
                className={`buttons-group ${showVerification ? "d-none" : ""}`}
              >
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
                {/* Forgot Password Link */}
                <div
                  className="text-start mt-3"
                  onClick={() => setPasswordReset(true)}
                >
                  <a className="text-decoration-none text-muted forgot-password-text">
                    Forgot Password?
                  </a>
                </div>
              </div>
            </form>
            {/* Reset Password Form */}
            <form className={!resetPassword ? "d-none" : ""} noValidate>
              <div className={`my-3 ${emailVerified ? `d-none` : ``}`}>
                <div className="input-group justify-content-center">
                  <span className="input-group-text">
                    <FontAwesomeIcon className="icon-width" icon={faEnvelope} />
                  </span>
                  <input
                    type="email"
                    className="form-control p-2"
                    placeholder={"Enter your registered Email Id"}
                    value={verificationEmail}
                    name="email"
                    onChange={(e) => setVerificationEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={!emailVerified ? "d-none" : ""}>
                {/* 2FA Code Input Fields */}
                <p className="text-center mt-3">
                  Enter the code recieved via the{" "}
                  <span className="text-green">email</span>
                </p>
                <div className="d-flex justify-content-center mt-3">
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
                {/* New Password Input */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon className="icon-width" icon={faLock} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control p-2"
                      placeholder="Enter New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} // Update state
                      name="newPassword"
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

                {/* Verify Password Input */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon className="icon-width" icon={faLock} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control p-2"
                      placeholder="Re-enter New Password"
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)} // Update state
                      name="verifyPassword"
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
              </div>
              {/* Submit Button */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <button
                    type="button"
                    className={`btn-green w-100 rounded p-1 ${
                      loading ? "btn-green-disabled" : ""
                    }`}
                    disabled={loading}
                    onClick={
                      emailVerified ? handleResetPassword : handleVerifyEmail
                    }
                  >
                    {emailVerified ? "Reset Password" : "Verify Email"}
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn-black w-100 p-1 rounded"
                    onClick={() => {
                      setPasswordReset(false);
                      resetStates();
                    }}
                  >
                    Login
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;

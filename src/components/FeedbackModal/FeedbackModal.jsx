import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import createApiCall from "../api/api";
import { toast, ToastContainer } from "react-toastify";

function FeedbackModal({ isVisible, onClose }) {
  const [rating, setRating] = useState(0);
  // const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [loading, setIsLoading] = useState(false);

  const handleRating = (star) => {
    setRating(star);
    setIsValid(true);
  };

  // const handleFileChange = (event) => {
  //   setFile(event.target.files[0]);
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const base64String = reader.result;
  //       setFile(base64String);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
    if (event.target.value.trim() !== "") {
      setIsValid(true);
    }
  };

  const handleSubmit = () => {
    // Check if feedback and rating are provided
    if (!feedback.trim() || !rating) {
      setIsValid(false); // Mark as invalid if missing required fields
      return;
    }

    // Submit logic here (e.g., sending data)
    const feedbackApiCall = createApiCall("api/feedback", "POST");
    const feedbackToast = toast.loading("Submitting your response");
    const appData = JSON.parse(localStorage.getItem("appData"));
    const token = appData?.token;

    setIsLoading(true);
    feedbackApiCall({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        feedback: feedback,
        rating: rating,
        // file: file ? file : "",
      },
    })
      .then((response) => {
        setIsLoading(false);
        // Update the toast on success
        toast.update(feedbackToast, {
          render: "Your feedback has been submitted",
          type: "success",
          isLoading: false,
          autoClose: 500,
        });
      })
      .catch(async (error) => {
        setIsLoading(false);
        toast.update(feedbackToast, {
          render: "Opps an error occured",
          type: "error",
          isLoading: false,
          autoClose: 200,
        });
      });

    setTimeout(() => {
      resetStates();
      onClose();
    }, 3000);
  };

  const resetStates = () => {
    setRating(0);
    // setFile(null);
    setFeedback("");
    setIsValid(true);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <ToastContainer />
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">We value your feedback!</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={resetStates}
              ></button>
            </div>
            <div className="modal-body">
              <p>Please rate your experience: *</p>
              <div className="d-flex justify-content-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    size="2x"
                    className={`me-2 ${
                      star <= rating ? "text-green" : "text-secondary"
                    }`}
                    onClick={() => handleRating(star)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
              {/* Handle textarea change (capturing content) */}
              <textarea
                className="form-control"
                rows="4"
                placeholder="Share your experience *"
                value={feedback} // Bind the state to the textarea value
                onChange={handleFeedbackChange} // Capture changes in the textarea
              ></textarea>
              <small className={`text-danger ${isValid ? "invisible" : ""}`}>
                Please select all the required fields
              </small>
              {/* <div className="mb-3">
                <label htmlFor="feedbackFile" className="form-label">
                  Upload an image:
                </label>
                <input
                  type="file"
                  id="feedbackFile"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div> */}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-green p-1 rounded"
                onClick={handleSubmit}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default FeedbackModal;

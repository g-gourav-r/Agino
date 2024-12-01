import { Link } from "react-router-dom";

const SessionExpired = () => {
  return (
    <>
      <div className="row g-0 vh-100 authPageWrapper">
        <div className="col-12 row g-0 d-flex align-items-center justify-content-center">
          <div className="col-10 login-card p-5 border rounded">
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <h2>Your session has expired</h2>
              <p>
                Please <span className="text-green">log in</span> again to
                continue.
              </p>
              <button
                className="btn-green rounded p-1"
                onClick={() => (window.location.href = "/login")}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionExpired;

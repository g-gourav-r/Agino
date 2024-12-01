const NotFoundPage = () => {
  return (
    <div className="row g-0 vh-100 authPageWrapper">
      <div className="col-12 row g-0 d-flex align-items-center justify-content-center">
        <div className="col-10 login-card p-5 border rounded">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1>404</h1>
            <p>Oops! The page you're looking for doesn't exist.</p>
            <a
              className="text-green"
              href="/home"
              style={{ textDecoration: "underline" }}
            >
              Go back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

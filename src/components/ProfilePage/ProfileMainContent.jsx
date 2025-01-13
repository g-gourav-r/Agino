import React, { useEffect } from "react";
import createApiCall, { GET, PUT } from "../api/api";
import { faFontAwesome } from "@fortawesome/free-brands-svg-icons";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormControl } from "react-bootstrap";

function ProfileMainContent() {
  const fetchUserDetailsApi = createApiCall("user", GET);
  const updateUserDetailsApi = createApiCall("user", PUT);

  const appData = JSON.parse(localStorage.getItem("appData"));
  const token = appData?.token;

  useEffect(() => {
    fetchUserDetailsApi({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }, []);

  return (
    <>
      <div className="user-profile p-1">
        <h4 className="text-center mt-1">
          My <span className="text-green">Profile</span>
        </h4>
        <div className="profile-image d-flex justify-content-center p-2">
          <div
            style={{
              width: "200px",
              height: "200px",
              border: "2px solid #ccc",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative", // Required for positioning the pencil icon
            }}
            className="p-1"
          >
            <img
              src="/images/uifaces-handdrawn-image.jpg"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
              alt="Profile"
            />
            {/* Pencil icon */}
            <div
              style={{
                position: "absolute",
                bottom: "-20px",
                width: "40px",
                height: "40px",
                backgroundColor: "#fff",
                border: "2px solid #ccc", // Circle border
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Optional shadow for better look
                cursor: "pointer", // Indicate it’s clickable
              }}
            >
              <FontAwesomeIcon icon={faPencil} className="text-green" />
            </div>
          </div>
        </div>

        <div
          className="profile-details card p-4 shadow mt-4"
          style={{ borderRadius: "10px" }}
        >
          <table className="table table-borderless">
            <tbody>
              <tr>
                <td>
                  <strong>Name</strong>
                </td>
                <td className="text-success">John Doe</td>
                <td className="text-end">
                  <FontAwesomeIcon icon={faPencil} />
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Username</strong>
                </td>
                <td className="text-success">johndoe</td>
                <td className="text-end">
                  <FontAwesomeIcon icon={faPencil} />
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Member Since</strong>
                </td>
                <td className="text-success">01/01/2021</td>
                <td className="text-end">
                  <i
                    className="fas fa-pencil-alt text-secondary"
                    style={{ opacity: 0.5 }}
                  ></i>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Profile Last Edited</strong>
                </td>
                <td className="text-success">01/01/2021</td>
                <td className="text-end">
                  <i
                    className="fas fa-pencil-alt text-secondary"
                    style={{ opacity: 0.5 }}
                  ></i>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Email</strong>
                </td>
                <td className="text-success">email@email.com</td>
                <td className="text-end">
                  <FontAwesomeIcon icon={faPencil} />
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Phone</strong>
                </td>
                <td className="text-success">1234567890</td>
                <td className="text-end">
                  <FontAwesomeIcon icon={faPencil} />
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Change Password</strong>
                </td>
                <td className="text-success">
                  {" "}
                  <button className="btn-green p-1 rounded">
                    Change Password
                  </button>
                </td>
                <td className="text-end">
                  <FontAwesomeIcon icon={faPencil} />
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Enable 2FA</strong>
                </td>
                <td className="text-success">
                  {" "}
                  <button className="btn-green p-1 rounded">
                    Change Password
                  </button>
                </td>
                <td className="text-end">
                  <FontAwesomeIcon icon={faPencil} />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="d-flex justify-content-end mt-4">
            <button className="btn-black rounded p-1">Save Changes</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileMainContent;

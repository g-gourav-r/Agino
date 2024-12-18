import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function DashboardSidebar() {
  return (
    <div className="d-flex align-items-center h-100">
      <center>
        <h2 className="ms-2">
          <FontAwesomeIcon icon={faScrewdriverWrench} className="me-2" />{" "}
          <span className="text-green">Dashboard</span>
          <h2>is under construction</h2>
        </h2>
      </center>
    </div>
  );
}

export default DashboardSidebar;

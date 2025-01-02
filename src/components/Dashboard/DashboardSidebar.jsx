import {
  faRocket,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function DashboardSidebar() {
  return (
    <div className="d-flex align-items-center h-100">
      <div className="text-center">
        <h2 className="ms-2">
          <FontAwesomeIcon icon={faScrewdriverWrench} className="me-2" />
          <span className="text-green">Dashboard</span>{" "}
        </h2>{" "}
        <h3>is under construction</h3>
        <p className="mx-2 text-start mt-3">
          We're excited to share this early glimpse of the{" "}
          <span className="text-green">Agino Dashboard</span>. Our team is
          working hard behind the scenes to bring you a smooth and seamless
          experience. Stay tuned for updates.
        </p>
        <p className="mx-2 text-start">
          We can't wait to show you what's coming next!
          <FontAwesomeIcon icon={faRocket} className="text-green ms-2" />
        </p>
      </div>
    </div>
  );
}

export default DashboardSidebar;

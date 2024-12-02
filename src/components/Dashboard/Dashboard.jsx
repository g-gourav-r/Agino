import WindowTemplate from "../WindowTemplate";
import DashboardMainContent from "./DashboardMainContent";
import DashboardSidebar from "./DashboardSidebar";

function Dashboard() {
  return (
    <WindowTemplate
      mainContent={<DashboardMainContent />}
      sideBar={<DashboardSidebar />}
    />
  );
}

export default Dashboard;

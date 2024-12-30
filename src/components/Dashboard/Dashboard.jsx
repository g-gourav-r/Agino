import { useState } from "react";
import WindowTemplate from "../WindowTemplate";
import DashboardMainContent from "./DashboardMainContent";
import DashboardSidebar from "./DashboardSidebar";

function Dashboard() {
  const [selectedDataSource, setSelectedDataSource] = useState("");

  return (
    <WindowTemplate
      mainContent={
        <DashboardMainContent setSelectedDataSource={setSelectedDataSource} />
      }
      sideBar={<DashboardSidebar selectedDataSource={selectedDataSource} />}
      currentPage={"dashboard"}
    />
  );
}

export default Dashboard;

import React from "react";
import WindowTemplate from "../WindowTemplate";
import DataSourceSideBar from "./DataSourceSideBar";
import DataSourceMainContent from "./DataSourceMainContent";
import { useEffect, useState } from "react";

function DataSource() {
  const [refreshDataSourceSideBar, setRefresh] = useState(false);
  return (
    <WindowTemplate
      currentPage={"data-source"}
      sideBar={
        <DataSourceSideBar
          refreshDataSourceSideBar={refreshDataSourceSideBar}
        />
      }
      mainContent={<DataSourceMainContent setRefresh={setRefresh} />}
    />
  );
}

export default DataSource;

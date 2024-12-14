import React from "react";
import WindowTemplate from "../WindowTemplate";
import DataSourceSideBar from "./DataSourceSideBar";
import DataSourceMainContent from "./DataSourceMainContent";
import { useEffect, useState } from "react";

function DataSource() {
  const [refreshDataSourceSideBar, setRefresh] = useState(false);
  const [showDataBaseTable, setShowDataBaseTable] = useState(null);
  return (
    <WindowTemplate
      currentPage={"data-source"}
      sideBar={
        <DataSourceSideBar
          refreshDataSourceSideBar={refreshDataSourceSideBar}
          setShowDataBaseTable={setShowDataBaseTable}
        />
      }
      mainContent={
        <DataSourceMainContent
          setRefresh={setRefresh}
          showDataBaseTable={showDataBaseTable}
        />
      }
    />
  );
}

export default DataSource;

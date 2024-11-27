import WindowTemplate from "../WindowTemplate";
import ChatSidebar from "../Chat/ChatSidebar";
import DataSourceMainContent from "../DataSource/DataSourceMainContent";
function HomePage() {
  return (
    <WindowTemplate
      sideBar={<ChatSidebar />}
      mainContent={<DataSourceMainContent />}
    />
  );
}

export default HomePage;

import WindowTemplate from "../WindowTemplate";
import HomePageMainContent from "./HomePageMainContent";
import HomePageSidebar from "./HomePageSidebar";

function HomePage() {
  return (
    <WindowTemplate
      sideBar={<HomePageSidebar />}
      mainContent={<HomePageMainContent />}
    />
  );
}

export default HomePage;

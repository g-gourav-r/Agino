import { Button, Nav, NavItem } from "reactstrap";
import user from "../assets/images/user.jpg";
import userBanner from "../assets/images/UserBanner.jpg";

const SideBarBlank = () => {
    const showMobilemenu = () => {
        document.getElementById("sidebarArea").classList.toggle("showSidebar");
    };

    return (
        <div>
            <div className="d-flex align-items-center"></div>
            <div
                className="profilebg"
                style={{ background: `url(${userBanner}) no-repeat` }}
            >
                <div className="p-3 d-flex">
                    <img src={user} alt="user" width="50" className="rounded-circle" />
                    <Button
                        color="white"
                        className="ms-auto text-white d-lg-none"
                        onClick={() => showMobilemenu()}
                    >
                        <i className="bi bi-x"></i>
                    </Button>
                </div>
                <div className="bg-dark text-white p-2 opacity-75">Gourav R</div>
            </div>
            <div className="p-3 my-2 py-4  bg-light" style={{ height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
               {/* <Nav vertical className="sidebarNav">
                         <NavItem className="border-bottom mb-2">
                            <span className="d-inline-block text-wrap p-2">Item 1</span>
                        </NavItem>
                        <NavItem className="border-bottom mb-2">
                            <span className="d-inline-block text-wrap p-2">Item 2</span>
                        </NavItem>
                </Nav> */}
            </div>
        </div>
    );
};

export default SideBarBlank;

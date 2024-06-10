import { Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench, faHiking, faInfoCircle, faNewspaper, faUserPlus, faHandHoldingDollar } from "@fortawesome/free-solid-svg-icons";
import {
    BrowserRouter as Router,
    NavLink,
    Link
} from "react-router-dom";
import { Button } from 'antd';
import LogoCLB from '../assets/images/Logo-CLBTinhNguyenSVDuyTan.png';
import '../assets/styles/navbar.css';
// Redux Imports
import { connect } from 'react-redux';

const Header = ({ isLogin, fullName, avatarPath, viewtoken, captchaToken, isdefaultpasswd }) => {
    return (
        <div>
            <Navbar className="navbar container-fluid nav" bg="primary" expand="lg">
                <Link className="logo" as={NavLink} to={"/"}>
                    <img className="logo" src={LogoCLB} height={45} />
                </Link>
                <Navbar.Toggle className={"navbar-toggler"} />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className={"me-auto navbaritem  nav navbar-nav mx-auto"}>
                        <Nav.Link as={NavLink} to={"/newspaper"} ><FontAwesomeIcon style={{ marginRight: 2 }} icon={faNewspaper} />Tin Tức</Nav.Link>

                        <Nav.Link as={NavLink} to={"/activities"} ><FontAwesomeIcon style={{ marginRight: 2 }} icon={faHiking} />Hoạt Động</Nav.Link>

                        <Nav.Link as={NavLink} to={"/recruitment"} ><FontAwesomeIcon style={{ marginRight: 2 }} icon={faUserPlus} />Tuyển Thành Viên</Nav.Link>

                        <Nav.Link as={NavLink} to={"/dtusvctool"} ><FontAwesomeIcon style={{ marginRight: 2 }} icon={faScrewdriverWrench} />Công Cụ</Nav.Link>


                        <Nav.Link as={NavLink} to={"/sponsor"} ><FontAwesomeIcon style={{ marginRight: 2 }} icon={faHandHoldingDollar} />Quyên Góp</Nav.Link> 
                    </Nav>
                    {
                        isLogin === true ?
                            <Link as={NavLink} to={"/dashboard"} className='navbarLinkHover' style={{textDecoration: "none"}}>
                                <div className={"userdropdown"} style={{ paddingLeft: 50, paddingRight: 50 }}>
                                    <img src={avatarPath} height={40} width={40} />
                                    <span>{fullName}</span>
                                </div>
                            </Link>
                            :
                            <Link className="col-md-4" as={NavLink} to={"/sign-in"}>
                                <div id="loginbutton">
                                    <Button className="btnloginclass" ><a><svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" className="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z" />
                                        <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                                    </svg>  Đăng Nhập</a>
                                    </Button>
                                </div>
                            </Link>
                    }
                </Navbar.Collapse>
            </Navbar>
        </div>
    );
};

const mapStateToProps = (state) => ({
    isLogin: state.isLogin,
    fullName: state.fullName,
    avatarPath: state.avatarPath,
    permission: state.permission,
    viewtoken: state.viewtoken,
    captchaToken: state.captchaToken,
    isdefaultpasswd: state.isdefaultpasswd,
  });

export default connect(mapStateToProps)(Header);
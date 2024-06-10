import React, { useState } from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  menuClasses,
} from "react-pro-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faClockRotateLeft,
  faRankingStar,
  faPeopleGroup,
  faPeopleRoof,
  faIdCard,
  faUsersGear,
  faPersonCirclePlus,
  faPersonDigging,
  faFileInvoiceDollar,
  faMoneyBillTransfer,
  faHandHoldingDollar,
  faCircleCheck,
  faNewspaper,
  faScrewdriverWrench,
  faGear,
  faPanorama,
  faCircleInfo,
  faGavel,
  faInfo,
  faBuildingShield,
  faCreditCard,
  faFont,
  faLink,
  faQrcode,
  faDownload,
  faSchoolFlag,
  faPersonMilitaryRifle,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/SidebarMenuPage.css";
import { SidebarHeader } from "./SidebarHeader.js";
import { Typography } from "./StyledTypography.js";
import {
  BrowserRouter as Router,
  NavLink,
  useLocation,
} from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Affix, Button, Modal } from "antd";

const themes = {
  light: {
    sidebar: {
      backgroundColor: "#ffffff",
      color: "#607489",
    },
    menu: {
      menuContent: "#fbfcfd",
      icon: "#0098e5",
      hover: {
        backgroundColor: "#c5e4ff",
        color: "#44596e",
      },
      disabled: {
        color: "#9fb6cf",
      },
    },
  },
  dark: {
    sidebar: {
      backgroundColor: "#0b2948",
      color: "#8ba1b7",
    },
    menu: {
      menuContent: "#082440",
      icon: "#59d0ff",
      hover: {
        backgroundColor: "#00458b",
        color: "#b6c8d9",
      },
      disabled: {
        color: "#3e5e7e",
      },
    },
  },
};

// hex to rgba converter
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const SidebarMenu = ({
  fullName,
  avatarPath,
  permission,
  isDashBoard,
  onBreakPoint,
  onLogout,
  isLogoutLoading,
  onToggled,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [broken, setBroken] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [toggled, setToggled] = React.useState(false);
  const [theme, setTheme] = useState("light");
  const location = useLocation();

  const menuItemStyles = {
    root: {
      fontSize: "13px",
      fontWeight: 400,
    },
    icon: {
      color: themes[theme].menu.icon,
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
    },
    SubMenuExpandIcon: {
      color: "#b6b7b9",
    },
    subMenuContent: ({ level }) => ({
      backgroundColor:
        level === 0
          ? hexToRgba(
              themes[theme].menu.menuContent,
              hasImage && !collapsed ? 0.4 : 1
            )
          : "transparent",
    }),
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
      "&:hover": {
        backgroundColor: hexToRgba(
          themes[theme].menu.hover.backgroundColor,
          hasImage ? 0.8 : 1
        ),
        color: themes[theme].menu.hover.color,
      },
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };

  const handleBreakPointChange = (broken) => {
    setBroken(broken);
    onBreakPoint(broken);
  };

  const { confirm } = Modal;

  const LogoutConfirm = () => {
    confirm({
      title: "Đăng Xuất",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có thực sự muốn đăng xuất khỏi hệ thống không?",
      okText: "Đồng Ý",
      cancelText: "Huỷ",
      onOk() {
        onLogout();
      },
    });
  };

  const HandleToggled = (value) => {
    setToggled(value);
    onToggled(value);
  };

  return (
    <div
      className={
        "SidebarMenuCss " +
        (location.pathname === "/dashboard/user-info" && broken === false
          ? "SidebarMenuUserInfo"
          : "")
      }
      style={{
        direction: "ltr",
        minHeight: broken === false ? "calc(100vh - 218px)" : "0px",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => HandleToggled(false)}
        onBreakPoint={handleBreakPointChange}
        rtl={false}
        breakPoint="md"
        backgroundColor={hexToRgba(
          themes[theme].sidebar.backgroundColor,
          hasImage ? 0.9 : 1
        )}
        rootStyles={{
          color: themes[theme].sidebar.color,
        }}
        disabled={isDashBoard && isLogoutLoading}
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {isDashBoard ? (
            <div>
              <NavLink
                to="/dashboard/user-info"
                style={{ textDecoration: "none", background: "#fff" }}
              >
                <SidebarHeader
                  avatarPath={avatarPath}
                  fullName={fullName}
                  permission={permission}
                  style={{ marginBottom: "24px", marginTop: "16px" }}
                />
              </NavLink>
              <div style={{ flex: 1, marginBottom: "32px" }}>
                <div style={{ padding: "0 24px", marginBottom: "8px" }}>
                  <hr />
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    style={{
                      opacity: collapsed ? 0 : 0.8,
                      letterSpacing: "0.8px",
                    }}
                  >
                    Tổng Quan
                  </Typography>
                  <hr />
                </div>
                <Menu
                  menuItemStyles={menuItemStyles}
                  style={{ marginLeft: 15 }}
                >
                  <MenuItem
                    key={"/dashboard/ranking"}
                    icon={<FontAwesomeIcon icon={faRankingStar} />}
                    component={<NavLink to="/dashboard/ranking" />}
                  >
                    Bảng Xếp Hạng
                  </MenuItem>
                  <MenuItem
                    key={"/dashboard/activity-history"}
                    icon={<FontAwesomeIcon icon={faClockRotateLeft} />}
                    component={<NavLink to="/dashboard/activity-history" />}
                  >
                    Lịch Sử Hoạt Động
                  </MenuItem>
                  <MenuItem
                    key={"/dashboard/confirm"}
                    icon={<FontAwesomeIcon icon={faCircleCheck} />}
                    component={<NavLink to="/dashboard/confirm" />}
                  >
                    Xác Nhận Quỹ
                  </MenuItem>

                  
                  {/* <MenuItem
                                            key={"/dashboard/logout"}>
                                        </MenuItem> */}
                </Menu>
                {permission.roleName.includes("Thành Viên")?(<div style={{ padding: "0 24px", marginBottom: "8px" }}>
                  <hr />
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    style={{
                      opacity: collapsed ? 0 : 0.8,
                      letterSpacing: "0.8px",
                    }}
                  >
                    Quản Trị Viên
                  </Typography>
                  <hr />
                </div>):null}
                
                <Menu
                  menuItemStyles={menuItemStyles}
                  style={{ marginLeft: 15 }}
                >               
                  
                    {permission.permissions.includes(1001) ?
                  (<SubMenu
                    label="Quản Lý Thành Viên"
                    icon={<FontAwesomeIcon icon={faPeopleRoof} />}
                  >
                    <MenuItem
                      key={"/dashboard/member-list"}
                      icon={<FontAwesomeIcon icon={faPeopleGroup} />}
                      component={<NavLink to="/dashboard/member-list" />}
                    >
                      DS Thành Viên
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/member-card"}
                      icon={<FontAwesomeIcon icon={faIdCard} />}
                      component={<NavLink to="/dashboard/member-card" />}
                    >
                      Thẻ Thành Viên
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/member-users"}
                      icon={<FontAwesomeIcon icon={faUsersGear} />}
                      component={<NavLink to="/dashboard/member-users" />}
                    >
                      Tài Khoản
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/roles-manager"}
                      icon={<FontAwesomeIcon icon={faPersonMilitaryRifle} />}
                      component={<NavLink to="/dashboard/roles-manager" />}
                    >
                      Quản Lý Chức Vụ
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/recruitment-manager"}
                      icon={<FontAwesomeIcon icon={faPersonCirclePlus} />}
                      component={
                        <NavLink to="/dashboard/recruitment-manager" />
                      }
                    >
                      Tuyển Thành Viên
                    </MenuItem>
                  </SubMenu>):null}
                  {permission.permissions.includes(5001) ?
                  (<MenuItem
                    key={"/dashboard/activities"}
                    icon={<FontAwesomeIcon icon={faPersonDigging} />}
                    component={<NavLink to="/dashboard/activities-manager" />}
                  >
                    Quản Lý Hoạt Động
                  </MenuItem>):null}
                  {permission.permissions.includes(1101) ?(<SubMenu
                    label="Quản Lý Quỹ"
                    icon={<FontAwesomeIcon icon={faFileInvoiceDollar} />}
                  >
                    <MenuItem
                      key={"/dashboard/import-export-money"}
                      icon={<FontAwesomeIcon icon={faMoneyBillTransfer} />}
                      component={
                        <NavLink to="/dashboard/import-export-money" />
                      }
                    >
                      Nhâp/Xuất Quỹ
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/sponsorship-money"}
                      icon={<FontAwesomeIcon icon={faHandHoldingDollar} />}
                      component={<NavLink to="/dashboard/sponsorship-money" />}
                    >
                      Tiền Tài Trợ
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/bank-card"}
                      icon={<FontAwesomeIcon icon={faCreditCard} />}
                      component={<NavLink to="/dashboard/bank-card" />}
                    >
                      Thẻ Ngân Hàng
                    </MenuItem>
                  </SubMenu>):null}
                  {permission.permissions.includes(6001) ?(<MenuItem
                    key={"/dashboard/newspaper-manager"}
                    icon={<FontAwesomeIcon icon={faNewspaper} />}
                    component={<NavLink to="/dashboard/newspaper-manager" />}
                  >
                    Quản Lý Tin Tức
                  </MenuItem>):null}
                  {permission.permissions.includes(7001) ?(<MenuItem
                    key={"/dashboard/faculty-manager"}
                    icon={<FontAwesomeIcon icon={faSchoolFlag} />}
                    component={<NavLink to="/dashboard/faculty-manager" />}
                  >
                    Quản Lý Khoa/Viện
                  </MenuItem>):null}
                  
                  {/* <SubMenu
                    label="Quản Lý Hệ Thống"
                    icon={<FontAwesomeIcon icon={faGear} />}
                  >
                    <MenuItem
                      key={"/dashboard/banner-manager"}
                      icon={<FontAwesomeIcon icon={faPanorama} />}
                      component={<NavLink to="/dashboard/banner-manager" />}
                    >
                      Quản Lý Banner
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/font-manager"}
                      icon={<FontAwesomeIcon icon={faFont} />}
                      component={<NavLink to="/dashboard/font-manager" />}
                    >
                      Quản Lý Font
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/mydtu-manager"}
                      icon={<FontAwesomeIcon icon={faCircleInfo} />}
                      component={<NavLink to="/dashboard/mydtu-manager" />}
                    >
                      Giới Thiệu CLB
                    </MenuItem>

                    <MenuItem
                      key={"/dashboard/regulations"}
                      icon={<FontAwesomeIcon icon={faGavel} />}
                      component={<NavLink to="/dashboard/regulations" />}
                    >
                      Nội Quy CLB
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/sys-info-manager"}
                      icon={<FontAwesomeIcon icon={faInfo} />}
                      component={<NavLink to="/dashboard/sys-info-manager" />}
                    >
                      Giới Thiệu Hệ Thống
                    </MenuItem>
                    <MenuItem
                      key={"/dashboard/policy-manager"}
                      icon={<FontAwesomeIcon icon={faBuildingShield} />}
                      component={<NavLink to="/dashboard/policy-manager" />}
                    >
                      Chính Sách Dữ Liệu
                    </MenuItem>
                  </SubMenu> */}
                </Menu>
              </div>
              <div style={{ paddingLeft: 15, paddingRight: 15 }}>
                    <Button
                      style={{ marginTop: 15 }}
                      icon={<FontAwesomeIcon icon={faRightFromBracket} />}
                      type="primary"
                      block
                      onClick={LogoutConfirm}
                      loading={isLogoutLoading}
                      danger
                    >
                      Đăng Xuất
                    </Button>
                  </div>
            </div>
          ) : (
            <div style={{ flex: 1, marginBottom: "32px" }}>
              <div style={{ padding: "0 24px", marginBottom: "8px" }}>
                <br />
                <Typography
                  variant="body1"
                  fontWeight={700}
                  style={{
                    opacity: collapsed ? 0 : 0.8,
                    letterSpacing: "0.8px",
                  }}
                >
                  Công Cụ
                </Typography>
                <hr />
              </div>
              <Menu menuItemStyles={menuItemStyles} style={{ marginLeft: 15 }}>
                <MenuItem
                  key={"/dtusvctool/short-link"}
                  icon={<FontAwesomeIcon icon={faLink} />}
                  component={<NavLink to="/dtusvctool/short-link" />}
                >
                  Rút Gọn Link
                </MenuItem>
                <MenuItem
                  key={"/dtusvctool/create-qr-code"}
                  icon={<FontAwesomeIcon icon={faQrcode} />}
                  component={<NavLink to="/dtusvctool/create-qr-code" />}
                >
                  Tạo Qr-Code
                </MenuItem>
                <MenuItem
                  key={"/dtusvctool/download-tool"}
                  icon={<FontAwesomeIcon icon={faDownload} />}
                  component={<NavLink to="/dtusvctool/download-tool" />}
                >
                  Ứng Dụng
                </MenuItem>
              </Menu>
            </div>
          )}
        </div>
      </Sidebar>
      <div style={{ marginBottom: "16px", marginTop: 15 }}>
        <Affix>
          {broken && (
            <div className="btn-toggle" onClick={() => HandleToggled(true)}>
              <FontAwesomeIcon icon={faBars} />
            </div>
          )}
        </Affix>
      </div>
      <div></div>
    </div>
  );
};
export default SidebarMenu;

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarMenu from "../components/SidebarMenu.js";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { API_URL } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from "axios";
import { login, logout } from "../Redux/actions/actions"; // Import các action creators
// Redux Imports
import { connect } from "react-redux";
import UserInfo from "../components/UserInfo.js";
import MemberRank from "../components/MemberRank.js";
import ActivityHistory from "../components/ActivityHistory.js";
import MemberList from "../components/MemberList.js";
import MemberCard from "../components/MemberCard.js";
import AccountList from "../components/AccountList.js";
import RolesManagerment from "../components/RolesManagerment.js";
import RecruitmentManager from "../components/RecruitmentManager.js";
import NewspaperManager from "../components/NewpaperManager.js";
import CreateActivity from "../components/CreateActivity.js";
import ActivitiesManager from "../components/ActivitiesManager.js";
import QRCodeGenerator from "../components/QRCodeGenerator.js";
import FacultyManager from "../components/FacultyManager.js";
import Bankcard from "../components/Bankcard.js";


import SendCertificate from "../components/SendCertificate.js";
function DashboardPage({
  isLogin,
  fullName,
  avatarPath,
  permission,
  viewtoken,
  isdefaultpasswd,
  logout,
  login,
}) {
  const navigate = useNavigate();
  permission = permission || [0];
  const [broken, setBroken] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [toggled, setToggled] = React.useState(false);
  const location = useLocation();

  const onLogout = async () => {
    if (isLogin === true) {
      const strAccessToken = GetCookieData(ACCESS_TOKEN);
      if (
        strAccessToken === null ||
        strAccessToken === undefined ||
        strAccessToken.length === 0
      ) {
        logout();
      } else {
        setLogoutLoading(true);
        const headers = {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: "Bearer " + strAccessToken,
        };
        const strApiURL = `${API_URL}api/Account/Logout`;
        await axios
          .get(strApiURL, {
            withCredentials: true,
            headers: headers,
            credentials: "same-origin",
          })
          .then((response) => {
            logout();
          })
          .catch((error) => {
            logout();
          });
        setLogoutLoading(false);
      }
    }
  };

  const ChangeBroken = (value) => {
    setBroken(value);
  };

  const onToggled = (value) => {
    setToggled(value);
  };

  // useEffect(() => {
  //   if (isLogin === false) {
  //     window.location.href = "/";
  //   }
  // }, []);

    useEffect(() => {
        if (isLogin === false) {
            window.location.href = '/';
        }
    }, [isLogin]);

    return (
        <div className='SidebarMenu-Main'>
            <div>
                <SidebarMenu
                    fullName={fullName}
                    avatarPath={avatarPath}
                    permission={permission}
                    isDashBoard={true}
                    onBreakPoint={ChangeBroken}
                    onLogout={onLogout}
                    onToggled={onToggled}
                    isLogoutLoading={logoutLoading}
                />
            </div>
            <div className="Routes" style={{maxWidth: (broken===false?"cal(85vw - 280px)":"85vw")}}>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard/user-info" />} />
                    <Route path="/user-info" element={<UserInfo isMyInfo={true} isBroken={broken} />} />
                    <Route path="/ranking" element={<MemberRank isMyInfo={true} isBroken={broken}  isToggled={toggled}/>} />
                    <Route path="/activity-history" element={<ActivityHistory x_bIsMyActivityHistory={true} isBroken={broken} />} />
                    <Route path="/member-list" element={<MemberList isBroken={broken} />} />
                    <Route path="/member-list/member-info*" element={<UserInfo isMyInfo={false} isBroken={broken} />} />
                    <Route path="/member-list/activity-history-member*" element={<ActivityHistory x_bIsMyActivityHistory={false} isBroken={broken} />} />
                    <Route path="/member-card" element={<MemberCard isBroken={broken}  isToggled={toggled}/>} />
                    <Route path="/member-users" element={<AccountList isBroken={broken} isToggled={toggled}/>} />
                    <Route path="/roles-manager" element={<RolesManagerment isBroken={broken} x_bIsToggled={toggled} />} />
                    <Route path="/recruitment-manager*" element={<RecruitmentManager isBroken={broken} x_bIsToggled={toggled} />} />
                    <Route path="/activities-manager*" element={<ActivitiesManager isBroken={broken} x_bIsToggled={toggled} />} />
                    <Route path="/newspaper-manager*" element={<NewspaperManager isBroken={broken} x_bIsToggled={toggled} />} />              
                    <Route path="/faculty-manager" element={<FacultyManager isBroken={broken} x_bIsToggled={toggled} />} />
                    <Route path="/bank-card" element={<Bankcard isBroken={broken} x_bIsToggled={toggled} />} />
                    <Route path="/sendcertificate/*" element={<SendCertificate isBroken={broken} x_bIsToggled={toggled} />} />
                </Routes>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
  isLogin: state.isLogin,
  fullName: state.fullName,
  avatarPath: state.avatarPath,
  permission: state.permission,
  viewtoken: state.viewtoken,
  isdefaultpasswd: state.isdefaultpasswd,
});
const mapDispatchToProps = {
  login,
  logout,
};
export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);

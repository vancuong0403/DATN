import './App.css';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import LoginPage from './pages/LoginPage.js';
import Newspaper from './pages/Newspaper.js';
import HomePage from './pages/HomePage.js';
import Activity from './pages/ActivityPage.js';
import Recruitment from './pages/RecruitmentPage.js';
import ToolPage from './pages/ToolPage.js';
import ContactUs from './pages/ContactUsPage.js';
import Sponsor from './pages/SponsorPage.js';
import Dashboard from './pages/DashboardPage.js';
import ShortLink from './pages/ShortLink.js';
import {
  notification
} from "antd";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import axios from 'axios';
// Redux Imports
import { connect } from 'react-redux';
import { API_URL } from "./Helper/TextHelper";
import { login, logout } from './Redux/actions/actions'; // Import các action creators
import { ACCESS_TOKEN, REFRESH_TOKEN, SetCooikeData, GetCookieData } from "./Helper/CookieHelper";
import RedirectShortLink from './pages/RedirectShortLink.js';
import ResetPasswd from './components/ResetPasswd.js';

function App({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login }) {
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, strTitle, strDescription) => {
    api[type]({
      message: strTitle,
      description: strDescription,
    });
  };

  const errorHelper = async (data) => {
    if (data === null || data === undefined) {
      openNotificationWithIcon('error', "Mất kết nối với máy chủ", "Không thể kết nối với máy chủ, vui lòng thử lại sau ít phút hoặc báo cáo với BCN.");
      logout();
      return;
    }

    if (data.response && data.response.status) {
      if (data.response && data.response.status && data.response.status === 401) {
        logout();
        return;
      }
      else if (data.response && data.response.status && data.response.status === 404) {
        logout();
        return;
      }
      else {
        openNotificationWithIcon('error', `Lỗi ${data.response.status}`, data.response.error ? data.response.error : data.response.message ? data.response.message : "Xuất hiện lỗi không xác định.");
        logout();
        return;
      }
    }

    if (data.errorsCode && data.errorsCode === 100002) {
      // refresh token
      window.location.href = window.location.href;
    }
    else if (data.errorsCode && data.errorsCode === 100004) {
      openNotificationWithIcon('error', "Phiên đăng nhập hết hạn", "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.");
      logout();
    }
    else if (data.errorsCode && data.errorsCode === 200001) {
      openNotificationWithIcon('error', "Thông báo hệ thống", "Hệ thống đang bảo trì, vui lòng quay lại sau ít phút.");
    }
    else if ((data.error && (data.error === "ERR_NETWORK" || data.error === "ERR_CONNECTION_REFUSED")) ||
      (data.name && data.name === "AxiosError")) {
      openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", "Mất kết nối với máy chủ. Vui lòng thử lại sau ít phút");
      logout();
    }
    else {
      openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", data.errors[0]);
    }
  }

  const refreshToken = async () => {
    const strRefreshToken = GetCookieData(REFRESH_TOKEN);
    if (strRefreshToken === null || strRefreshToken === undefined || strRefreshToken.length === 0) {
      logout();
    }
    else {
      const headers = {
        "Content-Type": "application/json",
        "accept": "*/*"
      }
      var requestData = {
        'refeshToken': strRefreshToken,
      };

      const strApiURL = `${API_URL}api/Account/RefreshAccessToken`;
      try {
        const response = await axios.post(strApiURL, JSON.stringify(requestData), { headers });
        if (response.data.isSuccess === true) {
          SetCooikeData(ACCESS_TOKEN, response.data.dataValue.accessToken);
          login(fullName, avatarPath, permission, response.data.dataValue.viewFileToken, isdefaultpasswd);
        }
        else {
          logout();
        }
      }
      catch (error) {
        logout();
      }
    }
  }

  const checkOnlineStatus = async () => {
    try {
      if (isLogin === true) {
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        if (strAccessToken === null || strAccessToken === undefined || strAccessToken.length === 0) {
          logout();
        }
        else {
          const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + strAccessToken
          }
          const strApiURL = `${API_URL}api/Account/CheckLogin`;
          await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
            .then((response) => {
              console.log(response);
              if (response.data.isSuccess === false) {
                errorHelper(response.data);
              }
            })
            .catch((error) => {
              if (error.response && error.response.status && error.response.status === 401) {
                refreshToken();
              }
              else {
                errorHelper(error);
              }
            });
        }
      }
    } catch (error) {
      errorHelper(error);
    }
  };

  useEffect(() => {
    checkOnlineStatus();
  }, []);

  

  return (
    <div style={{maxWidth: "100vw"}}>
      {contextHolder}
      <Router>
        <div className="App">
          <Header />
          <div>
            <Routes>
              <Route exact path="/" Component={HomePage} />
              <Route path="/sign-in" Component={LoginPage} />
              <Route path="/newspaper/*" Component={Newspaper} />
              <Route path="/activities/*" Component={Activity} />
              <Route path="/recruitment" Component={Recruitment} />
              <Route path="/dtusvctool/*" Component={ToolPage} />
              <Route path="/contactus" Component={ContactUs} />
              <Route path="/sponsor/*" Component={Sponsor} />
              <Route path="/dashboard/*" Component={Dashboard} />
              <Route path="/forgotpasswd?*" Component={ResetPasswd} />
              <Route path="*" Component={RedirectShortLink} /> 
            </Routes>
          </div>
        </div>
        <div className='footer'>
          <Footer />
        </div>
      </Router>
    </div>
  );
};
const mapStateToProps = (state) => ({
  isLogin: state.isLogin,
  fullName: state.fullName,
  avatarPath: state.avatarPath,
  permission: state.permission,
  viewtoken: state.viewtoken
});
const mapDispatchToProps = {
  login,
  logout
};

export default connect(mapStateToProps, mapDispatchToProps)(App);

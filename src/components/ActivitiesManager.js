import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Card } from "antd";

import { login, logout } from "../Redux/actions/actions"; // Import các action creators
// Redux Imports
import { connect } from "react-redux";
import { Typography } from "./StyledTypography";
import "../assets/styles/ActivityHistory.css";
import { Route, Routes } from "react-router-dom";

import CreateActivity from "./CreateActivity";
import ActivityList from "./ActivityList";
import ActivityAdminTopic from "./ActivityAdminTopic";

const ActivitiesManager = ({ isBroken, isToggled }) => {
  return (
    <div>
      <Helmet>
        <title>Quản Lí Hoạt Động</title>
      </Helmet>
      <div
        className={"userinfo-main"}
        style={{
          marginLeft: isBroken ? -30 : 15,
          marginRight: 15,
          marginBottom: 15,
          marginTop: 15,
        }}
      >
        <div className={"userinfo-container"}>
          <Card className="dashboard-header">
            <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
              Quản lí hoạt động
            </Typography>
          </Card>
          <Routes>
            <Route
              path="/"
              element={
                <ActivityList isBroken={isBroken} x_bIsToggled={isToggled} />
              }
            />
            <Route
              path="/create-activity"
              element={
                <CreateActivity isBroken={isBroken} isToggled={isToggled} />
              }
            />
            <Route
              path="/activitieslist?*"
              element={
                <ActivityAdminTopic isBroken={isBroken} isToggled={isToggled} />
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};
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

export default connect(mapStateToProps, mapDispatchToProps)(ActivitiesManager);

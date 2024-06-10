import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
    notification,
    Card
} from "antd";
import { API_URL } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import { Typography } from './StyledTypography';
import '../assets/styles/ActivityHistory.css';
import {
    BrowserRouter as Router,
    Route,
    Routes,
} from "react-router-dom";
import RecruitmentManagerList from './RecruitmentManagerList';
import CreateRecruitment from './CreateRecruitment';
import RecruitmentAdminTopic from './RecruitmentAdminTopic';

const RecruitmentManager = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isBroken, isToggled }) => {
    return (
        <div>
            <Helmet>
                <title>Tuyển Thành Viên</title>
            </Helmet>
            <div className={'userinfo-main'} style={{ marginLeft: isBroken ? -30 : 15, marginRight: 15, marginBottom: 15, marginTop: 15 }}>
                <div className={'userinfo-container'}>
                    <Card className='dashboard-header'>
                        <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
                            Tuyển Thành Viên
                        </Typography>
                    </Card>
                    <Routes>
                        <Route path="/" element={<RecruitmentManagerList isBroken={isBroken} x_bIsToggled={isToggled} />} />
                        <Route path="/create-recruitment" element={<CreateRecruitment isBroken={isBroken} isToggled={isToggled} />} />
                        <Route path="/recruitment?*" element={<RecruitmentAdminTopic isBroken={isBroken} isToggled={isToggled} />} />
                    </Routes>
                </div>
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
    isdefaultpasswd: state.isdefaultpasswd
});
const mapDispatchToProps = {
    login,
    logout
};

export default connect(mapStateToProps, mapDispatchToProps)(RecruitmentManager);
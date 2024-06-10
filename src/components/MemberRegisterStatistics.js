import React, { useEffect, useState } from 'react';
import { API_URL } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import { Typography } from './StyledTypography';

const MemberRegisterStatistics = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isBroken, isToggled, x_lstMemberList }) =>{
    return(
        <div>
            Số Liệu Thống Kê
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

export default connect(mapStateToProps, mapDispatchToProps)(MemberRegisterStatistics);
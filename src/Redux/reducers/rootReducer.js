import { LOGIN, LOGOUT } from '../actions/actionTypes';
import {LogOutClearCookie} from "../../Helper/CookieHelper";

const initialState = {
    isLogin: false,
    fullName: '',
    avatarPath: '',
    permission: {permissions:[0],roleName:"Thành Viên"},
    viewtoken: '',
    isdefaultpasswd: true
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                isLogin: true,
                fullName: action.payload.fullName,
                avatarPath: action.payload.avatarPath,
                permission: action.payload.permission,
                viewtoken: action.payload.viewtoken,
                isdefaultpasswd: action.payload.isdefaultpasswd
            };
        case LOGOUT:
            LogOutClearCookie();
            return initialState;
        default:
            return state;
    }
};

export default rootReducer;
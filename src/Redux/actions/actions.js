import { LOGIN, LOGOUT } from './actionTypes';

export const login = (fullName, avatarPath, permission, viewtoken, isdefaultpasswd) => ({
  type: LOGIN,
  payload: { fullName, avatarPath, permission, viewtoken, isdefaultpasswd }
});

export const logout = () => ({
  type: LOGOUT
});
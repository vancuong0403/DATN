import Cookies from "js-cookie";

export const ACCESS_TOKEN = "Accsess_Token";
export const REFRESH_TOKEN = "Refresh_Token";
export const ACCOUNT_ID = "Account_Id";
export const CAPTCHA_TOKEN = "Captcha_Token";
export const CAPTCHA_TOKEN_SLINK = "Captcha_Token_ShortLink";
export const MEMBER_ID = "Member_Id";
export const ROLE = "Role";

export const SetCooikeData = (strKey, data) => {
  const fullKey = `dtusvc_${strKey}`;

  Cookies.set(fullKey, data, { path: "/", expires: 7 });
};

export const GetCookieData = (strKey) => {
  const fullKey = `dtusvc_${strKey}`;

  const responseData = Cookies.get(fullKey);
  return responseData;
};

export const RemoveCookie = (strKey) => {
  const fullKey = `dtusvc_${strKey}`;

  const responseData = Cookies.remove(fullKey);
};

export const LogOutClearCookie = () => {
  RemoveCookie(ACCESS_TOKEN);
  RemoveCookie(REFRESH_TOKEN);
  RemoveCookie(ACCOUNT_ID);
  RemoveCookie(ROLE);
};

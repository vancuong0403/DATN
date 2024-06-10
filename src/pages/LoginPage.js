import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../assets/styles/signinstyle.css";
import {
    Button,
    Row,
    Col,
    notification,
    Form,
    Input,
    Card
} from "antd";
import { UserOutlined, LockOutlined, SearchOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { API_URL, GetFullPath } from "../Helper/TextHelper";
import { ACCESS_TOKEN, REFRESH_TOKEN, ACCOUNT_ID, CAPTCHA_TOKEN, MEMBER_ID,ROLE, SetCooikeData, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';

const LoginPage = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login }) => {
    const [api, contextHolder] = notification.useNotification();
    const [isLoginType, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [captChaImage, setCaptChaImage] = useState(null);
    const [captChaToken, setCaptChaToken] = useState("");
    const [loginform] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();

    const openNotificationWithIcon = (type, strTitle, strDescription) => {
        api[type]({
            message: strTitle,
            description: strDescription,
        });
    };

    function summit() {
        setIsLoading(true);
        if (isLoginType === true) {
            signin();
        }
        else {
            fogotPasswd();
        }
    }

    const errorHelper = async (data) => {

        if (data === null || data === undefined) {
          openNotificationWithIcon('error', "Mất kết nối với máy chủ", "Không thể kết nối với máy chủ, vui lòng thử lại sau ít phút hoặc báo cáo với BCN.");
          return;
        }
    
        if (data.errorsCode === 100002) {
          // refresh token
          refreshToken();
        }
        else if (data.errorsCode === 100004) {
          openNotificationWithIcon('error', "Phiên đăng nhập hết hạn", "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.");
          logout();
          var previousPageState = location.state && location.state.previousPage;
          previousPageState ? navigate(-1) : navigate('/');
        }
        else if (data.errorsCode === 200001) {
          openNotificationWithIcon('error', "Thông báo hệ thống", "Hệ thống đang bảo trì, vui lòng quay lại sau ít phút.");
          // Route to SYSTEM_MAINTENANCE page
        }
        else {
          openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", data.errors[0]);
        }
      }

    async function signin() {
        var strUsername = loginform.getFieldValue("username");
        var strPasswd = loginform.getFieldValue("password");

        if (strUsername === undefined || strUsername.replace(/ /g, '') === '') {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", 'Vui lòng nhập tên tài khoản!');
            setIsLoading(false);
            return;
        }
        if (strPasswd === undefined || strPasswd.replace(/ /g, '') === '') {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", 'Vui lòng nhập mật khẩu!');
            setIsLoading(false);
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*"
        }
        var requestData = {
            'username': strUsername,
            'password': strPasswd,
        };
        await axios.post(API_URL + 'api/Account/Authenticate', JSON.stringify(requestData), { headers })
            .then((response) => {
                if (response.data.isSuccess === true) {
                    getCaptCha();
                    openNotificationWithIcon('success', response.data.message);
                    const avatarURL = GetFullPath(response.data.dataValue.avatarPath, response.data.dataValue.viewFileToken);
                    const memberName = `${response.data.dataValue.firstName} ${response.data.dataValue.lastName}`;
                    // update redux data
                    login(memberName, avatarURL, response.data.dataValue.role, response.data.dataValue.viewFileToken, response.data.dataValue.isDefaultPassword);
                    // set token to cookie
                    SetCooikeData(ACCESS_TOKEN, response.data.dataValue.accessToken);
                    SetCooikeData(REFRESH_TOKEN, response.data.dataValue.refreshToken);
                    SetCooikeData(ACCOUNT_ID, response.data.dataValue.accountId);
                    SetCooikeData(MEMBER_ID, response.data.dataValue.memberId);
                    SetCooikeData(ROLE, response.data.dataValue.role.permissions);
                    // console.log(response.data.dataValue.role.permissions);
                    setIsLoading(false);
                    if (location.state?.from) {
                        navigate(location.state.from);
                    } else {
                        navigate('/');
                    }
                }
                else {
                    errorHelper(response.data);
                }
            })
            .catch((response) => {
                errorHelper(null);
            });
        setIsLoading(false);
    }

    async function fogotPasswd() {
        var strStudentId = loginform.getFieldValue("studentidtext");
        var strCaptchaCode = loginform.getFieldValue("captchacode");
        console.log(strCaptchaCode);
        if (strStudentId === undefined || strStudentId.replace(/ /g, '') === '') {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", 'Vui lòng nhập mã sinh viên!');
            setIsLoading(false);
            return;
        }
        if (strCaptchaCode === undefined || strCaptchaCode.replace(/ /g, '') === '') {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", 'Vui lòng nhập mã xác nhận!');
            setIsLoading(false);
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*"
        }
        var requestData = {
            'token': captChaToken,
            'studenId': strStudentId,
            'captchaValue': strCaptchaCode,
        };

        await axios.post(API_URL + 'api/Account/ForgotPassword', JSON.stringify(requestData), { headers })
            .then((response) => {
                if (response.data.isSuccess === true) {
                    getCaptCha();
                    openNotificationWithIcon('success', response.data.message);
                }
                else {
                    errorHelper(response.data);
                }
            })
            .catch((response) => {
                errorHelper();
            });
        setIsLoading(false);
    }

    async function getCaptCha() {
        var token = GetCookieData(CAPTCHA_TOKEN);
        if (token === null || token === undefined) {
            token = '';
        }
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*"
        }
        var requestData = {
            'token': token,
        };

        await axios.post(API_URL + 'api/Account/GetCaptcha', JSON.stringify(requestData), { headers })
            .then((response) => {
                if (response.data.isSuccess === true) {
                    setCaptChaToken(response.data.dataValue.token);
                    setCaptChaImage(response.data.dataValue.captchaPath);
                    SetCooikeData(CAPTCHA_TOKEN, response.data.dataValue.token);
                }
                else {
                    errorHelper(response.data);
                }
            })
            .catch((response) => {
                errorHelper();
            });
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
            await axios.post(strApiURL, JSON.stringify(requestData), { headers })
                .then((response) => {
                    if (response.data.isSuccess === true) {
                        SetCooikeData(ACCESS_TOKEN, response.data.dataValue.accessToken);
                        login(fullName, avatarPath, response.data.dataValue.role, response.data.dataValue.viewFileToken, response.data.dataValue.isDefaultPassword);
                    }
                    else {
                        errorHelper(response.data);
                    }
                })
                .catch((response) => {
                    errorHelper();
                });
        }
    }

    useEffect(() => {
        getCaptCha();
        if (isLogin === true) {
            var previousPageState = location.state && location.state.previousPage;
            previousPageState ? navigate(-1) : navigate('/');
        }
    }, []);

    return (
        <div className="loginbackground">
            {contextHolder}
            <Row>
                <Col xs={0} sm={0} md={0} lg={16} xl={16}>
                    <div className="overlayback">
                        <div className="overlay">
                            <p className="textwellcome1">Welcome to DTU Student Volunteer Club</p>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                    <Card className="signincard" >
                        <span className="formlogintitle">{isLoginType === true ? "Đăng Nhập" : "Quên Mật Khẩu"}</span>
                        <p className="logindecrist">Nếu là thành viên của đại gia đình nhà Nắng thì hãy nhanh tay đăng nhập vào hệ thống ngay nào.</p>
                        <div className="underline" />
                        <div className="loginformstyle">
                            <Form
                                form={loginform}
                                onFinish={summit}
                            >
                                {
                                    isLoginType === true ?
                                        <div>

                                            <Helmet>
                                                <title>Đăng Nhập</title>
                                            </Helmet>
                                            <Form.Item
                                                className="logininputtext"
                                                name="username"
                                                rules={[{ required: true, message: 'Tên đăng nhập không được để trống!' }]}
                                            >
                                                <Input
                                                    size="large"
                                                    prefix={<UserOutlined />}
                                                    disabled={isLoading}
                                                    placeholder="Tên đăng nhập"
                                                    className="inputloginuser" />
                                            </Form.Item>
                                            <Form.Item
                                                name="password"
                                                className="logininputtext"
                                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                                            >
                                                <Input.Password
                                                    prefix={<LockOutlined />}
                                                    size="large"
                                                    disabled={isLoading}
                                                    placeholder="Mật khẩu"
                                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                                    className="inputloginpass" />
                                            </Form.Item>
                                        </div>
                                        :
                                        <div>

                                            <Helmet>
                                                <title>Quên Mật Khẩu</title>
                                            </Helmet>
                                            <Form.Item
                                                name="studentidtext"
                                                rules={[{ required: true, message: 'Mã số sinh viên không được để trống!' }]}
                                            >
                                                <Input
                                                    size="large"
                                                    disabled={isLoading}
                                                    prefix={<SearchOutlined />}
                                                    placeholder="Mã số sinh viên"
                                                    className="inputstudentid" />
                                            </Form.Item>
                                            <Row>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        name="captchacode"
                                                        rules={[{ required: true, message: 'Mã xác nhận không được để trống!' }]}
                                                    >
                                                        <Input
                                                            style={{ marginTop: 7 }}
                                                            size="large"
                                                            disabled={isLoading}
                                                            maxLength={6}
                                                            placeholder="Mã xác nhận"
                                                            className="inputstudentid" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <img src={API_URL + captChaImage} className="captchaimage" />
                                                </Col>
                                            </Row>
                                        </div>
                                }
                                <Form.Item>
                                    <Button size="large"
                                        style={{ marginTop: 10, marginBottom: 20 }}
                                        loading={isLoading}
                                        type="primary" block htmlType="submit">ĐĂNG NHẬP</Button>
                                </Form.Item>
                            </Form>
                            {/* <Button
                                onClick={() => {
                                    summit();
                                }}
                                size="large"
                                style={{ marginTop: 10, marginBottom: 20 }}
                                loading={isLoading}
                                type="primary" block>{isLoginType === true ? "ĐĂNG NHẬP" : "TÌM MẬT KHẨU"}</Button> */}

                            <a className="forgotpass" onClick={() => setIsLogin(isLoginType === false)}>{isLoginType === true ? "Quên mật khẩu?" : "Đăng nhập"}</a>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
import React, {useState, useEffect} from 'react';
import {
    useLocation
} from "react-router-dom";
import axios from 'axios';
import { Form, Input, Upload, message, Button, Row, Col, Skeleton} from 'antd';
import '../assets/styles/firstsignin.css';
import TopImage from '../assets/images/hero-img.png';
import Page404 from './Page404';
import { Helmet } from 'react-helmet';
import { API_URL } from "../Helper/TextHelper";


function ResetPasswd(){
    const [form] = Form.useForm();
    const [loadingform, setLoadingform] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [tokenIsValid, setTokenIsValid] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [newPass, setNewPass] = useState(null);
    const [rePass, setRePass] = useState(null);
    const [token, setToken] = useState(null);
    const location = useLocation();


    const onChangeNewPassword = e =>{
        var passwd = e.target.value;
        setNewPass(passwd);
        var regexStr = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(regexStr.test(passwd) === false){
            setIsPasswordValid(false);
        }else{
            if(e === null
                || rePass === null
                || passwd !== rePass){
                    setIsPasswordValid(false);
            }else{
                setIsPasswordValid(true);
            }
        }
    }

    const onChangeRenewPasswd = e =>{
        setRePass(e.target.value);
        if(newPass === null
            || e.target.value === null
            || newPass !== e.target.value){
                setIsPasswordValid(false);
        }else{
                setIsPasswordValid(true);
        }
    }

    async function checkToken(token){
        setPageLoading(true);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
        }
        var requestData = {
            x_objToken: token
        };

        await axios.get(API_URL + 'api/Account/CheckForExistingTokens', {headers:headers, params: requestData})
        .then((response) =>{
            if(response.data.isSuccess){
                setTokenIsValid(true);
            }else{
                setTokenIsValid(false);
            }
            setPageLoading(false);
        })
        .catch((response)=>{
            message.error("Mất kết nối với máy chủ");
            setTokenIsValid(false);
            setPageLoading(false);
        })
    }

    async function onChangePasswd(){
        setLoadingform(true);
        if(token){
            const headers = {
                "Content-Type": "application/json",
                "accept": "*/*",
            }
            const changePassword = {
                'token': token,
                'newPassword': newPass,
                'passwordConfirmation': rePass,
            };
            // console.log(newPass, rePass);
            await axios.put(API_URL + 'api/Account/ResetPassword', JSON.stringify(changePassword), { headers })
            .then((response) =>{
                if(response.data.isSuccess){
                    message.success("Thay đổi mật khẩu thành công");
                    setTimeout(() => {
                        window.location.href="/";
                    }, 1000);
                }else{
                    message.error(response.data.errors[0]);
                }
                setLoadingform(false);
            })
            .catch((response)=>{
                message.error("Mất kết nối với máy chủ");
                setLoadingform(false);
            });
        }
    }

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const gettoken = searchParams.get('token');
        //let path = window.location.pathname.split('/');
        checkToken(gettoken);
        setToken(gettoken);
    },[])

    return(
        <div>
            <Helmet>
                <title>{ "Khôi phục mật khẩu" }</title>
            </Helmet>
            {
                !pageLoading?
                <div>
                    {
                        tokenIsValid?
                        <div style={{marginLeft: 0}}>
                            <section style={{marginLeft: 0}} id="hero" className="hero d-flex align-items-center">
                                <div className="container">
                                    <div className="row container">
                                        <Row justify="center" align="middle">
                                            <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                                <h1 style={{color: 'red'}}>Khôi phục mật khẩu</h1>
                                                <h2 style={{textAlign: "left"}}>Chúng tôi rất lấy làm tiếc khi bạn gặp sự cố đăng nhập vào hệ thống.</h2>
                                                <h3 style={{textAlign: "left"}}>Ngay bây giờ hãy tiến hành thay đổi lại mật khẩu của bạn để tiếp tục sử dụng hệ thống.</h3>
                                            </Col>
                                            <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                                <img src={TopImage} className="img-fluid" alt="" />
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </section>
                            <div className="values">
                                <Row className="box" justify="center" align="middle" style={{marginBottom: 30}}>
                                    <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                        <div className="content">
                                            <h2>Đổi mật khẩu</h2>
                                            <p  style={{textAlign:"left", fontSize:16}}>Hãy đảm bảo rằng mật khẩu của bạn đúng theo yêu cầu của chúng tôi.</p>
                                            <p style={{textAlign:"left", fontSize:18, fontWeight: 600, color: "red"}}>Chú ý:</p>
                                            <ul style={{textAlign:"left", fontSize:18, fontWeight: 600, color: "red"}}>
                                                <li>
                                                    Độ dài tối thiểu của mật khẩu là 8 ký tự.
                                                </li>
                                                <li>
                                                    Mật khẩu phải có ít nhất 01 chữ cái viết thường.
                                                </li>
                                                <li>
                                                    Mật khẩu phải có ít nhất 01 chữ cái viết hoa.
                                                </li>
                                                <li>
                                                    Mật khẩu phải có ít nhất 01 số.
                                                </li>
                                                <li>
                                                    Mật khẩu phải có ít nhất 01 ký tự đặc biệt.
                                                </li>
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                        <div className="container">
                                            <Form from={form}>
                                                <Row align="middle">
                                                    <Col style={{textAlign: "left"}} span={8} className={"col-md-5"} xs={24} xl={8}>
                                                        <h6>Mật khẩu mới</h6>
                                                    </Col>
                                                    <Col span={16} className={"col-md-5 col-md-offset-2"} xs={24} xl={16}>
                                                        <Form.Item
                                                            name="newpassword"
                                                            onChange={onChangeNewPassword}
                                                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                                                        >
                                                            <Input.Password placeholder="Mật khẩu mới"></Input.Password>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Row align="middle">
                                                    <Col style={{textAlign: "left"}} span={8} className={"col-md-5"} xs={24} xl={8}>
                                                        <h6>Xác nhận mật khẩu</h6>
                                                    </Col>
                                                    <Col span={16} className={"col-md-5 col-md-offset-2"} xs={24} xl={16}>
                                                        <Form.Item
                                                        onChange={onChangeRenewPasswd}
                                                            name="renewpassword"
                                                            rules={[{ required: true, message: 'Vui lòng nhập xác nhận mật khẩu!' }]}
                                                        >
                                                            <Input.Password placeholder="Nhập lại mật khẩu mới"></Input.Password>
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                                <Row align="middle">
                                                    <Col style={{textAlign: "left"}} span={8} className={"col-md-5"} xs={24} xl={8}>
                                                    </Col>
                                                    <Col span={16} className={"col-md-5 col-md-offset-2"} xs={24} xl={16}>
                                                    <Button disabled={!isPasswordValid} loading={loadingform} type="primary" onClick={onChangePasswd} align="middle">Đổi mật khẩu</Button>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        : <Page404/>
                    }
                </div>
                : <Skeleton />
            }
        </div>
    );
}
export default ResetPasswd;
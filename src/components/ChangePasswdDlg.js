import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Form,
    Input,
    Card,
    Button,
    Modal
} from "antd";
import {
    faCircleCheck, faCircleXmark
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserOutlined, LockOutlined, SearchOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { API_URL, RemoveVietnameseAccents } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';

function ChangePasswdDlg({ onChangePasswdSuccess, onError, isModalOpen, handleCancel }) {
    const [loading, setLoading] = useState(false);
    const [changePasswdForm] = Form.useForm();
    const [hasUpperCase, setHasUpperCase] = useState(false);
    const [hasLowerCase, setHasLowerCase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false);
    const [isLengthValid, setIsLengthValid] = useState(false);
    const [isMatchingPasswd, setIsMatchingPasswd] = useState(false);

    const onChangeNewPassWd = () => {
        var strNewPasswd = changePasswdForm.getFieldValue("newPassword");
        var strReNewPasswd = changePasswdForm.getFieldValue("renewPassword");

        if (strNewPasswd === undefined || strNewPasswd.replace(/ /g, '') === '') {
            strNewPasswd = "";
        }
        if (strReNewPasswd === undefined || strReNewPasswd.replace(/ /g, '') === '') {
            strReNewPasswd = "";
        }
        setHasUpperCase(/[A-Z]/.test(strNewPasswd));
        setHasLowerCase(/[a-z]/.test(strNewPasswd));
        setHasNumber(/[0-9]/.test(strNewPasswd));
        setHasSpecialChar(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(strNewPasswd));
        setIsLengthValid(strNewPasswd.length >= 8);
        setIsMatchingPasswd(strNewPasswd !== "" && strNewPasswd === strReNewPasswd);
    }

    const ChangePasswd = async () => {
        var strOldPasswd = changePasswdForm.getFieldValue("oldPassword");
        var strNewPasswd = changePasswdForm.getFieldValue("newPassword");
        var strReNewPasswd = changePasswdForm.getFieldValue("renewPassword");
        var isValid = true;
        setLoading(true);
        if (strOldPasswd === undefined || strOldPasswd.replace(/ /g, '') === '') {
            changePasswdForm.setFields([{
                name: "oldPassword",
                errors: ["Vui lòng nhập mật khẩu cũ!"]
            }]);
            isValid = false;
        }
        if (strNewPasswd === undefined || strNewPasswd.replace(/ /g, '') === '') {
            changePasswdForm.setFields([{
                name: "newPassword",
                errors: ["Vui lòng nhập mật khẩu mới!"]
            }]);
            isValid = false;
        }
        if (strReNewPasswd === undefined || strReNewPasswd.replace(/ /g, '') === '') {
            changePasswdForm.setFields([{
                name: "renewPassword",
                errors: ["Vui lòng nhập lại mật khẩu mới!"]
            }]);
            isValid = false;
        }

        if (hasUpperCase === false ||
            hasLowerCase === false ||
            hasNumber === false ||
            hasSpecialChar === false ||
            isLengthValid === false ||
            isMatchingPasswd === false ||
            isValid === false) {
            setLoading(false);
            return;
        }

        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + strAccessToken
        }
        const requestData = {
            "oldPassword": strOldPasswd,
            "newPassword": strNewPasswd,
            "rePassword": strReNewPasswd,
        };
        const strApiURL = `${API_URL}api/Account/ChangePassword`;
        await axios.put(strApiURL, JSON.stringify(requestData), { headers })
            .then((response) => {
                if (response.data.isSuccess === false) {
                    onError(response.data);
                }
                else {
                    onChangePasswdSuccess();
                    changePasswdForm.setFieldsValue({ oldPassword: undefined });
                    changePasswdForm.setFieldsValue({ newPassword: undefined });
                    changePasswdForm.setFieldsValue({ renewPassword: undefined });
                }
            })
            .catch((error) => {
                onError(error);
            });
        setLoading(false);
    }

    useEffect(() => {
        changePasswdForm.setFieldsValue({ oldPassword: undefined });
        changePasswdForm.setFieldsValue({ newPassword: undefined });
        changePasswdForm.setFieldsValue({ renewPassword: undefined });
    }, [isModalOpen]);

    return (
        <div>
            <Modal
                title="Đổi mật khẩu"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel} loading={loading}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={ChangePasswd}>
                        Cập Nhật
                    </Button>
                ]}
                width={900}>
                <Form form={changePasswdForm}>
                    <Row style={{ marginTop: 30 }}>
                        <Col span={12} xs={24} xl={12}>
                            <Card style={{ margin: 2 }} className="card h-100">
                                <Row>
                                    <Col span={24} xs={24} xl={24}>
                                        <Row>
                                            <Col span={8} xs={24} xl={8} style={{ textAlign: "left" }}>
                                                Mật khẩu cũ:
                                            </Col>
                                            <Col span={16} xs={24} xl={16}>
                                                <Form.Item
                                                    name="oldPassword"
                                                    rules={[{ required: true, message: 'Mật khẩu cũ không được để trống!' }]}
                                                >
                                                    <Input.Password
                                                        prefix={<LockOutlined />}
                                                        size="large"
                                                        disabled={loading}
                                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24} xs={24} xl={24}>
                                        <Row>
                                            <Col span={8} xs={24} xl={8} style={{ textAlign: "left" }}>
                                                Mật khẩu mới:
                                            </Col>
                                            <Col span={16} xs={24} xl={16}>
                                                <Form.Item
                                                    name="newPassword"
                                                    rules={[{ required: true, message: 'Mật khẩu mới không được để trống!' }]}
                                                >
                                                    <Input.Password
                                                        onChange={onChangeNewPassWd}
                                                        prefix={<LockOutlined />}
                                                        size="large"
                                                        disabled={loading}
                                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24} xs={24} xl={24}>
                                        <Row>
                                            <Col span={8} xs={24} xl={8} style={{ textAlign: "left" }}>
                                                Nhập lại mật khẩu:
                                            </Col>
                                            <Col span={16} xs={24} xl={16}>
                                                <Form.Item
                                                    name="renewPassword"
                                                    rules={[{ required: true, message: 'Nhập lại mật khẩu mới không được để trống!' }]}
                                                >
                                                    <Input.Password
                                                        onChange={onChangeNewPassWd}
                                                        prefix={<LockOutlined />}
                                                        size="large"
                                                        disabled={loading}
                                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        <Col span={12} xs={24} xl={12}>
                            <Card style={{ margin: 2 }} className="card h-100">
                                <Row>
                                    <Col span={24} xs={24} xl={24}>
                                        <p><FontAwesomeIcon icon={hasLowerCase ? faCircleCheck : faCircleXmark} style={{ color: (hasLowerCase ? "#00a31b" : "#ff0000"), marginRight: 5 }} />Mật khẩu có chứa <b>ký tự viết thường [a-z]</b>.</p>
                                        <p><FontAwesomeIcon icon={hasUpperCase ? faCircleCheck : faCircleXmark} style={{ color: (hasUpperCase ? "#00a31b" : "#ff0000"), marginRight: 5 }} />Mật khẩu có chứa <b>ký tự in hoa [A-Z]</b>.</p>
                                        <p><FontAwesomeIcon icon={hasNumber ? faCircleCheck : faCircleXmark} style={{ color: (hasNumber ? "#00a31b" : "#ff0000"), marginRight: 5 }} />Mật khẩu có chứa <b>số [0-9]</b>.</p>
                                        <p><FontAwesomeIcon icon={hasSpecialChar ? faCircleCheck : faCircleXmark} style={{ color: (hasSpecialChar ? "#00a31b" : "#ff0000"), marginRight: 5 }} />Mật khẩu có chứa <b>ký tự đặc biệt [# ? ! @ $ % ^ & * -]</b>.</p>
                                        <p><FontAwesomeIcon icon={isLengthValid ? faCircleCheck : faCircleXmark} style={{ color: (isLengthValid ? "#00a31b" : "#ff0000"), marginRight: 5 }} />Mật khẩu có độ dài từ <b>8 ký tự</b> trở lên.</p>
                                        <p><FontAwesomeIcon icon={isMatchingPasswd ? faCircleCheck : faCircleXmark} style={{ color: (isMatchingPasswd ? "#00a31b" : "#ff0000"), marginRight: 5 }} />Nhập lại mật khẩu trùng khớp.</p>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}

export default ChangePasswdDlg;
import {
    BrowserRouter as Router,
    useParams,
    useLocation
} from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/newspaper.css';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select, message, Row, Col, Form, Button, Modal, Skeleton, Result, Input, } from 'antd';
import moment from 'moment';
import { ACCESS_TOKEN, CAPTCHA_TOKEN, GetCookieData, LogOutClearCookie, SetCooikeData, } from "../Helper/CookieHelper";
import { API_URL, GetFullPath } from "../Helper/TextHelper";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";



function ActivityTopic() {
    const { Option } = Select;
    const { TextArea } = Input;

    const [captChaImage, setCaptChaImage] = useState(null);
    const [captChaToken, setCaptChaToken] = useState("");
    const location = useLocation();
    const [actvityId, setActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [isError500, setIsError500] = useState(true);
    const [errorMess, setErrorMess] = useState(null);
    const [facultys, setFacultys] = useState(null);
    const [registing, setRegisting] = useState(false);
    const [registed, setRegisted] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [leaveform] = Form.useForm();
    const [isLeaved, setIsLeaved] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);

    const GetActivitiesAndEventsById = async (x_Acid) => {
        setLoading(true);
        const token = GetCookieData(ACCESS_TOKEN);
        var config = null;
        if (token !== null && token !== undefined) {
            config = {
                "Content-Type": "application/json",
                "accept": "*/*",
                'Authorization': 'Bearer ' + token,
            }
        } else {
            config = {
                "Content-Type": "application/json",
                "accept": "*/*",
            }
        }
        var requestData = {
            x_strActivityId: x_Acid,
        };
        await axios.get(API_URL + 'api/Activities/GetActivitieById', { params: requestData, headers: config })
            .then((response) => {
                if (response.data.isSuccess) {
                    setData(response.data.dataValue);
                    console.log(response.data.dataValue);
                    setRegisted(response.data.dataValue.isRegistered);
                    setIsLeaved(response.data.dataValue.isRequestedLeave);
                    setLoading(false);
                } else {
                    if (response.data.errors[0].indexOf("(401)") >= 0) {
                        setErrorMess("404. Trang bạn yêu cầu không thể mở ngay lúc này");
                        setLoading(false);
                        setIsError500(false);
                    } else {
                        setIsError500(true);
                        setErrorMess(response.data.errors);
                        message.error(response.data.errors);
                    }
                }
            })
            .catch((response) => {
                message.error("Mất kết nối với máy chủ");
                setLoading(false);
                setIsError500(true);
                setErrorMess("Mất kết nối với máy chủ");
            })
    }

    function register() {
        const token = GetCookieData(ACCESS_TOKEN)
        if (token !== null && token !== undefined) {
            confirm();
        } else {
            CommunityRegistration();
        }
    }

    function leaveRegistration() {
        setLeaveLoading(true);
        var isValid = true;
        var reason = leaveform.getFieldValue("reason");
        var errorList = leaveform.getFieldsError();

        if (reason === undefined || reason.replace(/ /g, '') === '') {
            form.setFields([{
                name: "reason",
                errors: ["Vui lòng nhập lý do nghỉ!"]
            }]);
        }

        errorList.forEach((error) => {
            if (error.errors.length > 0) {
                isValid = false;
            }
        });
        const token = GetCookieData(ACCESS_TOKEN)
        if (token && isValid) {
            const headers = {
                "Content-Type": "application/json",
                "accept": "*/*",
                "Authorization": 'Bearer ' + token
            }

            const registrationModel = {
                'eventId': actvityId,
                'rason': reason,
            };

            axios.post(API_URL + 'api/Activities/MemberLeaveRegistration', JSON.stringify(registrationModel), { headers })
                .then((response) => {
                    if (response.data.isSuccess) {
                        message.success(response.data.message);
                        setIsModalVisible(false);
                        setRegisted(false);
                        setIsLeaved(true);
                    } else {
                        if (response.data.errors[0].indexOf("(401)") >= 0) {
                            LogOutClearCookie();
                        }
                        message.error(response.data.errors[0]);
                    }
                    setLeaveLoading(false);
                })
                .catch((response) => {
                    if (response.toString().indexOf(401) >= 0) {
                        LogOutClearCookie();
                        message.error("Phiên đăng nhập đã hết hạn");
                    } else {
                        message.error("Mất kết nối với máy chủ");

                    }
                    setLeaveLoading(false);
                });
        } else {
            setLeaveLoading(false);
        }
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
                    console.log(response.data);
                }
            })
            .catch((response) => {
                console.log("loi captcha");
            });
    }



    function CommunityRegistration() {
        setRegisting(true);
        var firstname = form.getFieldValue("firstname");
        var lastname = form.getFieldValue("lastname");
        var phonenumber = form.getFieldValue("phonenumber");
        var email = form.getFieldValue("email");
        var faculty = form.getFieldValue("faculty");
        var classname = form.getFieldValue("classname");
        var studentid = form.getFieldValue("studentid");
        var facebookpath = form.getFieldValue("facebookpath");
        var captcha = form.getFieldValue("captcha");
        var token = GetCookieData(CAPTCHA_TOKEN);
        var isValid = true;
        if (firstname === undefined || firstname.replace(/ /g, '') === '') {
            form.setFields([{
                name: "firstname",
                errors: ["Vui lòng nhập họ và tên đệm"]
            }]);
        }

        if (lastname === undefined || lastname.replace(/ /g, '') === '') {
            form.setFields([{
                name: "lastname",
                errors: ["Vui lòng nhập tên"]
            }]);
        }

        if (classname === undefined || classname.replace(/ /g, '') === '') {
            form.setFields([{
                name: "classname",
                errors: ["Vui lòng nhập lớp"]
            }]);
        }

        if (studentid === undefined || studentid.replace(/ /g, '') === '') {
            form.setFields([{
                name: "studentid",
                errors: ["Vui lòng nhập mã sinh viên"]
            }]);
        }

        if (phonenumber === undefined || phonenumber.replace(/ /g, '') === '') {
            form.setFields([{
                name: "phonenumber",
                errors: ["Vui lòng nhập số điện thoại"]
            }]);
        }

        if (email === undefined || email.replace(/ /g, '') === '') {
            form.setFields([{
                name: "email",
                errors: ["Vui lòng nhập email"]
            }]);
        }

        if (facebookpath === undefined || facebookpath.replace(/ /g, '') === '') {
            form.setFields([{
                name: "facebookpath",
                errors: ["Vui lòng nhập link Facebook"]
            }]);
        }

        if (faculty === undefined) {
            form.setFields([{
                name: "faculty",
                errors: ["Vui lòng chọn Khoa/Viện chủ quản"]
            }]);
        }

        if (captcha === undefined || captcha.replace(/ /g, '') === '') {
            form.setFields([{
                name: "captcha",
                errors: ["Vui lòng nhập mã xác nhận"]
            }]);
        }

        var errorList = form.getFieldsError();
        errorList.forEach((error) => {
            if (error.errors.length > 0) {
                isValid = false;
            }
        });
        if (actvityId && isValid) {
            const communityRegistrationInfoModel = {
                'firstName': firstname,
                'lastName': lastname,
                'phoneNumber': phonenumber,
                'email': email,
                'facultyId': faculty,
                'className': classname,
                'studentId': studentid,
                'facebookPath': facebookpath,
                'eventId': actvityId,
                "token": token,
                "captCha": captcha
            }
            const headers = {
                "Content-Type": "application/json",
                "accept": "*/*"
            }
            axios.post(API_URL + 'api/Activities/CommunityRegistration', JSON.stringify(communityRegistrationInfoModel), { headers })
                .then((response) => {
                    if (response.data.isSuccess) {
                        message.success("Đăng ký thành công, vui lòng hãy kiểm tra email của bạn để xem thông tin điểm danh.");
                    } else {
                        message.error(response.data.errors);
                    }
                    setRegisting(false);
                })
                .catch((response) => {
                    message.error("Mất kết nối với máy chủ");
                    setRegisting(false);
                });
        }
        else {
            setRegisting(false);
        }
    }

    function confirm() {
        Modal.confirm({
            title: 'Đăng ký tham gia?',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn đăng ký tham gia hoạt động này không?',
            okText: 'Đồng Ý',
            cancelText: 'Không',
            onOk: () => { memberRegister() }
        });
    }

    async function memberRegister() {
        setRegisting(true);
        const token = GetCookieData(ACCESS_TOKEN)

        if (token) {
            var config = {
                "Content-Type": "application/json",
                "accept": "*/*",
                'Authorization': 'Bearer ' + token,
            }
            var requestData = {
                x_strActivityId: actvityId,
            };
            await axios.get(API_URL + 'api/Activities/MemberRegistration', { params: requestData, headers: config })
                .then((response) => {
                    if (response.data.isSuccess) {
                        message.success("Đăng ký thành công");
                        GetActivitiesAndEventsById(actvityId);
                    } else {
                        message.error(response.data.errors);
                    }
                })
                .catch((response) => {
                    message.error("Mất kết nối với máy chủ");
                })
        }
        setRegisting(false);
    }

    function getFaculty() {
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
        }
        axios.get(API_URL + 'api/Facultys/GetAllFacultys', { headers: headers })
            .then((response) => {
                if (response.data.isSuccess) {
                    setFacultys(response.data.dataValue);
                }
            })
            .catch((response) => {
            })
    }

    function RemoveVietnameseAccents(str) {
        str = str.replace(/\s+/g, ' ');
        str = str.trim();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        return str;
    }

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const strAcId = searchParams.get('activityid');
        setActivity(strAcId);
        GetActivitiesAndEventsById(strAcId);
        getFaculty();
        getCaptCha();
        setIsLogin(GetCookieData(ACCESS_TOKEN) !== undefined)
    }, []);

    return (
        <div style={{ margin: 15 }}>
            {
                loading ?
                    <Skeleton active />
                    :
                    <div style={{ marginTop: 10 }}>
                        {
                            data ?
                                <div className="newspaper">

                                    <title>{"[DTUSVC]"}-{data.title}</title>
                                    <meta name="description" content={data.content} />
                                    <meta property="og:title" content={data.title} />
                                    <meta property="og:image" content={API_URL + data.posterPath} />

                                    <h4 style={{ fontWeight: 600 }}>{data.title}</h4>
                                    <img src={API_URL + data.posterPath} />
                                    <div class="ql-container ql-snow" style={{ border: "white" }}>
                                        <div style={{ minHeight: "0vh" }} class="ql-editor" dangerouslySetInnerHTML={{ __html: data.content }} />
                                    </div>
                                    <hr />
                                    <p style={{ textAlign: "left", marginLeft: 10 }}>Diễn ra từ: {moment(data.startDate).format('HH:mm:ss DD-MM-YYYY')} - {moment(data.endDate).format('HH:mm:ss DD-MM-YYYY')}</p>
                                    <p style={{ textAlign: "left", marginLeft: 10, color: "red" }}>Hạn cuối đăng ký: {moment(data.registrationDeadline).format('HH:mm:ss DD-MM-YYYY')}</p>
                                    <p style={{textAlign:"left", marginLeft: 10}}>Địa điểm: {data.address.specificAddress + ', ' + data.address.ward.wardName + ', ' + data.address.district.districtName + ', ' + data.address.province.provinceName}</p>
                                    {
                                        (moment(data.registrationDeadline).add(7, 'hours') > new Date()) ?
                                            <div>
                                                {
                                                    !isLogin ?
                                                        <div>
                                                            <hr />
                                                            <h4 style={{ marginBottom: 20 }}>Đăng Ký Tham Gia Ngay Tại Đây</h4>
                                                            <Form form={form}>
                                                                <Row>
                                                                    <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                                                        <Form.Item
                                                                            name="firstname"
                                                                            label="Họ & tên đệm:"
                                                                            rules={[{
                                                                                required: true,
                                                                                message: 'Vui lòng nhập họ & tên đệm!',
                                                                            }]}
                                                                        >
                                                                            <Input disabled={registing} placeholder="Nhập họ và tên đệm" maxLength={30} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                                                        <Form.Item
                                                                            name="lastname"
                                                                            label="Tên:"
                                                                            rules={[{
                                                                                required: true,
                                                                                message: 'Vui lòng nhập tên!',
                                                                            }]}
                                                                        >
                                                                            <Input disabled={registing} placeholder="Nhập Tên" maxLength={7} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                                                        <Form.Item
                                                                            name="phonenumber"
                                                                            label="Số điện thoại:"
                                                                            rules={[{
                                                                                required: true,
                                                                                message: 'Vui lòng nhập số điện thoại!',
                                                                            }]}
                                                                        >
                                                                            <Input disabled={registing} placeholder="Nhập số điện thoại" maxLength={15} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                                                        <Form.Item
                                                                            name="email"
                                                                            label="Email:"
                                                                            rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: "email", message: 'Email không hợp lệ!' }]}
                                                                        >
                                                                            <Input disabled={registing} placeholder="Nhập Email" maxLength={100} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                                                        <Form.Item
                                                                            name="faculty"
                                                                            label="Khoa/ viện:"
                                                                            rules={[{
                                                                                required: true,
                                                                                message: 'Vui lòng chọn khoa viện!'
                                                                            }]}

                                                                        >
                                                                            <Select
                                                                                disabled={registing}
                                                                                showSearch
                                                                                className="container text-left"
                                                                                placeholder="Chọn khoa/viện"
                                                                                filterOption={
                                                                                    (input, option) =>
                                                                                        RemoveVietnameseAccents(option.children).toLowerCase().indexOf(RemoveVietnameseAccents(input).toLowerCase()) >= 0
                                                                                }
                                                                                filterSort={
                                                                                    (optionA, optionB) =>
                                                                                        optionA.value.toLowerCase().localeCompare(optionB.value.toLowerCase())
                                                                                }
                                                                            >
                                                                                {facultys != null ? facultys.map((facultyItem) => (
                                                                                    <option value={facultyItem.id} >{facultyItem.facultyName}</option>
                                                                                )) : <Option value="chon">Chọn Khoa/Viện</Option>}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                                                        {/* Mã lớp */}
                                                                        <Form.Item
                                                                            name="classname"
                                                                            label="Lớp:"
                                                                            rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}
                                                                        >
                                                                            <Input disabled={registing} placeholder="Nhập tên lớp" maxLength={15} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                                                        <Form.Item
                                                                            name="studentid"
                                                                            label="Mã số sinh viên:"
                                                                            rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên!' }]}
                                                                        >
                                                                            <Input disabled={registing} placeholder="Nhập mã sinh viên" maxLength={15} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                                                        <Form.Item
                                                                            name="facebookpath"
                                                                            label="Facebook:"
                                                                            rules={[{ required: true, message: 'Vui lòng nhập facebook!' }, { type: "url", message: 'Link không hợp lệ!' }]}
                                                                        >
                                                                            <Input disabled={registing} placeholder="Nhập link Facebook" maxLength={150} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                                                        <Form.Item
                                                                            name="captcha"
                                                                            label="Mã xác nhận:"
                                                                            rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận!' }]}
                                                                        >
                                                                            <Input disabled={registing} placeholder="Nhập mã xác nhận" maxLength={15} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                        <img src={API_URL + captChaImage} className="captchaimage" />
                                                                    </Col>
                                                                </Row>
                                                            </Form>
                                                        </div>
                                                        : null
                                                }
                                                <Row>
                                                    <Col className={isLogin ? "col-md-5" : ""} span={isLogin ? 12 : 24} xs={24} xl={isLogin ? 12 : 24}>
                                                        <Button
                                                            disabled={registed}
                                                            onClick={() => {
                                                                register()
                                                            }}
                                                            style={{ marginTop: 10 }}
                                                            loading={registing}
                                                            icon={data.isRegistered ? <FontAwesomeIcon style={{ marginRight: 10 }} icon={faCheckCircle} /> : null}
                                                            type="primary" block>{data.isRegistered ? "Đã đăng ký" : "Đăng ký tham gia"}</Button>
                                                    </Col>
                                                    {
                                                        isLogin ?
                                                            <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                                                <Button type="primary" block danger
                                                                    style={{ marginTop: 10 }}
                                                                    disabled={isLeaved}
                                                                    onClick={() => setIsModalVisible(true)}>{isLeaved ? "Đã Xin Phép" : "Xin Phép Vắng"}</Button>
                                                            </Col>
                                                            : null
                                                    }
                                                </Row>
                                                {
                                                    isLogin ?
                                                        <Modal
                                                            title="Xin phép vắng"
                                                            visible={isModalVisible}
                                                            onOk={() => leaveRegistration()}
                                                            onCancel={() => setIsModalVisible(false)}
                                                            footer={[
                                                                <Button key="back" onClick={() => setIsModalVisible(false)}>
                                                                    Thoát
                                                                </Button>,
                                                                <Button key="submit" type="primary" loading={leaveLoading} onClick={() => leaveRegistration()}>
                                                                    Gửi
                                                                </Button>,
                                                            ]}
                                                        >
                                                            <Form form={leaveform}>
                                                                <Form.Item
                                                                    name="reason"
                                                                    label="Lý do:"
                                                                    rules={[{
                                                                        required: true,
                                                                        message: 'Vui lòng nhập lý do vắng!',
                                                                    }]}
                                                                >
                                                                    <TextArea rows={4} disabled={registing} placeholder="Nhập lý do vắng" maxLength={255} />
                                                                </Form.Item>
                                                            </Form>
                                                        </Modal>
                                                        : null
                                                }
                                            </div>
                                            : null
                                    }
                                </div>
                                :
                                <Result
                                    status={isError500 ? "500" : "404"}
                                    title={errorMess}
                                    subTitle={!isError500
                                        ? "Hoạt động này không tồn tại hoặc là hoạt động nội bộ. Vui lòng đăng nhập rồi thử lại!"
                                        : "Hãy kiểm tra lại kết nối internet của bạn rồi thử lại !"}
                                />
                        }
                    </div>
            }
        </div>
    );
}
export default ActivityTopic;
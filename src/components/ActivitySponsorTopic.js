import {
    useLocation
} from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/newspaper.css';
import { message, Row, Col, Form, Button, Modal, Skeleton, Result, Input, Switch, Image } from 'antd';
import moment from 'moment';
import { ACCESS_TOKEN, GetCookieData, } from "../Helper/CookieHelper";
import { API_URL, } from "../Helper/TextHelper";




function ActivitySponsorTopic() {
    const location = useLocation();
    const [activityId, setActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [isError500, setIsError500] = useState(true);
    const [errorMess, setErrorMess] = useState(null);
    const [form] = Form.useForm();
    const [isAnonymous, setAnonymous] = useState(false);
    const [hideQR, setHideQR] = useState(false);
    const [QR, setQR] = useState(null);
    const [butload, setButLoad] = useState(false);
    const [idSponsor, setIdSponsor] = useState(null);
    const [result, setResult] = useState(false);
    const [cancel, setCancel] = useState(false);
    const [callAIP, setCallAPI] = useState(false);

    const GetActivitiesAndEventsById = async (x_Acid) => {
        setLoading(true);
        setButLoad(true);
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
                    setLoading(false);
                    setButLoad(false);
                } else {
                    if (response.data.errors[0].indexOf("(401)") >= 0) {
                        setErrorMess("404. Trang bạn yêu cầu không thể mở ngay lúc này");
                        setLoading(false);
                        setIsError500(false);
                        setButLoad(false);
                    } else {
                        setIsError500(true);
                        setErrorMess(response.data.errors);
                        setButLoad(false);
                        message.error(response.data.errors);
                    }
                }
            })
            .catch((response) => {
                message.error("Mất kết nối với máy chủ");
                setLoading(false);
                setButLoad(false);
                setIsError500(true);
                setErrorMess("Mất kết nối với máy chủ");
            })
    }


    function SponsorActivity() {

        var sponsorName = form.getFieldValue("sponsorName");
        var amount = form.getFieldValue("amount");
        var descript = form.getFieldValue("descript");
        var isValid = true;

        if (!isAnonymous) {
            if (sponsorName === undefined || sponsorName.replace(/ /g, '') === '') {
                form.setFields([{
                    name: "firstname",
                    errors: ["Vui lòng nhập họ và tên "]
                }]);
            }
        } else {
            sponsorName = "";
        }

        if (amount === undefined || amount.replace(/ /g, '') === '') {
            form.setFields([{
                name: "lastname",
                errors: ["Vui lòng nhập tên"]
            }]);
        }

        if (descript === undefined || descript.replace(/ /g, '') === '') {
            form.setFields([{
                name: "classname",
                errors: ["Vui lòng nhập lớp"]
            }]);
        }

        var errorList = form.getFieldsError();
        errorList.forEach((error) => {
            if (error.errors.length > 0) {
                isValid = false;
            }
        });
        if (activityId && isValid) {
            const communityRegistrationInfoModel = {
                'sponsorName': sponsorName,
                'amount': amount,
                'descript': descript,
                'activityId': activityId,
                'isAnonymous': isAnonymous,
                'isSponsorActivities': true
            }
            const headers = {
                "Content-Type": "application/json",
                "accept": "*/*"
            }
            axios.post(API_URL + 'api/Sponsor/CreateSponsorLink', JSON.stringify(communityRegistrationInfoModel), { headers })
                .then((response) => {
                    if (response.data.isSuccess) {
                        message.success("Tạo mã thành công. Quét QR để ủng hộ");
                        setHideQR(true);
                        setIdSponsor(response.data.dataValue.sponsorId)
                        setQR(response.data.dataValue.qrCode);
                        setCallAPI(true);
                    } else {
                        message.error(response.data.errors);
                    }

                })
                .catch((response) => {
                    message.error("Mất kết nối với máy chủ");

                });
        }

    }

    async function GetSponsorWAct() {
        try {
            const headers = {
                "Content-Type": "application/json",
                "accept": "*/*",
            };

            var requestData = {
                x_strSponsorId: idSponsor,
            };

            axios.get(API_URL + 'api/Sponsor/CheckSponsorStatus', { params: requestData, headers: headers })
                .then((response) => {
                    if (response.data.isSuccess) {
                        console.log(response.data.dataValue);
                        if(response.data.dataValue.status == 'PAID'){
                            setResult(true);
                        }else if(response.data.dataValue.status == 'CANCEL'){
                            setCancel(true);
                        }
                    } else {
                        message.error(response.data.errors);
                    }
                })
                .catch((response) => {
                    message.error("Mất kết nối với máy chủ");

                });
        } catch (error) {
            console.error('Error:', error);
        }

    }

    async function CancelSponsorWAct() {
        try {
            const headers = {
                "Content-Type": "application/json",
                "accept": "*/*",
            };

            var requestData = {
                x_strSponsorId: idSponsor,
            };

            axios.get(API_URL + 'api/Sponsor/CancelSponsorLink', { params: requestData, headers: headers })
                .then((response) => {
                    if (response.data.isSuccess) {
                        setCancel(true);
                    } else {
                        message.error(response.data.errors);
                    }
                })
                .catch((response) => {
                    message.error("Mất kết nối với máy chủ");

                });
        } catch (error) {
            console.error('Error:', error);
        }

    }

    const validateAmount = (_, value) => {
        if (value && parseInt(value) < 2000) {
            return Promise.reject('Xin lỗi! Số tiền quyên góp tối thiểu là 2000 VNĐ');
        }
        return Promise.resolve();
    };

    const handleAnony = (checked) => {
        // Thiết lập trạng thái mới khi nút được bấm
        setAnonymous(checked);
    };

    useEffect(() => {
        let interval;
        if (callAIP && !result && !cancel) {
            interval = setInterval(() => {
                GetSponsorWAct();
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [callAIP, result, cancel]);

    useEffect(() => {
        if (result) {
            message.success('Quyên góp thành công');
        }
        if (cancel) {
            message.success('Huỷ thành công');
            setHideQR(false);
        }
    }, [result, cancel]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const strAcId = searchParams.get('activitysponsorid');
        setActivity(strAcId);
        GetActivitiesAndEventsById(strAcId);

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
                                    <p style={{ textAlign: "left", marginLeft: 10 }}>Địa điểm: {data.address.specificAddress + ', ' + data.address.ward.wardName + ', ' + data.address.district.districtName + ', ' + data.address.province.provinceName}</p>
                                    <div>
                                        <div style={{ width: "750px" }}>
                                            <hr />
                                            <h4 style={{ marginBottom: 20 }}>Vui lòng điền thông tin tại đây</h4>
                                            <Form form={form}>
                                                <Row gutter={[16, 16]}>
                                                    <Col span={12} className="col-md-5 col-md-offset-2">
                                                        <Form.Item
                                                            name="isAnonymous"
                                                            label="Ẩn danh:"
                                                            valuePropName="checked"
                                                        >
                                                            <Switch
                                                                checkedChildren="Có"
                                                                unCheckedChildren="Không"
                                                                checked={isAnonymous} // Set giá trị mặc định
                                                                onChange={handleAnony} />
                                                        </Form.Item>
                                                    </Col>
                                                    {!isAnonymous && (<Col span={12} className="col-md-5">
                                                        <Form.Item
                                                            name="sponsorName"
                                                            label="Họ & tên :"
                                                            rules={[
                                                                { required: true, message: 'Vui lòng nhập họ & tên!' },
                                                            ]}
                                                        >
                                                            <Input placeholder="Nhập họ và tên" maxLength={30} disabled={isAnonymous} />
                                                        </Form.Item>
                                                    </Col>)}
                                                </Row>
                                                <Row gutter={[16, 16]}>
                                                    <Col span={12} className="col-md-5 col-md-offset-2">
                                                        <Form.Item
                                                            name="descript"
                                                            label="Mô tả:"
                                                            rules={[
                                                                { required: true, message: 'Vui lòng gửi lời mô tả!' },
                                                            ]}
                                                        >
                                                            <Input placeholder="Nhập Mô Tả" maxLength={7} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12} className="col-md-5">
                                                        <Form.Item
                                                            name="amount"
                                                            label="Số tiền quyên góp:"
                                                            rules={[
                                                                { required: true, message: 'Vui lòng nhập số tiền quyên góp!' },
                                                                { validator: validateAmount },
                                                            ]}
                                                        >
                                                            <Input placeholder="Nhập số tiền quyên góp" maxLength={15} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </div>
                                        <Row>
                                            <Col span={24} xs={24} xl={24} style={{ textAlign: "center" }}>
                                                <Button
                                                    style={{ marginTop: 10 }}
                                                    loading={butload}
                                                    onClick={() => {
                                                        SponsorActivity()
                                                    }}
                                                    type="primary" block>{"Quyên góp"}
                                                </Button>
                                            </Col>
                                        </Row>
                                        {hideQR && (<Row>
                                            <Col span={24} xs={24} xl={24}>
                                                <Image src={QR} style={{ width: 200 }} />
                                            </Col>
                                        </Row>)}
                                        {hideQR && (<Row>
                                            <Col span={24} xs={24} xl={24}>
                                                <Button
                                                    style={{ marginTop: 10 }}
                                                    loading={butload}
                                                    onClick={() => {
                                                        CancelSponsorWAct()
                                                    }}
                                                    type="primary" block>{"Huỷ"}
                                                </Button>
                                            </Col>
                                        </Row>)}
                                    </div>
                                </div>
                                : <Result
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
export default ActivitySponsorTopic;
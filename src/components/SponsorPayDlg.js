import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Form,
    Input,
    notification,
    Image,
    Button,
    Modal
} from "antd";
import { API_URL, GetFullPath, RemoveVietnameseAccents } from "../Helper/TextHelper";
import axios from 'axios';

function SponsorPayDlg({ x_objData, x_bIsShowDlg, x_evtOnCloseDlg }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [m_nMM, setMM] = useState(0);
    const [m_nSS, setSS] = useState(0);
    const [api, contextHolder] = notification.useNotification();

    const onCancel = () => {
        if (x_evtOnCloseDlg != null) {
            x_evtOnCloseDlg(false);
        }
    }
    const openNotificationWithIcon = (type, strTitle, strDescription) => {
        api[type]({
            message: strTitle,
            description: strDescription,
        });
    };

    function calculateTimeLeft(targetTime) {
        const now = new Date();
        let difference = targetTime - now;
        //htai

        if (difference < 0) {
            targetTime.setMinutes(targetTime.getMinutes() + 10);
            difference = targetTime - now;
        }

        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setMM(minutes);
        setSS(seconds);
        return {
            minutes,
            seconds,
        };
    }

    const CheckPayStatus = async () => {
        const headers = {
            "Content-Type": "application/json",
            "accept": "/",
        }
        const requestData = {
            x_strSponsorId: x_objData.sponsorId
        };
        const strApiURL = `${API_URL}api/Sponsor/CheckSponsorStatus`;
        await axios.get(strApiURL, { withCredentials: true, headers: headers, params: requestData, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess === false) {
                }
                else {
                    console.log(response.data.dataValue);
                    if (response.data.dataValue.status === "PAID"){
                        x_evtOnCloseDlg(true);
                    }
                    if (response.data.dataValue.status === "PAIDCANCELLED"){
                        x_evtOnCloseDlg(false);
                    }
                }
            })
            .catch((error) => {
            });
    }

    useEffect(() => {
        if (x_bIsShowDlg === true) {
            const targetTime = new Date();
            targetTime.setMinutes(targetTime.getMinutes() + 10);
            const interval = setInterval(() => {
                const timeLeft = calculateTimeLeft(targetTime);
                if (timeLeft.minutes === 0 && timeLeft.seconds === 0 || x_bIsShowDlg === false) {
                    clearInterval(interval);
                    x_evtOnCloseDlg(false);
                } else {
                    setTimeLeft(timeLeft);
                    CheckPayStatus();
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [x_bIsShowDlg]);

    return (
        <div>
            {contextHolder}
            {
                x_objData ?
                    <Modal
                        title="Ủng Hộ"
                        visible={x_bIsShowDlg} // Use visible instead of open
                        onCancel={onCancel}
                        footer={[
                            <Button key="back" onClick={onCancel}>
                                Huỷ
                            </Button>,
                        ]}
                    >
                        <Row>
                            <Col span={24} xs={24} xl={24} style={{ textAlign: "center" }}>
                                <Image src={x_objData.qrCode} style={{ width: 350, height: 350 }} />
                                <p><strong>Tự huỷ sau: {`${m_nMM}:${m_nSS}`}</strong></p>
                            </Col>
                            <Col span={6} xs={6} xl={6} style={{ marginTop: 15 }}>
                                <img src={x_objData.bankLogo} style={{ width: 60, height: 60 }} />
                            </Col>
                            <Col span={18} xs={18} xl={18} style={{ marginTop: 15 }}>
                                <p>Ngân Hàng:</p>
                                <strong><p>{x_objData.bankName}</p></strong>
                            </Col>
                            <Col span={6} xs={6} xl={6} style={{ marginTop: 15 }}>
                                <img src={x_objData.accountAvatar} style={{ width: 60, height: 60 }} />
                            </Col>
                            <Col span={18} xs={18} xl={18} style={{ marginTop: 15 }}>
                                <p>Tài Khoản Nhận:</p>
                                <strong><p>{x_objData.accountName} - STK: {x_objData.accountNumber}</p></strong>
                                <p>Số Tiền:</p>
                                <strong><p>{x_objData.paymentAmount} VNĐ</p></strong>
                            </Col>
                        </Row>
                    </Modal>
                    : null
            }
        </div>
    );
}

export default SponsorPayDlg;
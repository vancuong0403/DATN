import React, { useEffect, useState } from 'react';
import {
    Image,
    Row,
    Col,
    notification,
    Input,
    Button,
    Tag,
    Table,
    Modal,
    Card,
} from "antd";
import {
    BrowserRouter as Router,
    NavLink
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye, faChartBar, faDownload
} from "@fortawesome/free-solid-svg-icons";
import { API_URL, GetFullPath } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import moment from 'moment';

const MemberOutList = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isMyInfo, isBroken }) => {
    const [api, contextHolder] = notification.useNotification();
    const [m_lstMemberList, setMemberList] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [tableLoadding, setTableLoadding] = useState(true);
    const [m_bLoading, setLoading] = useState(false);
    const [m_bDownLoading, setDownLoading] = useState(false);
    const [totalItem, setSetTotalItem] = useState(0);
    const { Search } = Input;
    const openNotificationWithIcon = (type, strTitle, strDescription) => {
        api[type]({
            message: strTitle,
            description: strDescription,
        });
    };

    const errorHelper = async (data) => {
        if (data === null || data === undefined) {
            openNotificationWithIcon('error', "Mất kết nối với máy chủ", "Không thể kết nối với máy chủ, vui lòng thử lại sau ít phút hoặc báo cáo với BCN.");
            setMemberList(null);
            logout();
            return;
        }

        if (data.response && data.response.status) {
            if (data.response && data.response.status && data.response.status === 401) {
                logout();
                return;
            }
            else if (data.response && data.response.status && data.response.status === 404) {
                logout();
                return;
            }
            else {
                openNotificationWithIcon('error', `Lỗi ${data.response.status}`, data.response.error ? data.response.error : data.response.message ? data.response.message : "Xuất hiện lỗi không xác định.");
                setMemberList(null);
                logout();
                return;
            }
        }

        if (data.errorsCode && data.errorsCode === 100002) {
            // refresh token
            window.location.href = window.location.href;
        }
        else if (data.errorsCode && data.errorsCode === 100004) {
            openNotificationWithIcon('error', "Phiên đăng nhập hết hạn", "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.");
            setMemberList(null);
            logout();
        }
        else if (data.errorsCode && data.errorsCode === 200001) {
            openNotificationWithIcon('error', "Thông báo hệ thống", "Hệ thống đang bảo trì, vui lòng quay lại sau ít phút.");
        }
        else if ((data.error && (data.error === "ERR_NETWORK" || data.error === "ERR_CONNECTION_REFUSED")) ||
            (data.name && data.name === "AxiosError")) {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", "Mất kết nối với máy chủ. Vui lòng thử lại sau ít phút");
            logout();
        }
        else {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", data.errors ? data.errors[0] : "Không xác định được lỗi!");
        }
    }

    const GetMemberList = async (x_nPageSize, x_nPageIndex, x_strSearchText) => {
        setTableLoadding(true);
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const param = {
            x_nMemberType: 3,
            x_nPageSize: x_nPageSize,
            x_nPageIndex: x_nPageIndex,
            x_strSearchText: x_strSearchText,
        };
        const strApiURL = `${API_URL}api/Member/GetMemberList`;
        await axios.get(strApiURL, { withCredentials: true, params: param, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setSetTotalItem(response.data.dataCount);
                    setMemberList(response.data.dataValue);
                }
                else {
                    errorHelper(response);
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setTableLoadding(false);
        setLoading(false);
    }

    const columns = [
        {
            title: "STT",
            dataIndex: "no1",
            key: "no1",
            width: 50,
            render: (value, item, index) => (page - 1) * pageSize + index + 1
        },
        {
            title: "Ngày Gia Nhập",
            dataIndex: "joinDate",
            key: "joinDate",
            width: 50,
            render: joinDate => <span>{moment(joinDate).format('DD/MM/yyyy')}</span>
        },
        {
            title: "Avatar",
            dataIndex: "avatarPath",
            key: "avatarPath",
            width: 45,
            render: avatarPath => <Image src={GetFullPath(avatarPath, viewtoken)} style={{ width: 40, height: 40, objectFit: "cover" }} />
        },
        {
            title: "MSSV",
            dataIndex: "studentId",
            key: "studentId",
            width: 140,
        },
        {
            title: "Họ",
            dataIndex: "firstName",
            key: "firstName",
        },
        {
            title: "Tên",
            dataIndex: "lastName",
            key: "lastName",
            width: 50,
        },
        {
            title: "Giới Tính",
            dataIndex: "sex",
            key: "sex",
            width: 50,
            render: sex => <span>{sex}</span>
        },
        {
            title: "SĐT",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
        },
        {
            title: "Khoa",
            dataIndex: "facultyName",
            key: "facultyName",
        },
        {
            title: "Tổng Điểm",
            dataIndex: "totalScore",
            key: "totalScore",
            width: 90,
            render: score => <Tag color={score > 0 ? "success" : "error"}>{score.toFixed(2)}</Tag>
        },
        {
            title: "Hành Động",
            dataIndex: "action",
            render: (text, record) =>
                <Row>
                    {
                        permission.permissions.includes(2001) ?
                            <NavLink to={"/dashboard/member-list/member-info?memberid=" + record.memberId}>
                                <Col style={{ padding: 2 }}>
                                    <Button
                                        disabled={m_bLoading}
                                        type={"primary"}
                                        title="Thông tin cá nhân"
                                        icon={<FontAwesomeIcon icon={faEye} />} />
                                </Col>
                            </NavLink>
                            : null
                    }
                    <NavLink to={"/dashboard/member-list/activity-history-member?memberid=" + record.memberId}>
                        <Col style={{ padding: 2 }}>
                            <Button
                                disabled={m_bLoading}
                                color="green"
                                title="Các hoạt động"
                                type={"primary"}
                                icon={<FontAwesomeIcon icon={faChartBar} />} />
                        </Col>
                    </NavLink>
                    <Col style={{ padding: 2 }}>
                        <Button
                            disabled={m_bLoading}
                            title="Mở Facebook"
                            onClick={() => window.open(record.facebookPath, "_blank")}
                            type={"primary"}
                            icon={<i className="fab fa-facebook-f"></i>} />
                    </Col>
                </Row>
        },
    ]

    function pagination(page, pageSize) {
        setPage(page);
        setPageSize(pageSize);
        GetMemberList(pageSize, page);
    }

    const DownloadMemberList = async () => {
        setDownLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const param = {
            x_nMemberType: 3,
        };
        const strApiURL = `${API_URL}api/Member/DownloadMemberList`;
        await axios.get(strApiURL, { withCredentials: true, params: param, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    var filePath = GetFullPath(response.data.filePath, viewtoken);
                    window.open(filePath, "_blank");
                }else{
                    errorHelper(response);
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setDownLoading(false);
    }

    useEffect(() => {
        if (m_lstMemberList === null || m_lstMemberList === undefined) {
            GetMemberList(pageSize, page);
        }
    }, []);

    return (
        <div>
            {contextHolder}
            <Row >
                <Col span={24} xs={24} xl={24}>
                    <Card style={{ marginTop: 10, marginBottom: 10 }}>
                        <Row>
                            <Col span={24} xs={24} xl={24}>
                                <Search placeholder="Nhập thông tin cần tìm kiếm (VD: Tên/MSSV/SĐT)" enterButton disabled={m_bLoading} onSearch={(value) => {
                                    GetMemberList(pageSize, page, value);
                                }} />
                            </Col>
                            {
                                permission.permissions.includes(2004) ?
                                    <Col span={24} xs={24} xl={24} style={{ marginTop: 10 }}>
                                        <Row justify="start">
                                            <Col span={6} xs={0} xl={6}>
                                            </Col>
                                            <Col span={6} xs={0} xl={6}>
                                            </Col>
                                            <Col span={6} xs={0} xl={6}>
                                            </Col>
                                            <Col span={6} xs={24} xl={6}>
                                                <Button
                                                    block
                                                    icon={<FontAwesomeIcon icon={faDownload} />}
                                                    type={"primary"}
                                                    onClick={DownloadMemberList}
                                                    loading={m_bDownLoading}
                                                >Tải Xuống Danh Sách Thành Viên</Button>
                                            </Col>
                                        </Row>
                                    </Col>
                                    :
                                    null
                            }
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={m_lstMemberList}
                loading={tableLoadding}
                pagination={{
                    onChange: (page, pageSize) => {
                        pagination(page, pageSize);
                    },
                    current: page,
                    pageSize: pageSize,
                    total: totalItem
                }}
                scroll={{ x: 400 }} />
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

export default connect(mapStateToProps, mapDispatchToProps)(MemberOutList);
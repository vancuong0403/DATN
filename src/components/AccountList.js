import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
    Image,
    Row,
    Col,
    notification,
    Input,
    Button,
    Space,
    Table,
    Modal,
    Card,
} from "antd";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRotateLeft, faLock, faLockOpen
} from "@fortawesome/free-solid-svg-icons";
import { API_URL, GetFullPath, RemoveVietnameseAccents } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import { Typography } from './StyledTypography';

const AccountList = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isBroken, isToggled }) => {
    const [api, contextHolder] = notification.useNotification();
    const [m_lstMemberList, setMemberList] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [tableLoadding, setTableLoadding] = useState(true);
    const [m_bLoading, setLoading] = useState(false);
    const [searchText, setsearchText] = useState(null);
    const [searchedColumn, setsearchedColumn] = useState(null);
    const [totalItem, setSetTotalItem] = useState(0);
    const searchInput = useRef(null);
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

    const GetAccountList = async () => {
        setTableLoadding(true);
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const strApiURL = `${API_URL}api/Account/GetListAccount`;
        await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
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

    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => { setSelectedKeys(e.target.value ? [e.target.value] : []); }}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button onClick={() => { handleReset(clearFilters); }} size="small" style={{ width: 90 }}>
                        Đặt Lại
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? RemoveVietnameseAccents(record[dataIndex].toString()).toLowerCase().includes(RemoveVietnameseAccents(value.toLowerCase()))
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current.select());
            }
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setsearchText(selectedKeys[0]);
        setsearchedColumn(dataIndex);
    };

    const handleReset = clearFilters => {
        clearFilters();
        setsearchText(null);
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "no1",
            key: "no1",
            width: 50,
            render: (value, item, index) => (page - 1) * pageSize + index + 1
        },
        {
            title: "Avatar",
            dataIndex: "avatarPath",
            key: "avatarPath",
            width: 45,
            render: avatarPath => <Image src={GetFullPath(avatarPath, viewtoken)} style={{ width: 40, height: 40, objectFit: "cover" }} />
        },
        {
            title: "Tên Tài Khoản",
            dataIndex: "username",
            key: "username",
            ...(isBroken === false ? getColumnSearchProps("username") : isToggled === false ? getColumnSearchProps("username") : {}),
        },
        {
            title: "MSSV",
            dataIndex: "studentId",
            key: "studentId",
            width: 140,
            ...(isBroken === false ? getColumnSearchProps("studentId") : isToggled === false ? getColumnSearchProps("studentId") : {}),
        },
        {
            title: "Họ",
            dataIndex: "firstName",
            key: "firstName",
            ...(isBroken === false ? getColumnSearchProps("firstName") : isToggled === false ? getColumnSearchProps("firstName") : {}),
        },
        {
            title: "Tên",
            dataIndex: "lastName",
            key: "lastName",
            width: 50,
            ...(isBroken === false ? getColumnSearchProps("lastName") : isToggled === false ? getColumnSearchProps("lastName") : {}),
        },
        {
            title: "SĐT",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            ...(isBroken === false ? getColumnSearchProps("phoneNumber") : isToggled === false ? getColumnSearchProps("phoneNumber") : {}),
        },
        {
            title: "Khoa",
            dataIndex: "facultyName",
            key: "facultyName",
        },
        {
            title: "Hành Động",
            dataIndex: "action",
            render: (text, record) =>
                <Row>
                    {
                        permission.permissions.includes(1003) ?
                            <Col style={{ padding: 2 }}>
                                <Button
                                    disabled={m_bLoading}
                                    type={"primary"}
                                    title={record.isLocked ? "Mở khoá tài khoản" : "Khoá tài khoản"}
                                    danger={record.isLocked === false}
                                    icon={<FontAwesomeIcon icon={record.isLocked ? faLockOpen : faLock} />}
                                    onClick={() => { lockAndUnlock(record) }} />
                            </Col>
                            : null
                    }
                    {
                        permission.permissions.includes(1004) ?
                            <Col style={{ padding: 2 }}>
                                <Button
                                    disabled={m_bLoading}
                                    color="green"
                                    title="Khôi phục mật khẩu về mặc định"
                                    type={"primary"}
                                    icon={<FontAwesomeIcon icon={faRotateLeft} />}
                                    onClick={() => { resetPasswd(record) }} />
                            </Col>
                            : null
                    }
                </Row>
        },
    ]

    const lockAndUnlock = async (record) => {
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const param = {
            x_strAcountId: record.accountId,
        };
        const strApiURL = `${API_URL}api/Account/LockOrUnlockAccount`;
        await axios.get(strApiURL, { withCredentials: true, params: param, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    const updatedAccountList = m_lstMemberList.map(account => {
                        if (account.accountId === record.accountId) {
                            return {
                                ...account,
                                isLocked: !account.isLocked
                            };
                        }
                        return account;
                    });
                    setMemberList(updatedAccountList);
                    openNotificationWithIcon('success', "Thành công", record.isLocked ? "Mở khoá tài khoản thành công" : "Khoá tài khoản thành công");
                }
                else {
                    errorHelper(response.data);
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setLoading(false);
    }

    const resetPasswd = async (record) => {
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const param = {
            x_strAcountId: record.accountId,
        };
        const strApiURL = `${API_URL}api/Account/ResetPasswordByAdmin`;
        await axios.get(strApiURL, { withCredentials: true, params: param, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    openNotificationWithIcon('success', "Thành công", "Khôi phục tài khoản thành công");
                }
                else {
                    errorHelper(response.data);
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setLoading(false);
    }

    function pagination(page, pageSize) {
        setPage(page);
        setPageSize(pageSize);
    }

    useEffect(() => {
        if (m_lstMemberList === null || m_lstMemberList === undefined) {
            GetAccountList();
        }
    }, []);

    return (
        <div>
            {contextHolder}
            <Helmet>
                <title>Tài Khoản Thành Viên</title>
            </Helmet>
            <div className={'userinfo-main'} style={{ marginLeft: isBroken ? -30 : 15, marginRight: 15, marginBottom: 15, marginTop: 15 }}>
                <div className={'userinfo-container'}>
                    <Card className='dashboard-header'>
                        <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
                            Tài Khoản Thành Viên
                        </Typography>
                    </Card>
                    <Row >
                        <Col span={24} xs={24} xl={24}>
                            <Card style={{ marginTop: 10, marginBottom: 10 }} className='h-100'>
                                <Row>
                                    <Col span={24} xs={24} xl={24} style={{ marginTop: 10 }}>
                                        <Table
                                            columns={columns}
                                            dataSource={m_lstMemberList}
                                            loading={tableLoadding}
                                            scroll={{ x: 400 }}
                                            pagination={{
                                                onChange: (page, pageSize) => {
                                                    pagination(page, pageSize);
                                                },
                                                current: page,
                                                pageSize: pageSize,
                                                total: totalItem
                                            }} />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(AccountList);
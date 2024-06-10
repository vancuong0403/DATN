import { Helmet } from 'react-helmet';
import React, { useEffect, useState, useRef } from 'react';
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
    Radio,
    Card,
} from "antd";
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload
} from "@fortawesome/free-solid-svg-icons";
import { API_URL, GetFullPath, RemoveVietnameseAccents } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import moment from 'moment';
import { Typography } from './StyledTypography';
import { SearchOutlined } from '@ant-design/icons';

const MemberCard = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isBroken, isToggled }) => {
    const [api, contextHolder] = notification.useNotification();
    const [m_lstMemberList, setMemberList] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [tableLoadding, setTableLoadding] = useState(true);
    const [m_bLoading, setLoading] = useState(false);
    const [m_bDownLoading, setDownLoading] = useState(false);
    const [m_bDownLoadType, setDownLoadType] = useState(true);
    const [totalItem, setSetTotalItem] = useState(0);
    const [searchText, setsearchText] = useState(null);
    const [searchedColumn, setsearchedColumn] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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

    const GetMemberList = async () => {
        setTableLoadding(true);
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const param = {
            x_nMemberType: 2,
            x_nPageSize: 0,
            x_nPageIndex: 0,
        };
        const strApiURL = `${API_URL}api/Member/GetMemberList`;
        await axios.get(strApiURL, { withCredentials: true, params: param, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setSetTotalItem(response.data.dataCount);
                    var memberList = response.data.dataValue.sort((a, b) => {
                        if (a.joinDate > b.joinDate) return -1;
                        if (a.joinDate < b.joinDate) return 1;

                        if (a.lastName < b.lastName) return -1;
                        if (a.lastName > b.lastName) return 1;

                        if (a.firstName < b.firstName) return -1;
                        if (a.firstName > b.firstName) return 1;

                        return 0;
                    });
                    var members = []
                    response.data.dataValue.forEach(item => {
                        members.push({
                            key: item.memberId,
                            avatarPath: item.avatarPath,
                            studentId: item.studentId,
                            lastName: item.lastName,
                            firstName: item.firstName,
                            sex: item.sex,
                            phoneNumber: item.phoneNumber,
                            facultyName: item.facultyName,
                            joinDate: item.joinDate,
                        });
                    });
                    setMemberList(members);
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
            ...(isBroken === false? getColumnSearchProps("studentId") : isToggled === false ? getColumnSearchProps("studentId") : {}),
        },
        {
            title: "Họ",
            dataIndex: "firstName",
            key: "firstName",
            ...(isBroken === false? getColumnSearchProps("firstName") : isToggled === false ? getColumnSearchProps("firstName") : {}),
        },
        {
            title: "Tên",
            dataIndex: "lastName",
            key: "lastName",
            width: 50,
            ...(isBroken === false? getColumnSearchProps("lastName") : isToggled === false ? getColumnSearchProps("lastName") : {}),
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
        }
    ]

    const onSelectChange = selectedRowKeys => {
        console.log(selectedRowKeys);
        setSelectedRowKeys(selectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        getCheckboxProps: (record) => ({
            disabled: record.avatarPath.includes("\LogoCLB.png") || m_bDownLoadType,
        }),
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
                key: 'odd',
                text: 'Select Odd Row',
                onSelect: changableRowKeys => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return false;
                        }
                        return true;
                    });
                    setSelectedRowKeys({ selectedRowKeys: newSelectedRowKeys });
                },
            },
            {
                key: 'even',
                text: 'Select Even Row',
                onSelect: changableRowKeys => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                        if (index % 2 !== 0) {
                            return true;
                        }
                        return false;
                    });
                    setSelectedRowKeys({ selectedRowKeys: newSelectedRowKeys });
                },
            },
        ],
    };

    function pagination(page, pageSize) {
        setPage(page);
        setPageSize(pageSize);
    }

    const DownloadMemberList = async () => {
        setDownLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const requestData = {
            "memberId": selectedRowKeys,
            "isDownloadAll": m_bDownLoadType
        };
        const strApiURL = `${API_URL}api/Member/DownloadMemberCard`;
        await axios.post(strApiURL, JSON.stringify(requestData), { headers })
            .then((response) => {
                if (response.data.isSuccess) {
                    var filePath = GetFullPath(response.data.filePath, viewtoken);
                    window.open(filePath, "_blank");
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setDownLoading(false);
    }

    const ChangeTypeDownload = (e) => {
        setDownLoadType(e.target.value === 1);
    }

    useEffect(() => {
        if (m_lstMemberList === null || m_lstMemberList === undefined) {
            GetMemberList(pageSize, page);
        }
    }, []);

    return (
        <div>
            <Helmet>
                <title>Thẻ Thành Viên</title>
            </Helmet>
            <div className={'userinfo-main'} style={{ marginLeft: isBroken ? -30 : 15, marginRight: 15, marginBottom: 15, marginTop: 15 }}>
                <div className={'userinfo-container'}>
                    <Card className='dashboard-header'>
                        <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
                            Thẻ Thành Viên
                        </Typography>
                    </Card>
                    <Row style={{ marginTop: 15, marginBottom: 15, height: "100%" }}>
                        <Col span={24} xs={24} xl={24}>
                            <Card style={{ marginTop: 15, maxWidth: "88vw" }}>
                                <div>
                                    {contextHolder}
                                    <Row >
                                        <Col span={24} xs={24} xl={24}>
                                            <Card style={{ marginTop: 10, marginBottom: 10 }}>
                                                <Row>
                                                    <Col span={24} xs={24} xl={24} style={{ marginTop: 10 }}>
                                                        <Row justify="start">
                                                            <Col span={9} xs={0} xl={9}>
                                                            </Col>
                                                            <Col span={3} xs={24} xl={3}>
                                                                <Typography variant="body2" fontWeight={500}>
                                                                    Hình thức tải xuống
                                                                </Typography>
                                                            </Col>
                                                            <Col span={6} xs={24} xl={6} >
                                                                <Radio.Group disabled={m_bLoading} onChange={ChangeTypeDownload} defaultValue={1}>
                                                                    <Radio value={1}>Toàn Bộ</Radio>
                                                                    <Radio value={2}>Tuỳ Chọn</Radio>
                                                                </Radio.Group>
                                                            </Col>
                                                            <Col span={6} xs={24} xl={6} style={{ marginTop: isBroken === false ? 0 : 10 }}>
                                                                <Button
                                                                    block
                                                                    icon={<FontAwesomeIcon icon={faDownload} />}
                                                                    type={"primary"}
                                                                    onClick={DownloadMemberList}
                                                                    loading={m_bDownLoading}
                                                                    disabled={tableLoadding}
                                                                >Tải Xuống Thẻ Thành Viên</Button>
                                                            </Col>
                                                        </Row>
                                                    </Col>
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
                                        rowSelection={rowSelection}
                                        scroll={{ x: 400 }} />
                                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(MemberCard);
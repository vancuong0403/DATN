import { Helmet } from 'react-helmet';
import React, { useEffect, useState, useRef } from 'react';
import {
    Row,
    Col,
    Card,
    notification,
    Skeleton,
    Tag,
    Image,
    Button,
    Input,
    Space,
    Table,
    Layout
} from "antd";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { API_URL, GetFullPath, RemoveVietnameseAccents } from "../Helper/TextHelper";
import { ACCESS_TOKEN, MEMBER_ID, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import { Typography } from './StyledTypography';
import ImgTop1 from '../assets/images/top1.png';
import ImgTop2 from '../assets/images/Top2.png';
import ImgTop3 from '../assets/images/Top3.png';
import '../assets/styles/MemberRanking.css';

const MemberRank = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isMyInfo, isBroken, isToggled }) => {
    const [api, contextHolder] = notification.useNotification();
    const { Content, Footer, Header } = Layout;
    const [m_lstMemberRank, setMemberRank] = useState(null);
    const [m_objMyMemberRank, setMyMemberRank] = useState(null);
    const [searchText, setsearchText] = useState(null);
    const [searchedColumn, setsearchedColumn] = useState(null);
    const searchInput = useRef(null);
    const [countMember,setCountMember] = useState(null);

    const openNotificationWithIcon = (type, strTitle, strDescription) => {
        api[type]({
            message: strTitle,
            description: strDescription,
        });
    };

    const errorHelper = async (data) => {
        if (data === null || data === undefined) {
            openNotificationWithIcon('error', "Mất kết nối với máy chủ", "Không thể kết nối với máy chủ, vui lòng thử lại sau ít phút hoặc báo cáo với BCN.");
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
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", data.errors[0]);
        }
    }

    const GetMemberRanking = async () => {
        try {
            if (isLogin === true) {
                const strAccessToken = GetCookieData(ACCESS_TOKEN);
                if (strAccessToken === null || strAccessToken === undefined || strAccessToken.length == 0) {
                    logout();
                }
                else {
                    const headers = {
                        "Content-Type": "application/json",
                        "accept": "*/*",
                        "Authorization": 'Bearer ' + strAccessToken
                    }
                    const strApiURL = `${API_URL}api/Member/GetMemberRank`;
                    await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
                        .then((response) => {
                            if (response.data.isSuccess === false) {
                                errorHelper(response.data);
                            }
                            else {
                                setMemberRank(response.data.dataValue);
                                if (response.data.dataValue && response.data.dataValue.length > 0) {
                                    const strMemberId = GetCookieData(MEMBER_ID);
                                    setCountMember(response.data.dataCount);
                                    const objFoundMember = response.data.dataValue.find(member => member.memberId === strMemberId);
                                    setMyMemberRank(objFoundMember);
                                }
                            }
                        })
                        .catch((error) => {
                            errorHelper(error);
                        });
                }
            }
        } catch (error) {
            errorHelper(error);
        }
    };
    
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
            title: 'Xếp Hạng',
            dataIndex: 'rankNo',
            width: 50,
            render: (text, record) =>
                record.rankNo === 1 ?
                    <img src={ImgTop1} style={{ height: 20, width: 20 }} />
                    :
                    record.rankNo === 2 ?
                        <img src={ImgTop2} style={{ height: 20, width: 20 }} />
                        :
                        record.rankNo === 3 ?
                            <img src={ImgTop3} style={{ height: 20, width: 20 }} />
                            :
                            <span>{record.rankNo}</span>

        },
        {
            title: 'Avatar',
            dataIndex: 'avatarPath',
            key: 'avatarPath',
            width: 100,
            render: avatarPath => <Image src={GetFullPath(avatarPath, viewtoken)} style={{ width: 40, height: 40, objectFit: "cover" }} />
        },
        {
            title: 'Ngày Gia Nhập',
            dataIndex: 'joinDate',
            key: 'joinDate',
            width: 170,
        },
        {
            title: 'MSSV',
            dataIndex: 'studentId',
            key: 'studentId',
            width: 150,
            ...(isBroken === false? getColumnSearchProps("studentId") : isToggled === false ? getColumnSearchProps("studentId") : {}),
        },
        {
            title: 'Họ',
            dataIndex: 'firstName',
            key: 'firstName'
        },
        {
            title: 'Tên',
            dataIndex: 'lastName',
            key: 'lastName'
        },
        {
            title: 'Điểm Hiện Tại',
            dataIndex: 'score',
            key: 'score',
            render: scores =>
                <Row align="middle">
                    <Col>
                        {
                            Math.round(scores) === 0 ?
                                <Tag color="red">{scores}</Tag>
                                :
                                <Tag color="#108ee9">{scores.toFixed(2)}</Tag>
                        }
                    </Col>
                </Row>
        },
        {
            title: 'Tổng Điểm',
            dataIndex: 'totalScore',
            key: 'totalScore',
            render: totalScores =>
                <Row align="middle">
                    <Col>
                        {
                            Math.round(totalScores) === 0 ?
                                <Tag color="red">{totalScores}</Tag>
                                :
                                <Tag color="#108ee9">{totalScores.toFixed(2)}</Tag>
                        }
                    </Col>
                </Row>
        },
    ]

    useEffect(() => {
        GetMemberRanking();
    }, []);

    return (
        <div>
            {contextHolder}
            <Helmet>
                <title>Bảng Xếp Hạng</title>
            </Helmet>
            <div className={'member-ranking-main'}>
                <div className={'userinfo-container'} style={{ marginLeft: isBroken ? -30 : 15, marginRight: 15, marginBottom: 15, marginTop: 15 }}>
                    <Card className='dashboard-header'>
                        <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
                            Bảng Xếp Hạng
                        </Typography>
                    </Card>
                    <Row style={{ marginTop: 15, marginBottom: 15, height: "100%" }}>
                        <Col span={24} xs={24} xl={24}>
                            <Card>
                                <div>
                                    <Typography variant="body1" fontWeight={500} >
                                        Xếp Hạng Của Bạn
                                    </Typography>
                                    <hr />

                                    <Card style={{ marginTop: 15 }}>
                                        {
                                            m_objMyMemberRank ?
                                                <Row>
                                                    <Col span={4} xs={8} xl={4}>
                                                        <Image
                                                            src={GetFullPath(m_objMyMemberRank.avatarPath, viewtoken)}
                                                            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: "cover" }} />
                                                    </Col>
                                                    <Col span={20} xs={16} xl={20} style={{ textAlign: "left" }}>
                                                        <Row>
                                                            <Col span={6} xs={24} xl={6}>
                                                                <Typography variant="body1" fontWeight={500} color="#0098e5" style={{ marginBottom: 5, marginTop: 5 }}>
                                                                    {`${m_objMyMemberRank.firstName} ${m_objMyMemberRank.lastName}`}
                                                                </Typography>
                                                                <Typography variant="body1" fontWeight={500} style={{ marginTop: 5 }}>{m_objMyMemberRank.studentId}</Typography>
                                                                <Typography variant="body1" fontWeight={500} style={{ marginTop: 5 }}>Gia nhập ngày: {m_objMyMemberRank.joinDate}</Typography>
                                                                <Typography variant="body1" fontWeight={500} style={{ marginTop: 5 }}>Xếp hạng thứ {m_objMyMemberRank.rankNo}/{countMember}</Typography>
                                                                <Typography variant="body1" fontWeight={500} style={{ marginTop: 5 }}>Tổng điểm: {m_objMyMemberRank.totalScore}</Typography>
                                                            </Col>
                                                            <Col span={2} xs={24} xl={2}><br /></Col>
                                                            <Col span={16} xs={24} xl={16}>
                                                                {
                                                                    m_objMyMemberRank.totalScore && m_objMyMemberRank.totalScore > 0 ?
                                                                        <p style={{ marginTop: 15, fontSize: 16 }}>Cám ơn bạn đã có tham gia hoạt động của CLB. Mọi sự đóng góp của bạn đều được chúng tôi ghi nhận. Hi vọng trọng thời gian tới bạn sẽ dành thêm nhiều thời gian cho các hoạt động của CLB.</p>
                                                                        :
                                                                        <p style={{ marginTop: 5, fontSize: 16 }}>Thật tiếc khi chúng tôi chưa ghi nhận được hoạt động của bạn trong thời gian vừa qua. Hi vọng trong thời gian sắp tới bạn sẽ cùng chúng tôi tham gia nhiều hoạt động để góp 1 phần sức lực cho cộng đồng.</p>
                                                                }
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>

                                                :
                                                <Skeleton />
                                        }
                                    </Card>
                                </div>
                            </Card>
                        </Col>
                        <Col span={24} xs={24} xl={24}>
                            <Card style={{ marginTop: 15, marginBottom: 15 }}>
                                <Typography variant="body1" fontWeight={500} >
                                    Xếp Hạng Toàn CLB
                                </Typography>
                                <hr />
                                {
                                    m_lstMemberRank ?
                                        <Table
                                            style={{ margin: 15 }}
                                            scroll={{ x: 400 }}
                                            pagination={{ hideOnSinglePage: true }}
                                            key={m_lstMemberRank.memberId}
                                            columns={columns}
                                            dataSource={m_lstMemberRank} />
                                        :
                                        <Skeleton />
                                }
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

export default connect(mapStateToProps, mapDispatchToProps)(MemberRank);
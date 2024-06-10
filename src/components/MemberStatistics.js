import React, { useEffect, useState } from 'react';
import {
    Skeleton,
    Row,
    Col,
    notification,
    Result,
    Card,
} from "antd";
import { Bar, Pie } from 'react-chartjs-2';
import { API_URL, HEX_COLORS } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
);

const MemberStatistics = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isBroken, onChangeProken }) => {
    const [api, contextHolder] = notification.useNotification();
    const [m_objStatisic, setStatisic] = useState(null);
    const [m_objFacultyDataSet, setFacultyDataSet] = useState(null);
    const [m_objFacultyOption, setFacultyOption] = useState(null);
    const [m_objSchoolYearDataSet, setSchoolYearDataSet] = useState(null);
    const [m_objSchoolYearOption, setSchoolYearOption] = useState(null);
    const [m_objOldDataSet, setOldDataSet] = useState(null);
    const [m_objOldOption, setOldption] = useState(null);
    const [m_objSexDataSet, setSexDataSet] = useState(null);
    const [m_objSexOption, setSexption] = useState(null);
    const [m_bLoading, setLoading] = useState(true);
    const openNotificationWithIcon = (type, strTitle, strDescription) => {
        api[type]({
            message: strTitle,
            description: strDescription,
        });
    };

    function hexToRgba(hex, alpha) {
        const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

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
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", data.errors ? data.errors[0] : "Không xác định được lỗi!");
        }
    }

    const GetStatisic = async () => {
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const strApiURL = `${API_URL}api/Member/GetMemberStatisticsData`;
        await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setStatisic(response.data.dataValue);
                }
                else {
                    errorHelper(response);
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setLoading(false);
    }

    useEffect(() => {
        GetStatisic();
    }, []);

    useEffect(() => {
        const labels = [''];
        const COLORS = HEX_COLORS.map(hexColor => hexToRgba(hexColor, 0.7));
        const COLORS_BORDER = HEX_COLORS.map(hexColor => hexToRgba(hexColor, 1));
        if (m_objStatisic) {
            if (m_objStatisic.statisticsByFaculty) {
                var FacultyDatasets = m_objStatisic.statisticsByFaculty.map((data, index) => ({
                    label: data.facultyName,
                    data: [data.countMember],
                    backgroundColor: COLORS[index % COLORS.length]
                }));
                var lstFacultyData = {
                    labels,
                    datasets: FacultyDatasets
                }
                setFacultyDataSet(lstFacultyData);
                var objFacultyOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Thống kê theo Khoa/Viện',
                        },
                    }
                };
                setFacultyOption(objFacultyOptions);
            }

            if (m_objStatisic.statisticsBySchoolYear) {
                var arrSchoolYear = m_objStatisic.statisticsBySchoolYear.map(item => `Khoá K${item.year}`);
                var arrCountMembers = m_objStatisic.statisticsBySchoolYear.map(item => item.countMember);
                var lstSchoolYearData = {
                    labels: arrSchoolYear,
                    datasets: [
                        {
                            label: "Số sinh viên: ",
                            data: arrCountMembers,
                            backgroundColor: COLORS,
                            borderColor: COLORS_BORDER,
                            borderWidth: 1,
                        }
                    ]
                }
                setSchoolYearDataSet(lstSchoolYearData);
                var objSchoolYearOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Thống kê theo Khoá học',
                        },
                    }
                };
                setSchoolYearOption(objSchoolYearOptions);
            }

            if (m_objStatisic.statisticsByOld) {
                var arrOld = m_objStatisic.statisticsByOld.map(item => `Sinh Năm ${item.year}`);
                var arrOldCountMembers = m_objStatisic.statisticsByOld.map(item => item.countMember);
                var lstOldData = {
                    labels: arrOld,
                    datasets: [
                        {
                            label: "Số sinh viên: ",
                            data: arrOldCountMembers,
                            backgroundColor: COLORS,
                            borderColor: COLORS_BORDER,
                            borderWidth: 1,
                        }
                    ]
                }
                setOldDataSet(lstOldData);
                var objOldOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Thống kê theo Năm sinh',
                        },
                    }
                };
                setOldption(objOldOptions);
            }

            if (m_objStatisic.statisticsBySex) {
                var arrSex = m_objStatisic.statisticsBySex.map(item => `Giới tính ${item.sex}`);
                var arrSexCountMembers = m_objStatisic.statisticsBySex.map(item => item.countMember);
                var lstSexData = {
                    labels: arrSex,
                    datasets: [
                        {
                            label: "Số sinh viên: ",
                            data: arrSexCountMembers,
                            backgroundColor: COLORS,
                            borderColor: COLORS_BORDER,
                            borderWidth: 1,
                        }
                    ]
                }
                setSexDataSet(lstSexData);
                var objSexOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Thống kê theo Giới tính',
                        },
                    }
                };
                setSexption(objSexOptions);
            }
        }
    }, [m_objStatisic]);

    return (
        <div>
            {contextHolder}
            <Row >
                <Col span={24} xs={24} xl={24}>
                    <Card style={{ marginTop: 10, marginBottom: 10 }}>
                        <Row>
                            <Col span={12} xs={24} xl={12}>
                                <Card style={{ margin: 5 }}>
                                    {m_bLoading ?
                                        <Skeleton />
                                        :
                                        m_objFacultyDataSet && m_objFacultyOption ?
                                            <Bar options={m_objFacultyOption} data={m_objFacultyDataSet} style={{ height: 700 }} />
                                            : <Result
                                                status="404"
                                                title="Rỗng!"
                                                subTitle="Không tìm thấy dữ liệu thống kê."
                                            />
                                    }
                                </Card>
                            </Col>
                            <Col span={12} xs={24} xl={12}>
                                <Card style={{ margin: 5 }}>
                                    {
                                        m_bLoading ?
                                            <Skeleton />
                                            :
                                            m_objSchoolYearDataSet && m_objSchoolYearOption ?
                                                <Pie options={m_objSchoolYearOption} data={m_objSchoolYearDataSet} style={{ height: 700 }} />
                                                :
                                                <Result
                                                    status="404"
                                                    title="Rỗng!"
                                                    subTitle="Không tìm thấy dữ liệu thống kê."
                                                />
                                    }
                                </Card>
                            </Col>
                            <Col span={12} xs={24} xl={12}>
                                <Card style={{ margin: 5 }}>
                                    {
                                        m_bLoading ?
                                            <Skeleton />
                                            :
                                            m_objOldDataSet && m_objOldOption ?
                                                <Pie options={m_objOldOption} data={m_objOldDataSet} style={{ height: 700 }} />
                                                : <Result
                                                    status="404"
                                                    title="Rỗng!"
                                                    subTitle="Không tìm thấy dữ liệu thống kê."
                                                />
                                    }
                                </Card>
                            </Col>

                            <Col span={12} xs={24} xl={12}>
                                <Card style={{ margin: 5 }}>
                                    {
                                        m_bLoading ?
                                            <Skeleton />
                                            :
                                            m_objSexDataSet && m_objSexOption ?
                                                <Pie options={m_objSexOption} data={m_objSexDataSet} style={{ height: 700 }} />
                                                : <Result
                                                    status="404"
                                                    title="Rỗng!"
                                                    subTitle="Không tìm thấy dữ liệu thống kê."
                                                />
                                    }
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(MemberStatistics);
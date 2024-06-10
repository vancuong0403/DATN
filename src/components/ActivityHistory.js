import { Helmet } from "react-helmet";
import React, { useEffect, useState } from "react";
import {
  Image,
  Row,
  Col,
  notification,
  Card,
  Result,
  Tag,
  Table,
  Skeleton,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { API_URL, GetFullPath } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from "axios";
import { login, logout } from "../Redux/actions/actions"; // Import các action creators
// Redux Imports
import { connect } from "react-redux";
import { Typography } from "./StyledTypography";
import moment from "moment";
import { useLocation } from "react-router-dom";
import "../assets/styles/ActivityHistory.css";

const ActivityHistory = ({
  isLogin,
  fullName,
  avatarPath,
  permission,
  viewtoken,
  isdefaultpasswd,
  logout,
  login,
  isBroken,
  x_bIsMyActivityHistory,
}) => {
  const [api, contextHolder] = notification.useNotification();
  const [m_lstActivityHistory, setActivityHistory] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [m_bLoading, setLoading] = useState(false);
  const location = useLocation();
  const [memberData, setMemberData] = useState(null);

  const openNotificationWithIcon = (type, strTitle, strDescription) => {
    api[type]({
      message: strTitle,
      description: strDescription,
    });
  };

  const errorHelper = async (data) => {
    if (data === null || data === undefined) {
      openNotificationWithIcon(
        "error",
        "Mất kết nối với máy chủ",
        "Không thể kết nối với máy chủ, vui lòng thử lại sau ít phút hoặc báo cáo với BCN."
      );
      logout();
      return;
    }

    if (data.response && data.response.status) {
      if (
        data.response &&
        data.response.status &&
        data.response.status === 401
      ) {
        logout();
        return;
      } else if (
        data.response &&
        data.response.status &&
        data.response.status === 404
      ) {
        logout();
        return;
      } else {
        openNotificationWithIcon(
          "error",
          `Lỗi ${data.response.status}`,
          data.response.error
            ? data.response.error
            : data.response.message
            ? data.response.message
            : "Xuất hiện lỗi không xác định."
        );
        logout();
        return;
      }
    }

    if (data.errorsCode && data.errorsCode === 100002) {
      // refresh token
      window.location.href = window.location.href;
    } else if (data.errorsCode && data.errorsCode === 100004) {
      openNotificationWithIcon(
        "error",
        "Phiên đăng nhập hết hạn",
        "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại."
      );
      logout();
    } else if (data.errorsCode && data.errorsCode === 200001) {
      openNotificationWithIcon(
        "error",
        "Thông báo hệ thống",
        "Hệ thống đang bảo trì, vui lòng quay lại sau ít phút."
      );
    } else if (
      (data.error &&
        (data.error === "ERR_NETWORK" ||
          data.error === "ERR_CONNECTION_REFUSED")) ||
      (data.name && data.name === "AxiosError")
    ) {
      openNotificationWithIcon(
        "error",
        "Ối dồi ôi, lỗi rồi",
        "Mất kết nối với máy chủ. Vui lòng thử lại sau ít phút"
      );
      logout();
    } else {
      openNotificationWithIcon("error", "Ối dồi ôi, lỗi rồi", data.errors[0]);
    }
  };

  const GetActivityHistories = async (x_strMemberId) => {
    try {
      if (isLogin === true) {
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        if (
          strAccessToken === null ||
          strAccessToken === undefined ||
          strAccessToken.length == 0
        ) {
          logout();
        } else {
          const headers = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + strAccessToken,
          };
          const param = {
            x_strMemberId: x_strMemberId,
          };
          const strApiURL = `${API_URL}api/Activities/GetActivityHistories`;
          await axios
            .get(strApiURL, {
              withCredentials: true,
              params: param,
              headers: headers,
              credentials: "same-origin",
            })
            .then((response) => {
              if (response.data.isSuccess === false) {
                errorHelper(response.data);
              } else {
                setActivityHistory(response.data.dataValue);
              }
            })
            .catch((error) => {
              errorHelper(error);
            });
        }
        setLoading(false);
      }
    } catch (error) {
      errorHelper(error);
    }
  };

  const getStatus = (startDate, endDate) => {
    const currentDate = moment();
    const start = moment(startDate);
    const end = moment(endDate);

    if (end.isBefore(currentDate) && start.isSameOrBefore(currentDate)) {
      return 1;
    } else if (start.isAfter(currentDate)) {
      return 0;
    } else {
      return 2;
    }
  };

  const listCheckInCol = [
    {
      title: "STT",
      dataIndex: "no1",
      key: "no1",
      width: 80,
      render: (value, item, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Check In",
      dataIndex: "entryTime",
      key: "entryTime",
      render: (text, record, index) => {
        if (record.isAdditionalScore) {
          return {
            children: <span>{record.reason}</span>,
            props: {
              rowSpan: 1,
            },
          };
        }
        return (
          <span>{moment(record.entryTime).format("DD/MM/yyyy HH:mm:ss")}</span>
        );
      },
    },
    {
      title: "Check Out",
      dataIndex: "timeToLeave",
      key: "timeToLeave",
      render: (text, record) => {
        if (record.isAdditionalScore) {
          return null;
        } else {
          if (record.score === 0) {
            return <span style={{ color: "red" }}>Chưa check out</span>;
          } else {
            return (
              <span>
                {moment(record.timeToLeave).format("DD/MM/yyyy HH:mm:ss")}
              </span>
            );
          }
        }
      },
    },
    {
      title: "Điểm",
      dataIndex: "score",
      key: "score",
      width: 90,
      render: (score) => (
        <Tag color={score === 0 ? "#f50" : "#108ee9"}>{score.toFixed(2)}</Tag>
      ),
    },
    {
      title: "Quản Lý",
      dataIndex: "managerName",
      render: (text, record) => <span>{record.managerName}</span>,
    },
  ];

  function pagination(page, pageSize) {
    setPage(page);
    setPageSize(pageSize);
  }

  const sumTotalScore = (lstCheckIn) => {
    let fTotalScore = 0;
    lstCheckIn.forEach((item) => {
      fTotalScore += item.score;
    });
    return (
      <span>
        Tổng điểm:{" "}
        <Tag color={fTotalScore === 0 ? "#f50" : "#108ee9"}>
          {fTotalScore.toFixed(2)}
        </Tag>
      </span>
    );
  };

  const GetMemberById = async (x_strMemberId) => {
    try {
      if (isLogin === true) {
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        if (
          strAccessToken === null ||
          strAccessToken === undefined ||
          strAccessToken.length == 0
        ) {
          logout();
          setMemberData(undefined);
        } else {
          const headers = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + strAccessToken,
          };
          const requestData = {
            x_strMemberId: x_strMemberId,
          };
          const strApiURL = `${API_URL}api/Member/GetMemberInfo`;
          await axios
            .get(strApiURL, {
              withCredentials: true,
              headers: headers,
              params: requestData,
              credentials: "same-origin",
            })
            .then((response) => {
              if (response.data.isSuccess === false) {
                errorHelper(response.data);
              } else {
                setMemberData(response.data.dataValue);
                console.log(response.data.dataValue);
              }
            })
            .catch((error) => {
              errorHelper(error);
            });
        }
      }
    } catch (error) {
      errorHelper(null);
    }
  };

  useEffect(() => {
    if (x_bIsMyActivityHistory) {
      GetActivityHistories();
    } else {
      const searchParams = new URLSearchParams(location.search);
      const strMemberId = searchParams.get("memberid");
      if (strMemberId) {
        GetMemberById(strMemberId);
        GetActivityHistories(strMemberId);
      } else {
        window.location.href = "/dashboard";
      }
    }
  }, [x_bIsMyActivityHistory]);
  return (
    <div>
      <Helmet>
        <title>
          Lịch Sử Hoạt Động {memberData ? " - " + memberData.fullName : ""}
        </title>
      </Helmet>
      <div
        className={"userinfo-main"}
        style={{
          marginLeft: isBroken ? -30 : 15,
          marginRight: 15,
          marginBottom: 15,
          marginTop: 15,
        }}
      >
        <div className={"userinfo-container"}>
          <Card className="dashboard-header">
            <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
              Lịch Sử Hoạt Động
            </Typography>
          </Card>
          {x_bIsMyActivityHistory === false ? (
            <div>
              <Row style={{ marginTop: 15, height: "100%" }}>
                <Col span={24} xs={24} xl={24}>
                  <Card>
                    {memberData ? (
                      <Row>
                        <Col span={6} xs={24} xl={6}>
                          <Image
                            src={GetFullPath(memberData.avatarPath, viewtoken)}
                            style={{
                              width: 200,
                              height: 200,
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        </Col>
                        <Col span={18} xs={24} xl={18}>
                          <Row>
                            <Col span={24} xs={24} xl={24}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                color="#0098e5"
                              >
                                {memberData.fullName}
                              </Typography>
                              <hr />
                            </Col>
                            <Col
                              span={12}
                              xs={24}
                              xl={12}
                              style={{ textAlign: "left" }}
                            >
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                style={{ marginTop: 10 }}
                              >
                                {"Ngày sinh: " + memberData.birthDay}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                style={{ marginTop: 10 }}
                              >
                                {"Giới tính: " + memberData.sex}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                style={{ marginTop: 10 }}
                              >
                                {"Số điện thoại: " + memberData.phoneNumber}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                style={{ marginTop: 10 }}
                              >
                                {"Mã sinh viên: " + memberData.studentId}
                              </Typography>
                            </Col>

                            <Col
                              span={12}
                              xs={24}
                              xl={12}
                              style={{ textAlign: "left" }}
                            >
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                style={{ marginTop: 10 }}
                              >
                                {"Khoa/Viện: " + memberData.faculty.facultyName}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                style={{ marginTop: 10 }}
                              >
                                {"Điểm hiện tại: " +
                                  memberData.scores.toFixed(2)}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                style={{ marginTop: 10 }}
                              >
                                {"Tổng điểm: " +
                                  memberData.totalScores.toFixed(2)}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                style={{ marginTop: 10 }}
                              >
                                {"Chức vụ: " + memberData.roleName}
                              </Typography>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    ) : (
                      <Skeleton />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          ) : null}
          <Row style={{ marginBottom: 15, height: "100%" }}>
            {m_lstActivityHistory &&
            m_lstActivityHistory !== null &&
            m_lstActivityHistory !== undefined &&
            m_lstActivityHistory.length !== 0 ? (
              <Card style={{ marginTop: 15, maxWidth: "88vw" }}>
                {m_lstActivityHistory.map((item, index) => (
                  <Col
                    span={24}
                    xs={24}
                    xl={24}
                    style={{ marginTop: 15 }}
                    className="shadown-lower card-hovrer"
                  >
                    <Card>
                      <Card
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${item.id}`}
                        aria-expanded="false"
                        aria-controls={`collapse${item.id}`}
                        style={{ cursor: "pointer" }}
                      >
                        <Row>
                          <Col span={6} xs={24} xl={6}>
                            <Image
                              src={API_URL + item.posterPath}
                              style={{ width: "250px" }}
                            />
                          </Col>
                          <Col
                            span={18}
                            xs={24}
                            xl={18}
                            style={{ marginTop: isBroken ? 15 : 0 }}
                          >
                            <Row>
                              <Col span={24} xs={24} xl={24}>
                                <Typography
                                  variant="body1"
                                  fontWeight={700}
                                  color="#0098e5"
                                >
                                  {item.title}
                                </Typography>
                                <hr />
                              </Col>
                              <Col span={24} xs={24} xl={24}>
                                <Row>
                                  <Col
                                    span={11}
                                    xs={24}
                                    xl={11}
                                    style={{ textAlign: "left" }}
                                  >
                                    <div>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        Ngày bắt đầu:{" "}
                                        {moment(item.startDate).format(
                                          "DD/MM/yyyy HH:mm"
                                        )}
                                      </Typography>
                                    </div>
                                    <div style={{ marginTop: 10 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        Ngày kết thúc:{" "}
                                        {moment(item.endDate).format(
                                          "DD/MM/yyyy HH:mm"
                                        )}
                                      </Typography>
                                    </div>
                                    <div style={{ marginTop: 10 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                        style={{ whiteSpace: "pre-wrap" }}
                                      >
                                        {/* Địa điểm: {`${item.address.specificAddress}, ${item.address.ward.wardName}, ${item.address.district.districtName}, ${item.address.province.provinceName}`} */}
                                      </Typography>
                                    </div>
                                    <div style={{ marginTop: 10 }}>
                                      {getStatus(
                                        item.startDate,
                                        item.endDate
                                      ) === 0 ? (
                                        <Tag
                                          icon={<ClockCircleOutlined />}
                                          color="default"
                                          style={{ display: "inline-flex" }}
                                        >
                                          <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            style={{ whiteSpace: "pre-wrap" }}
                                          >
                                            Sắp Diễn Ra
                                          </Typography>
                                        </Tag>
                                      ) : getStatus(
                                          item.startDate,
                                          item.endDate
                                        ) === 2 ? (
                                        <Tag
                                          icon={<SyncOutlined spin />}
                                          color="processing"
                                          style={{ display: "inline-flex" }}
                                        >
                                          <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            style={{ whiteSpace: "pre-wrap" }}
                                          >
                                            Đang Diễn Ra
                                          </Typography>
                                        </Tag>
                                      ) : (
                                        <Tag
                                          icon={<CheckCircleOutlined />}
                                          color="success"
                                          style={{ display: "inline-flex" }}
                                        >
                                          <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            style={{ whiteSpace: "pre-wrap" }}
                                          >
                                            Đã Kết Thúc
                                          </Typography>
                                        </Tag>
                                      )}
                                    </div>
                                  </Col>
                                  <Col span={1} xs={0} xl={1} />
                                  <Col
                                    span={12}
                                    xs={24}
                                    xl={12}
                                    style={{
                                      textAlign: "left",
                                      marginTop: isBroken ? 15 : 0,
                                    }}
                                  >
                                    <Typography isContent={true}>
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: item.content,
                                        }}
                                      />
                                    </Typography>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Card>
                      <div class="collapse" id={`collapse${item.id}`}>
                        <Card>
                          {item.checkInList ? (
                            <div>
                              <Table
                                key={item.checkInList.id}
                                columns={listCheckInCol}
                                dataSource={item.checkInList}
                                footer={() => sumTotalScore(item.checkInList)}
                                pagination={{
                                  onChange: (page, pageSize) => {
                                    pagination(page, pageSize);
                                  },
                                  current: page,
                                  pageSize: pageSize,
                                  total: item.checkInList.length,
                                }}
                                scroll={{ x: 400 }}
                              />
                            </div>
                          ) : (
                            <div>Rỗng</div>
                          )}
                        </Card>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Card>
            ) : (
              <Col span={24} xs={24} xl={24}>
                <Card style={{ marginTop: 15 }}>
                  {m_bLoading ? (
                    <Skeleton />
                  ) : (
                    <Result
                      status="404"
                      title="Rỗng!"
                      subTitle="Không tìm thấy lịch sử hoạt động của bạn."
                    />
                  )}
                </Card>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => ({
  isLogin: state.isLogin,
  fullName: state.fullName,
  avatarPath: state.avatarPath,
  permission: state.permission,
  viewtoken: state.viewtoken,
  isdefaultpasswd: state.isdefaultpasswd,
});
const mapDispatchToProps = {
  login,
  logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityHistory);

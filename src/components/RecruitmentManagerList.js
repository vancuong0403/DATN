import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import {
  Image,
  Row,
  Col,
  notification,
  Input,
  Button,
  Space,
  Modal,
  Tag,
  Card,
  Skeleton,
  Result,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import {
  API_URL,
  GetFullPath,
  RemoveVietnameseAccents,
} from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from "axios";
import { login, logout } from "../Redux/actions/actions"; // Import các action creators
// Redux Imports
import { connect } from "react-redux";
import { Typography } from "./StyledTypography";
import "../assets/styles/ActivityHistory.css";
import { NavLink, Navigate } from "react-router-dom";
import moment from "moment";

const RecruitmentManagerList = ({
  isLogin,
  fullName,
  avatarPath,
  permission,
  viewtoken,
  isdefaultpasswd,
  logout,
  login,
  isBroken,
  isToggled,
}) => {
  const [api, contextHolder] = notification.useNotification();
  const [m_lstRecruitmentList, setRecruitmentList] = useState(null);
  const [m_bLoading, setLoading] = useState(true);
  const [m_bDelLoading, setDelLoading] = useState(false);
  const [m_bIsShowCreate, setIsShowCreate] = useState(true);
  const { confirm } = Modal;
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
      openNotificationWithIcon(
        "error",
        "Ối dồi ôi, lỗi rồi",
        data.errors ? data.errors[0] : "Không xác định được lỗi!"
      );
    }
  };

  const GetRecruitmentList = async () => {
    setLoading(true);
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + strAccessToken,
      accept: "*/*",
    };
    const strApiURL = `${API_URL}api/Recruitment/GetRecruitmentList`;
    await axios
      .get(strApiURL, {
        withCredentials: true,
        headers: headers,
        credentials: "same-origin",
      })
      .then((response) => {
        if (response.data.isSuccess) {
          setRecruitmentList(response.data.dataValue);
          var bIsShowNewBtn = response.data.dataValue.some(
            (obj) => IsShowDeletionButton(obj.isStop, obj.endTime) === false
          );
          setIsShowCreate(bIsShowNewBtn === false);
        } else {
          errorHelper(response);
        }
      })
      .catch((error) => {
        errorHelper(error);
      });
    setLoading(false);
  };

  const DeleteConfirm = (x_strId, x_strTitle) => {
    confirm({
      title: "Xoá Tuyển Thành Viên",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          Việc xoá sẽ dẫn đến không khôi phục được dữ liệu. Bạn có chắc chắn
          muốn xoá <b style={{ color: "red" }}>{x_strTitle}</b> khỏi hệ thống?
        </span>
      ),
      okText: "Đồng Ý",
      cancelText: "Huỷ",
      onOk() {
        DeleteRecruitment(x_strId, x_strTitle);
      },
    });
  };

  const IsShowDeletionButton = (isStop, endTime) => {
    if (isStop || moment(endTime).isSameOrBefore(moment())) {
      return true;
    }
    return false;
  };

  const DeleteRecruitment = async (x_strId, x_strTitle) => {
    setDelLoading(true);
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: "Bearer " + strAccessToken,
    };
    const requestData = {
      x_strRecruitmentId: x_strId,
    };
    const strApiURL = `${API_URL}api/Recruitment/DeleteRecruitment`;
    await axios
      .delete(strApiURL, {
        withCredentials: true,
        headers: headers,
        params: requestData,
        credentials: "same-origin",
      })
      .then((response) => {
        if (response.data.isSuccess === false) {
          errorHelper(response.data);
        } else {
          openNotificationWithIcon(
            "success",
            "Xoá thành công",
            `Bạn đã xoá tuyển thành viên ${x_strTitle} thành công.`
          );
          GetRecruitmentList();
        }
      })
      .catch((error) => {
        errorHelper(error);
      });
    setDelLoading(false);
  };

  useEffect(() => {
    GetRecruitmentList();
  }, []);

  return (
    <div>
      {contextHolder}
      <Row>
        <Col span={24} xs={24} xl={24}>
          <Card style={{ marginTop: 10, marginBottom: 10 }} className="h-100">
            <Row>
              <Col span={24} xs={24} xl={24} style={{ marginTop: 10 }}>
              {permission.permissions.includes(2007) ? (
                      <Col span={24} xs={24} xl={24}>
                        <NavLink
                          to={
                            "/dashboard/recruitment-manager/create-recruitment"
                          }
                          style={{ textDecoration: "none" }}
                        >
                          <Button
                            style={{ float: "right" }}
                            type={"primary"}
                            icon={<FontAwesomeIcon icon={faPlus} />}
                          >
                            Tạo Mới
                          </Button>
                        </NavLink>
                      </Col>
                    ) : null}
                {m_bLoading ? (
                  <Skeleton />
                ) : m_lstRecruitmentList ? (
                  <Row>
                    {m_lstRecruitmentList.map((item, index) => (
                      <Col
                        span={24}
                        xs={24}
                        xl={24}
                        style={{ marginTop: 15 }}
                        className="shadown-lower card-hovrer"
                      >
                        <Card className="h-100">
                          <NavLink
                            to={
                              "/dashboard/recruitment-manager/recruitment?recruitmentid=" +
                              item.id
                            }
                            style={{ textDecoration: "none" }}
                          >
                            <Card className="card-pointer">
                              <Row>
                                <Col span={24} xs={24} xl={24}>
                                  <Row>
                                    <Col span={20} xs={20} xl={20}>
                                      <Typography
                                        variant="body1"
                                        fontWeight={700}
                                        color="#0098e5"
                                      >
                                        {item.title}
                                      </Typography>
                                    </Col>
                                    <Col span={4} xs={4} xl={4}>
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color="#0098e5"
                                      >
                                        {"SL: " + item.totalRegister}
                                      </Typography>
                                    </Col>
                                  </Row>
                                </Col>
                                <Col span={24} xs={24} xl={24}>
                                  <hr />
                                </Col>
                                <Col
                                  span={6}
                                  xs={24}
                                  xl={6}
                                  style={{ textAlign: "left", marginTop: 15 }}
                                >
                                  <Typography variant="body2" fontWeight={500}>
                                    Ngày bắt đầu:{" "}
                                    {moment(item.startTime).format(
                                      "DD/MM/yyyy HH:mm"
                                    )}
                                  </Typography>
                                </Col>
                                <Col
                                  span={6}
                                  xs={24}
                                  xl={6}
                                  style={{ textAlign: "left", marginTop: 15 }}
                                >
                                  <Typography variant="body2" fontWeight={500}>
                                    Ngày kết thúc:{" "}
                                    {moment(item.endTime).format(
                                      "DD/MM/yyyy HH:mm"
                                    )}
                                  </Typography>
                                </Col>
                                <Col
                                  span={6}
                                  xs={24}
                                  xl={6}
                                  style={{ textAlign: "left", marginTop: 15 }}
                                >
                                  <Typography variant="body2" fontWeight={500}>
                                    Trạng thái:{" "}
                                    {IsShowDeletionButton(
                                      item.isStop,
                                      item.endTime
                                    ) ? (
                                      <Tag color="red">Đã Kết Thúc</Tag>
                                    ) : item.isLock ? (
                                      <Tag color="orange">Đã Kết Tạm Ngừng</Tag>
                                    ) : (
                                      <Tag color="blue">Đang Diễn Ra</Tag>
                                    )}
                                  </Typography>
                                </Col>
                                <Col
                                  span={6}
                                  xs={24}
                                  xl={6}
                                  style={{ textAlign: "left", marginTop: 15 }}
                                >
                                  <Typography variant="body2" fontWeight={500}>
                                    Người Tạo: {item.createName}
                                  </Typography>
                                </Col>
                                <Col span={24} xs={24} xl={24}>
                                  <hr />
                                </Col>
                                <Col
                                  span={24}
                                  xs={24}
                                  xl={24}
                                  style={{ textAlign: "left", marginTop: 15 }}
                                >
                                  <Typography
                                    isContent={true}
                                    rowCount={3}
                                    x_bIsMaxHeightHeight={true}
                                  >
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: item.content,
                                      }}
                                    />
                                  </Typography>
                                </Col>
                              </Row>
                            </Card>
                          </NavLink>

                          {permission.permissions.includes(2010) ? (
                            <Col span={24} xs={24} xl={24}>
                              <Button
                                onClick={() => {
                                  DeleteConfirm(item.id, item.title);
                                }}
                                style={{ float: "right", marginTop: 15 }}
                                danger
                                block
                                type={"primary"}
                                icon={<FontAwesomeIcon icon={faTrash} />}
                                loading={m_bDelLoading}
                                disabled={IsShowDeletionButton(
                                  item.isStop,
                                  item.endTime
                                )}
                              >
                                Xoá
                              </Button>
                            </Col>
                          ) : null}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Result
                    status="404"
                    title="Rỗng!"
                    subTitle="Không tìm thấy thông tin tuyển thành viên nào."
                  />
                )}
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecruitmentManagerList);

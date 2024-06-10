import React, { useEffect, useState } from "react";
import {
  notification,
  Card,
  Form,
  Row,
  Col,
  Input,
  DatePicker,
  Button,
  Skeleton,
  Result,
  Tabs,
} from "antd";
import { API_URL } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from "axios";
import { login, logout } from "../Redux/actions/actions"; // Import các action creators
// Redux Imports
import { connect } from "react-redux";
import "../assets/styles/ActivityHistory.css";
import moment from "moment-timezone";
import TextEditorCustoms from "./TextEditorCustoms";
import { useLocation } from "react-router-dom";
import {
  faTrash,
  faLock,
  faLockOpen,
  faCircleStop,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MemberRegisterList from "./MemberRegisterList";
import InterviewGroup from "./InterviewGroup";
import MemberRegisterStatistics from "./MemberRegisterStatistics";

const RecruitmentAdminTopic = ({
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
  const [m_strContent, setContent] = useState(null);
  const [m_bUpLoading, setUpLoading] = useState(false);
  const [m_bLoading, setLoading] = useState(false);
  const [m_bLoadingTable, setLoadingTable] = useState(false);
  const [m_strId, setId] = useState(null);
  const [m_objRecruitment, setRecruitment] = useState(null);
  const [m_lstMemberList, setMemberList] = useState(null);
  const { RangePicker } = DatePicker;
  const location = useLocation();
  const [recruitmentForm] = Form.useForm();
  const { TabPane } = Tabs;
  const [x_lstRoomList, setListRoom] = useState(null);
  const [page, setPage] = useState(
    <MemberRegisterList
      isBroken={isBroken}
      isToggled={isToggled}
      x_lstMemberList={m_lstMemberList}
      x_strId={m_strId}
    />
  );
  const [keyTab, setkeyTab] = useState("/memberRegister/");

  function onChangeTabs(key) {
    if (key === "/memberRegister/") {
      setkeyTab("/memberRegister/");
      setPage(
        <MemberRegisterList
          isBroken={isBroken}
          isToggled={isToggled}
          x_lstMemberList={m_lstMemberList}
          onRemoveMember={onRemoveMember}
          x_lstRoomList={x_lstRoomList}
          x_strId={m_strId}
        />
      );
    }
    if (key === "/interviewGroup/") {
      setkeyTab("/interviewGroup/");
      setPage(
        <InterviewGroup
          isBroken={isBroken}
          isToggled={isToggled}
          x_lstMemberList={m_lstMemberList}
          x_lstRoomList={x_lstRoomList}
          onRemoveGroup={onRemoveGroup}
          onAddGroup={onAddGroup}
          onChange={onChange}
          x_strId={m_strId}
        />
      );
    }
    if (key === "/memberRegisterStatistics/") {
      setkeyTab("/memberRegisterStatistics/");
      setPage(
        <MemberRegisterStatistics
          isBroken={isBroken}
          isToggled={isToggled}
          x_lstMemberList={m_lstMemberList}
          x_strId={m_strId}
        />
      );
    }
  }

  const onRemoveMember = async (x_strMemberId) => {
    setLoadingTable(true);
    const updatedList = m_lstMemberList.filter(
      (room) => room.id !== x_strMemberId
    );
    setMemberList(updatedList);
    console.log("okkk", updatedList);
    setLoadingTable(false);
  };

  const onRemoveGroup = (x_strRoomId) => {
    setLoadingTable(true);
    const updatedList = x_lstRoomList.filter((room) => room.id !== x_strRoomId);
    setListRoom(updatedList);
    console.log("okkk", updatedList);
    setLoadingTable(false);
  };

  const onAddGroup = () => {
    setLoadingTable(true);
    GetRoomInterview(m_strId);
    console.log("ok");
    setLoadingTable(false);
  };

  const onChange = (m_strId) => {
    setLoadingTable(true);
    GetApplyingForMembers(m_strId);
    console.log("ok");
    setLoadingTable(false);
  };

  const LockRecruitment = async (x_strRecrumentId) => {
    try {
      if (isLogin === true) {
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
          const requestData = {
            x_strRecruitmentId: x_strRecrumentId,
          };
          const strApiURL = `${API_URL}api/Recruitment/LockOrUnlockRecruitment`;
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
                m_objRecruitment.isLock = !m_objRecruitment.isLock;
                setRecruitment(m_objRecruitment);
                openNotificationWithIcon(
                  "success",
                  "Thành Công",
                  response.data.message
                );
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

  const DeleteRecruitment = async (x_strRecrumentId) => {
    try {
      if (isLogin === true) {
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
          const requestData = {
            x_strRecruitmentId: x_strRecrumentId,
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
                  "Thành Công",
                  response.data.message
                );
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

  const StopRecruitment = async (x_strRecrumentId) => {
    try {
      if (isLogin === true) {
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
          const requestData = {
            x_strRecruitmentId: x_strRecrumentId,
          };
          const strApiURL = `${API_URL}api/Recruitment/SetFinishRecruitment`;
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
                openNotificationWithIcon(
                  "success",
                  "Thành Công",
                  response.data.message
                );
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

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().endOf("day");
  };

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

  const UpdateRecruitment = async () => {
    setUpLoading(true);
    const strTitle = recruitmentForm.getFieldValue("title");
    const objDateTime = recruitmentForm.getFieldValue("endDate");

    var objMomentDateTime = moment(objDateTime[1].toISOString());
    const strEndDate = objMomentDateTime.format("DD/MM/YYYY HH:mm");
    objMomentDateTime = moment(objDateTime[0].toISOString());
    const strStartDate = objMomentDateTime.format("DD/MM/YYYY HH:mm");

    if (strTitle === undefined || strTitle.replace(/ /g, "") === "") {
      recruitmentForm.setFields([
        {
          name: "title",
          errors: ["Vui lòng nhập Tiêu đề!"],
        },
      ]);
      setUpLoading(false);
      return;
    }
    if (
      strEndDate === undefined ||
      strEndDate.replace(/ /g, "") === "" ||
      strStartDate === undefined ||
      strStartDate.replace(/ /g, "") === ""
    ) {
      recruitmentForm.setFields([
        {
          name: "endDate",
          errors: ["Vui lòng nhập thời gian tuyển!"],
        },
      ]);
      setUpLoading(false);
      return;
    }
    if (hasTextOnly(m_strContent) === false) {
      recruitmentForm.setFields([
        {
          name: "strContent",
          errors: ["Vui lòng nhập Nội dung!"],
        },
      ]);
      setUpLoading(false);
      return;
    }

    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: "Bearer " + strAccessToken,
    };
    const requestData = {
      id: m_strId,
      title: strTitle,
      content: m_strContent,
      endTime: strEndDate,
      startTime: strStartDate,
    };
    const strApiURL = `${API_URL}api/Recruitment/UpdateRecruitment`;
    await axios
      .put(strApiURL, JSON.stringify(requestData), { headers })
      .then((response) => {
        if (response.data.isSuccess === false) {
          errorHelper(response.data);
        } else {
          openNotificationWithIcon(
            "success",
            "Thành Công",
            "Cập nhật tuyển thành viên thành công."
          );
        }
      })
      .catch((error) => {
        errorHelper(error);
      });
    setUpLoading(false);
  };

  const OnChangeContent = (value) => {
    setContent(value);
  };

  function hasTextOnly(htmlString) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    const textContent = tempDiv.textContent || tempDiv.innerText;
    return !!textContent.trim();
  }

  const GetRecruitmentById = async (x_strRecrumentId) => {
    setLoading(true);
    try {
      if (isLogin === true) {
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        if (
          strAccessToken === null ||
          strAccessToken === undefined ||
          strAccessToken.length == 0
        ) {
          logout();
          setRecruitment(undefined);
        } else {
          const headers = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + strAccessToken,
          };
          const requestData = {
            x_strRecrumentId: x_strRecrumentId,
          };
          const strApiURL = `${API_URL}api/Recruitment/GetRecruitmentInfo`;
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
                setRecruitment(response.data.dataValue);
                setContent(response.data.dataValue.content);
                recruitmentForm.setFieldsValue({
                  title: response.data.dataValue.title,
                  endDate: [
                    moment(
                      response.data.dataValue.startTime,
                      "YYYY-MM-DD hh:mm"
                    ).add(7, "hours"),
                    moment(
                      response.data.dataValue.endTime,
                      "YYYY-MM-DD hh:mm"
                    ).add(7, "hours"),
                  ],
                });
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
    setLoading(false);
  };

  const GetApplyingForMembers = async (x_strRecrumentId) => {
    setLoadingTable(true);
    try {
      if (isLogin === true) {
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
          const requestData = {
            x_strRecruitmentId: x_strRecrumentId,
          };
          const strApiURL = `${API_URL}api/Recruitment/GetApplyingForMembers`;
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
                console.log(response.data.dataValue);
                setMemberList(response.data.dataValue);
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
    setLoadingTable(false);
  };

  const GetRoomInterview = async (x_strRecrumentId) => {
    try {
      if (isLogin === true) {
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
          const requestData = {
            x_strRecruitmentId: x_strRecrumentId,
          };
          const strApiURL = `${API_URL}api/Recruitment/GetRoomByRecruitmentId`;
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
                console.log("x_strRoomId", response.data.dataValue);
                setListRoom(response.data.dataValue);
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

  const IsShowDeletionButton = (isStop, endTime) => {
    if (isStop || moment(endTime).isSameOrBefore(moment())) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const strRecruitmentId = searchParams.get("recruitmentid");
    setId(strRecruitmentId);
    GetRecruitmentById(strRecruitmentId);
    GetRoomInterview(strRecruitmentId);
    if (permission.permissions.includes(2018)) {
      GetApplyingForMembers(strRecruitmentId);
    }
  }, []);

  useEffect(() => {
    onChangeTabs(keyTab);
  }, [m_lstMemberList, x_lstRoomList, keyTab]);

  return (
    <div>
      {contextHolder}
      <Card style={{ marginTop: 10, marginBottom: 10 }} className="h-100">
        {m_bLoading ? (
          <Skeleton />
        ) : m_objRecruitment ? (
          <div>
            <Form form={recruitmentForm} onFinish={UpdateRecruitment}>
              <Row>
                <Col span={24} xs={24} xl={24}>
                  <Row>
                    <Col span={3} xs={24} xl={3} style={{ textAlign: "left" }}>
                      Tiêu đề:
                    </Col>
                    <Col span={21} xs={24} xl={21}>
                      <Form.Item
                        name="title"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tiêu đề!",
                          },
                        ]}
                        style={{ textAlign: "left" }}
                      >
                        <Input
                          block
                          placeholder="Nhập tiêu đề"
                          disabled={
                            m_bUpLoading ||
                            IsShowDeletionButton(
                              m_objRecruitment.isStop,
                              m_objRecruitment.endTime
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={24} xs={24} xl={24}>
                  <Row>
                    <Col span={3} xs={24} xl={3} style={{ textAlign: "left" }}>
                      Thời gian tuyển:
                    </Col>
                    <Col span={21} xs={24} xl={21}>
                      <Form.Item
                        name="endDate"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập thời gian tuyển!",
                          },
                        ]}
                        style={{ textAlign: "left" }}
                      >
                        <RangePicker
                          showTime={{
                            format: "HH:mm",
                          }}
                          format="YYYY-MM-DD HH:mm"
                          style={{
                            width: "100%",
                          }}
                          // disabledDate={disabledDate}
                          disabled={
                            m_bUpLoading ||
                            IsShowDeletionButton(
                              m_objRecruitment.isStop,
                              m_objRecruitment.endTime
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={24} xs={24} xl={24}>
                  <Row>
                    <Col span={3} xs={24} xl={3} style={{ textAlign: "left" }}>
                      Nội dung:
                    </Col>
                    <Col span={21} xs={24} xl={21}>
                      <Form.Item
                        name="strContent"
                        style={{ textAlign: "left" }}
                      >
                        <TextEditorCustoms
                          x_bReadOnly={
                            m_bUpLoading ||
                            IsShowDeletionButton(
                              m_objRecruitment.isStop,
                              m_objRecruitment.endTime
                            )
                          }
                          x_strValue={m_strContent}
                          x_evtOnChange={OnChangeContent}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={8} xs={6} xl={8}></Col>
                <Col span={8} xs={12} xl={8} style={{ paddingRight: 10 }}>
                  <Form.Item>
                    <Button
                      size="large"
                      style={{ marginTop: 5 }}
                      type="primary"
                      block
                      htmlType="submit"
                      loading={m_bUpLoading}
                      disabled={IsShowDeletionButton(
                        m_objRecruitment.isStop,
                        m_objRecruitment.endTime
                      )}
                    >
                      Cập Nhật
                    </Button>
                  </Form.Item>
                </Col>
                <Col span={8} xs={6} xl={8} style={{ paddingRight: 15 }}></Col>
              </Row>
            </Form>
            <Row>
              <Col
                span={8}
                xs={8}
                xl={8}
                style={{
                  paddingLeft: isBroken ? 3 : 10,
                  paddingRight: isBroken ? 3 : 10,
                }}
              >
                {permission.permissions.includes(2011) ? (
                  <Button
                    size="large"
                    type="primary"
                    block
                    loading={m_bUpLoading}
                    disabled={IsShowDeletionButton(
                      m_objRecruitment.isStop,
                      m_objRecruitment.endTime
                    )}
                    onClick={() => {
                      LockRecruitment(m_strId);
                    }}
                    danger={m_objRecruitment.isLock === false}
                    icon={
                      <FontAwesomeIcon
                        icon={m_objRecruitment.isLock ? faLockOpen : faLock}
                      />
                    }
                  >
                    {m_objRecruitment.isLock ? "Mở Khoá" : "Khoá"}
                  </Button>
                ) : null}
              </Col>
              <Col
                span={8}
                xs={8}
                xl={8}
                style={{
                  paddingLeft: isBroken ? 3 : 10,
                  paddingRight: isBroken ? 3 : 10,
                }}
              >
                {permission.permissions.includes(2010) ? (
                  <Button
                    size="large"
                    type="primary"
                    block
                    loading={m_bUpLoading}
                    icon={<FontAwesomeIcon icon={faTrash} />}
                    danger
                    onClick={() => {
                      DeleteRecruitment(m_strId);
                    }}
                    disabled={IsShowDeletionButton(
                      m_objRecruitment.isStop,
                      m_objRecruitment.endTime
                    )}
                  >
                    Xoá
                  </Button>
                ) : null}
              </Col>
              <Col span={8} xs={8} xl={8}>
                {permission.permissions.includes(2012) ? (
                  <Button
                    size="large"
                    type="primary"
                    block
                    loading={m_bUpLoading}
                    icon={<FontAwesomeIcon icon={faCircleStop} />}
                    danger
                    onClick={() => {
                      StopRecruitment(m_strId);
                    }}
                    disabled={IsShowDeletionButton(
                      m_objRecruitment.isStop,
                      m_objRecruitment.endTime
                    )}
                  >
                    Kết Thúc
                  </Button>
                ) : null}
              </Col>
            </Row>
          </div>
        ) : (
          <Result
            status="404"
            title="Rỗng!"
            subTitle="Không tìm thấy thông tuyển thành viên."
          />
        )}
        {permission.permissions.includes(2018) ? (
          <Row>
            <Col span={24} xs={24} xl={24}>
              <hr />
            </Col>
            <Col span={24} xs={24} xl={24}>
              <Tabs onChange={onChangeTabs} activeKey={keyTab} type="card">
                <TabPane tab="Danh Sách Đăng Ký" key="/memberRegister/">
                  {page}
                </TabPane>
                <TabPane tab="Nhóm Phỏng Vấn" key="/interviewGroup/">
                  {page}
                </TabPane>
                <TabPane
                  tab="Số Liệu Thống Kê"
                  key="/memberRegisterStatistics/"
                >
                  {page}
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        ) : null}
      </Card>
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
)(RecruitmentAdminTopic);

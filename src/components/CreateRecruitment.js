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

const CreateRecruitment = ({ logout }) => {
  const [api, contextHolder] = notification.useNotification();
  const [m_strContent, setContent] = useState(null);
  const [m_bUpLoading, setUpLoading] = useState(false);
  const { RangePicker } = DatePicker;
  const [recruitmentForm] = Form.useForm();

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

  const CreateRecruitment = async () => {
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
      title: strTitle,
      content: m_strContent,
      endTime: strEndDate,
      startTime: strStartDate,
    };
    const strApiURL = `${API_URL}api/Recruitment/CreateRecruitment`;
    await axios
      .post(strApiURL, JSON.stringify(requestData), { headers })
      .then((response) => {
        if (response.data.isSuccess === false) {
          errorHelper(response.data);
        } else {
          openNotificationWithIcon(
            "success",
            "Thành Công",
            "Tạo tuyển thành viên thành công."
          );
          window.location.href = "/dashboard/recruitment-manager";
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

  return (
    <div>
      {contextHolder}
      <Card style={{ marginTop: 10, marginBottom: 10 }} className="h-100">
        <Form form={recruitmentForm} onFinish={CreateRecruitment}>
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
                      disabled={m_bUpLoading}
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
                      disabled={m_bUpLoading}
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
                  <Form.Item name="strContent" style={{ textAlign: "left" }}>
                    <TextEditorCustoms
                      x_bReadOnly={m_bUpLoading}
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
                >
                  Tạo Tuyển Thành Viên
                </Button>
              </Form.Item>
            </Col>
            <Col span={8} xs={6} xl={8} style={{ paddingRight: 15 }}></Col>
          </Row>
        </Form>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateRecruitment);

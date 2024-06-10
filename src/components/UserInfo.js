import { Helmet } from "react-helmet";
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  notification,
  Upload,
  Skeleton,
  Tag,
  Image,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Result,
} from "antd";
import ImgCrop from "antd-img-crop";
import { faPenToSquare, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingOutlined } from "@ant-design/icons";
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
import ChangeAddressDlg from "./ChangeAddressDlg";
import ChangePasswdDlg from "./ChangePasswdDlg";
import { useLocation } from "react-router-dom";

const years = [];
const months = [];
for (
  let year = new Date().getFullYear() - 16;
  year >= new Date().getFullYear() - 40;
  year--
) {
  years.push(year);
}

for (let nMonth = 1; nMonth <= 12; nMonth++) {
  months.push(nMonth);
}
const UserInfo = ({
  isLogin,
  fullName,
  avatarPath,
  permission,
  viewtoken,
  isdefaultpasswd,
  logout,
  login,
  isMyInfo,
  memberId,
  isBroken,
}) => {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [openChangeAddress, setOpenChangeAddress] = useState(false);
  const [openChangePasswd, setOpenChangePasswd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [memberInfo] = Form.useForm();
  const { Option } = Select;
  const [facultys, setFacultys] = useState(null);
  const [arrDayList, setArrDayList] = useState([]);
  const location = useLocation();

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
      setMemberData(undefined);
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
        setMemberData(undefined);
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
      setMemberData(undefined);
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

  const GetMemberById = async (x_strMemberId) => {
    setLoadingData(true);
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
    setLoadingData(false);
  };

  const GetMyInfo = async () => {
    setLoadingData(true);
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
          const strApiURL = `${API_URL}api/Member/GetMyInfo`;
          await axios
            .get(strApiURL, {
              withCredentials: true,
              headers: headers,
              credentials: "same-origin",
            })
            .then((response) => {
              if (response.data.isSuccess === false) {
                errorHelper(response.data);
              } else {
                setMemberData(response.data.dataValue);
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
    setLoadingData(false);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      openNotificationWithIcon(
        "error",
        "Sai Định Dạng Ảnh",
        "Chỉ cho phép upload ảnh có định dạng JPG/PNG."
      );
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      openNotificationWithIcon(
        "error",
        "Kích Thước File Quá Lớn",
        "Chỉ cho phép upload file có dung lượng tối đa 5MB."
      );
      return false;
    }
    return true;
  };

  const uploadAvatar = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    if (
      strAccessToken === null ||
      strAccessToken === undefined ||
      strAccessToken.length == 0
    ) {
      logout();
    } else {
      setLoading(true);
      const config = {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: "Bearer " + strAccessToken,
          accept: "*/*",
        },
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);
          setProgress(percent);
          if (percent === 100) {
            setTimeout(() => setProgress(0), 1000);
          }
          onProgress({ percent: (event.loaded / event.total) * 100 });
        },
      };
      var fmData = new FormData();
      fmData.append("Avatar", file);
      const strApiURL = `${API_URL}api/Member/UpdateAvatar`;
      await axios
        .post(strApiURL, fmData, config)
        .then((response) => {
          if (response.data.isSuccess === false) {
            errorHelper(response.data);
          } else {
            const avatarURL = GetFullPath(response.data.dataValue, viewtoken);
            openNotificationWithIcon(
              "success",
              "Thành Công",
              "Cập nhật ảnh đại diện thành công"
            );
            login(fullName, avatarURL, permission, viewtoken, isdefaultpasswd);
          }
        })
        .catch((error) => {
          errorHelper(error);
        });
      setLoading(false);
    }
  };

  const getFaculty = async () => {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    const strApiURL = `${API_URL}api/Facultys/GetAllFacultys`;
    await axios
      .get(strApiURL, {
        withCredentials: true,
        headers: headers,
        credentials: "same-origin",
      })
      .then((response) => {
        if (response.data.isSuccess) {
          setFacultys(response.data.dataValue);
        } else {
          errorHelper(response.data);
        }
      })
      .catch((error) => {
        errorHelper(error);
      });
  };

  const UpdateMyInfo = async () => {
    var isValid = true;
    const strMemberFullName = memberInfo.getFieldValue("fullName");
    const nBirthYear = memberInfo.getFieldValue("birthDayYear");
    const nBirthMonth = memberInfo.getFieldValue("birthDayMonth");
    const nBirthDay = memberInfo.getFieldValue("birthDayDay");
    const nSex = memberInfo.getFieldValue("membersex");
    const strPhoneNumber = memberInfo.getFieldValue("phoneNumber");
    const strEmail = memberInfo.getFieldValue("emailText");
    const strFacebookURL = memberInfo.getFieldValue("facebookURL");
    const strStudentId = memberInfo.getFieldValue("studentId");
    const strClassName = memberInfo.getFieldValue("className");
    const strFacultyId = memberInfo.getFieldValue("facultyName");
    setUploading(true);
    if (
      strMemberFullName === undefined ||
      strMemberFullName.replace(/ /g, "") === ""
    ) {
      memberInfo.setFields([
        {
          name: "fullName",
          errors: ["Vui lòng nhập Họ và tên"],
        },
      ]);
      isValid = false;
    }
    if (nBirthYear === undefined) {
      memberInfo.setFields([
        {
          name: "birthDayYear",
          errors: ["Vui lòng chọn Năm sinh"],
        },
      ]);
      isValid = false;
    }
    if (nBirthMonth === undefined) {
      memberInfo.setFields([
        {
          name: "birthDayMonth",
          errors: ["Vui lòng chọn Tháng sinh"],
        },
      ]);
      isValid = false;
    }
    if (nBirthDay === undefined) {
      memberInfo.setFields([
        {
          name: "birthDayDay",
          errors: ["Vui lòng chọn Ngày sinh"],
        },
      ]);
      isValid = false;
    }
    if (nSex === undefined) {
      memberInfo.setFields([
        {
          name: "membersex",
          errors: ["Vui lòng chọn Giới tính"],
        },
      ]);
      isValid = false;
    }
    if (
      strPhoneNumber === undefined ||
      strPhoneNumber.replace(/ /g, "") === ""
    ) {
      memberInfo.setFields([
        {
          name: "phoneNumber",
          errors: ["Vui lòng nhập Số điện thoại"],
        },
      ]);
      isValid = false;
    }
    if (strEmail === undefined || strEmail.replace(/ /g, "") === "") {
      memberInfo.setFields([
        {
          name: "emailText",
          errors: ["Vui lòng nhập Email"],
        },
      ]);
      isValid = false;
    }
    if (
      strFacebookURL === undefined ||
      strFacebookURL.replace(/ /g, "") === ""
    ) {
      memberInfo.setFields([
        {
          name: "facebookURL",
          errors: ["Vui lòng nhập Link Facebook"],
        },
      ]);
      isValid = false;
    }
    if (strStudentId === undefined || strStudentId.replace(/ /g, "") === "") {
      memberInfo.setFields([
        {
          name: "studentId",
          errors: ["Vui lòng nhập Mã sinh viên"],
        },
      ]);
      isValid = false;
    }
    if (strClassName === undefined || strClassName.replace(/ /g, "") === "") {
      memberInfo.setFields([
        {
          name: "className",
          errors: ["Vui lòng nhập Tên lớp"],
        },
      ]);
      isValid = false;
    }
    if (strFacultyId === undefined || strFacultyId.replace(/ /g, "") === "") {
      memberInfo.setFields([
        {
          name: "facultyName",
          errors: ["Vui lòng chọn Khoa/Viện"],
        },
      ]);
      isValid = false;
    }
    if (isValid == false) {
      setUploading(false);
      return;
    }
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: "Bearer " + strAccessToken,
    };
    const requestData = {
      fullName: strMemberFullName,
      birthDay: `${nBirthDay}/${nBirthMonth}/${nBirthYear}`,
      sex: nSex === 1 ? "Nam" : "Nữ",
      phoneNumber: strPhoneNumber,
      email: strEmail,
      linkFacebook: strFacebookURL,
      facultyId: strFacultyId,
      className: strClassName,
      studentId: strStudentId,
    };
    const strApiURL = `${API_URL}api/Member/UpdateMemberInfo`;
    await axios
      .put(strApiURL, JSON.stringify(requestData), { headers })
      .then((response) => {
        if (response.data.isSuccess === false) {
          errorHelper(response.data);
        } else {
          GetMyInfo();
          openNotificationWithIcon(
            "success",
            "Thành Công",
            "Cập nhật thông tin cá nhân thành công"
          );
        }
      })
      .catch((error) => {
        errorHelper(error);
      });
    setUploading(false);
  };

  const onChangeBirthDay = () => {
    memberInfo.setFieldsValue({ birthDayDay: undefined });
    const year = memberInfo.getFieldValue("birthDayYear");
    const month = memberInfo.getFieldValue("birthDayMonth");
    const maxDay = getMaxDaysInMonth(year, month);
    const dateList = [];
    setArrDayList(dateList);
    for (let day = 1; day <= maxDay; day++) {
      dateList.push(day);
    }
    setArrDayList(dateList);
  };

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  function getMaxDaysInMonth(year, month) {
    if (
      month === 1 ||
      month === 3 ||
      month === 5 ||
      month === 7 ||
      month === 8 ||
      month === 10 ||
      month === 12
    ) {
      return 31;
    } else if (month === 2) {
      if (isLeapYear(year)) {
        return 29;
      } else {
        return 28;
      }
    }
    return 30;
  }

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? (
        <LoadingOutlined />
      ) : isMyInfo ? (
        <img
          src={avatarPath}
          alt="avatar"
          style={{
            width: 95,
            height: 95,
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
          }}
        />
      ) : memberData ? (
        <img
          src={GetFullPath(memberData.avatarPath, viewtoken)}
          alt="avatar"
          style={{
            width: 95,
            height: 95,
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
          }}
        />
      ) : (
        <div>Upload</div>
      )}
    </button>
  );

  const onOpenAddressDialog = () => {
    setOpenChangeAddress(true);
  };

  const onCloseAddressDialog = () => {
    setOpenChangeAddress(false);
  };

  const onOpenPasswdDialog = () => {
    setOpenChangePasswd(true);
  };

  const onChangePasswdSuccess = () => {
    setOpenChangePasswd(false);
    openNotificationWithIcon(
      "success",
      "Thành Công",
      "Đổi mật khẩu thành công"
    );
  };

  const onClosePasswdDialog = () => {
    setOpenChangePasswd(false);
  };

  const onChangeAddressSuccess = () => {
    onCloseAddressDialog();
    openNotificationWithIcon(
      "success",
      "Thành Công",
      "Cập nhật địa chỉ thành công"
    );
    GetMyInfo();
  };

  const onError = (data) => {
    errorHelper(data);
  };

  useEffect(() => {
    getFaculty();
    if (isMyInfo === false) {
      const searchParams = new URLSearchParams(location.search);
      const strMemberId = searchParams.get("memberid");
      if (strMemberId) {
        GetMemberById(strMemberId);
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      GetMyInfo();
    }
  }, [isMyInfo]);

  const openFacebook = () => {
    if (memberData) {
      var fbPath = memberData.facebookPath;
      if (!fbPath.startsWith("http://") && !fbPath.startsWith("https://")) {
        fbPath = "https://" + fbPath;
      }
      window.open(fbPath, "_blank");
    }
  };

  useEffect(() => {
    if (memberData) {
      const parts = memberData.birthDay.split("/");
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      var fulladdress;
      if (
        memberData.hometown.ward &&
        memberData.hometown.district &&
        memberData.hometown.province
      ) {
        fulladdress = `${memberData.hometown.specificAddress}, ${memberData.hometown.ward.wardName}, ${memberData.hometown.district.districtName}, ${memberData.hometown.province.provinceName}`;
      } else {
        fulladdress = "";
      }
      memberInfo.setFieldsValue({ fullName: memberData.fullName });
      memberInfo.setFieldsValue({ birthDayYear: year });
      memberInfo.setFieldsValue({ birthDayMonth: month });
      onChangeBirthDay();
      memberInfo.setFieldsValue({ birthDayDay: day });
      memberInfo.setFieldsValue({
        membersex: memberData.sex.toLowerCase() === "nam" ? 1 : 2,
      });
      memberInfo.setFieldsValue({ addresstext: fulladdress });
      memberInfo.setFieldsValue({ phoneNumber: memberData.phoneNumber });
      memberInfo.setFieldsValue({ emailText: memberData.email });
      memberInfo.setFieldsValue({ facebookURL: memberData.facebookPath });
      memberInfo.setFieldsValue({ studentId: memberData.studentId });
      memberInfo.setFieldsValue({ className: memberData.className });
      memberInfo.setFieldsValue({ facultyName: memberData.faculty.id });
      if (isMyInfo === true) {
        login(
          memberData.fullName,
          avatarPath,
          permission,
          viewtoken,
          isdefaultpasswd
        );
      }
    }
  }, [memberData]);
  return (
    <div>
      {contextHolder}
      <Helmet>
        <title>
          {isMyInfo
            ? fullName
            : memberData
            ? memberData.fullName
            : "Đang tải thông tin"}
        </title>
      </Helmet>
      <div className={"userinfo-main"}>
        {memberData ? (
          <ChangeAddressDlg
            districtId={
              memberData.hometown.district
                ? memberData.hometown.district.districtId
                : undefined
            }
            provinceId={
              memberData.hometown.province
                ? memberData.hometown.province.provinceId
                : undefined
            }
            specificAddress={memberData.hometown.specificAddress}
            wardId={
              memberData.hometown.ward
                ? memberData.hometown.ward.wardId
                : undefined
            }
            isModalOpen={openChangeAddress}
            handleCancel={onCloseAddressDialog}
            onChangeAddressSuccess={onChangeAddressSuccess}
            onError={onError}
          />
        ) : null}
        <ChangePasswdDlg
          isModalOpen={openChangePasswd}
          handleCancel={onClosePasswdDialog}
          onChangePasswdSuccess={onChangePasswdSuccess}
          onError={errorHelper}
        />
        <div
          className="userinfo-container"
          style={{
            marginLeft: isBroken ? -30 : 15,
            marginRight: 15,
            marginBottom: 15,
            marginTop: 15,
          }}
        >
          <Card className="dashboard-header">
            <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
              {isMyInfo ? "Thông Tin Cá Nhân" : "Thông Tin Thành Viên"}
            </Typography>
          </Card>

          {loadingData ? (
            <Row style={{ marginTop: 15, marginBottom: 15, height: "100%" }}>
              <Col span={24} xs={24} xl={24}>
                <Card
                  className="card h-100"
                  style={{ marginRight: isBroken ? 0 : 15 }}
                >
                  <Skeleton />
                </Card>
              </Col>
            </Row>
          ) : memberData ? (
            <Row style={{ marginTop: 15, marginBottom: 15, height: "100%" }}>
              <Col span={6} xs={24} xl={6}>
                <Card
                  className="card h-100"
                  style={{ marginRight: isBroken ? 0 : 15 }}
                >
                  <Row>
                    <Col span={24} xs={24} xl={24}>
                      <ImgCrop
                        aspect={95 / 132}
                        cropperProps={"avatarCrop"}
                        modalTitle="Cập nhật hình đại diện (950 x 1320)"
                        modalOk={"Lưu"}
                        modalCancel={"Huỷ"}
                      >
                        <Upload
                          name="avatar"
                          accept="image/*"
                          listType="picture-circle"
                          showUploadList={false}
                          disabled={isMyInfo === false || loading}
                          beforeUpload={beforeUpload}
                          customRequest={uploadAvatar}
                          progress={progress}
                        >
                          {uploadButton}
                        </Upload>
                      </ImgCrop>
                    </Col>
                    <Col span={24} xs={24} xl={24}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={500}
                        color="#0098e5"
                      >
                        {memberData
                          ? memberData.fullName
                          : "Đang tải thông tin"}
                      </Typography>
                    </Col>
                    <Col span={24} xs={24} xl={24} style={{ marginTop: 20 }}>
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        color={memberData.memberType !== 0 ? "red" : ""}
                      >
                        {"Trạng thái: "}
                        {memberData.memberType === 0
                          ? "Hoạt Động"
                          : memberData.memberType === 1
                          ? "Đã Rời CLB"
                          : memberData.memberType === 2
                          ? "Khoá Tài Khoản"
                          : "Tài Khoản Mặc Định"}
                      </Typography>
                    </Col>
                    <Col span={24} xs={24} xl={24} style={{ marginTop: 20 }}>
                      <p>{`Ngày gia nhập: ${memberData.joinDate}`}</p>
                    </Col>
                    <Col span={24} xs={24} xl={24} style={{ marginTop: 5 }}>
                      <p>
                        {"Chức vụ: "}
                        <span style={{ fontWeight: "bold", color: "red" }}>
                          {memberData ? memberData.roleName : ""}
                        </span>
                      </p>
                    </Col>
                    <Col span={24} xs={24} xl={24} style={{ marginTop: 5 }}>
                      <p>
                        Điểm hoạt động:{" "}
                        {memberData.scores === 0 ? (
                          <Tag color="#f50">{memberData.scores}</Tag>
                        ) : (
                          <Tag color="#108ee9">
                            {memberData.scores.toFixed(2)}
                          </Tag>
                        )}
                      </p>
                    </Col>
                    <Col span={24} xs={24} xl={24} hidden={isMyInfo == false}>
                      <Image
                        src={GetFullPath(
                          `Images/QrCodeMember/${memberData.studentId}.png`,
                          viewtoken
                        )}
                        style={{ width: 200 }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col
                span={18}
                xs={24}
                xl={18}
                style={{ marginTop: isBroken ? 15 : 0 }}
              >
                <Card className="card h-100">
                  <Form form={memberInfo} onFinish={UpdateMyInfo}>
                    <div
                      style={{
                        marginLeft: isBroken === false ? 30 : 0,
                        marginRight: isBroken === false ? 30 : 0,
                      }}
                    >
                      <Row>
                        <Col
                          span={24}
                          xs={24}
                          xl={24}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={3}
                              xs={24}
                              xl={3}
                              style={{ textAlign: "left" }}
                            >
                              Họ Và Tên:
                            </Col>
                            <Col span={21} xs={24} xl={21}>
                              <Form.Item
                                name="fullName"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập họ và tên!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Input
                                  placeholder="Nhập họ và tên"
                                  maxLength={40}
                                  readOnly={isMyInfo === false}
                                  disabled={uploading}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row>
                        <Col
                          span={11}
                          xs={24}
                          xl={11}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={6}
                              xs={24}
                              xl={6}
                              style={{ textAlign: "left" }}
                            >
                              Ngày Sinh:
                            </Col>
                            <Col
                              span={6}
                              xs={8}
                              xl={6}
                              style={{ paddingRight: 6 }}
                            >
                              <Form.Item
                                name="birthDayYear"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn năm sinh!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Select
                                  className="text-left"
                                  placeholder="Năm"
                                  onChange={onChangeBirthDay}
                                  style={{ width: 120, float: "left" }}
                                  disabled={uploading}
                                >
                                  {years && years.length > 0 ? (
                                    years.map((year) => (
                                      <Option key={year} value={year}>
                                        {year}
                                      </Option>
                                    ))
                                  ) : (
                                    <Option value="chon">Chọn năm</Option>
                                  )}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6} xs={8} xl={6}>
                              <Form.Item
                                name="birthDayMonth"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn tháng sinh!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Select
                                  className="text-left"
                                  placeholder="Tháng"
                                  onChange={onChangeBirthDay}
                                  style={{ width: 120, float: "left" }}
                                  disabled={uploading}
                                >
                                  {months && months.length > 0 ? (
                                    months.map((month) => (
                                      <Option key={month} value={month}>
                                        Tháng {month}
                                      </Option>
                                    ))
                                  ) : (
                                    <Option value="chon">Chọn tháng</Option>
                                  )}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={6} xs={8} xl={6}>
                              <Form.Item
                                name="birthDayDay"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn ngày sinh!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Select
                                  className="text-left"
                                  placeholder="Ngày"
                                  style={{ width: 120, float: "left" }}
                                  disabled={uploading}
                                >
                                  {arrDayList && arrDayList.length > 0 ? (
                                    arrDayList.map((day) => (
                                      <Option key={day} value={day}>
                                        {day}
                                      </Option>
                                    ))
                                  ) : (
                                    <Option value="chon">Chọn ngày</Option>
                                  )}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col
                          span={11}
                          xs={24}
                          xl={11}
                          style={{ marginTop: 5, marginBottom: 5 }}
                          offset={2}
                        >
                          <Row>
                            <Col
                              span={6}
                              xs={24}
                              xl={6}
                              style={{
                                textAlign: isBroken ? "left" : "",
                                marginTop: 5,
                              }}
                            >
                              Giới Tinh:
                            </Col>
                            <Col span={18} xs={24} xl={18}>
                              <Form.Item
                                name="membersex"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn giới tính!",
                                  },
                                ]}
                                style={{ float: "left" }}
                              >
                                <Radio.Group disabled={uploading}>
                                  <Radio value={1}>Nam</Radio>
                                  <Radio value={2}>Nữ</Radio>
                                </Radio.Group>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row>
                        <Col
                          span={24}
                          xs={24}
                          xl={24}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={3}
                              xs={24}
                              xl={3}
                              style={{ textAlign: "left" }}
                            >
                              Địa Chỉ:
                            </Col>
                            <Col span={21} xs={24} xl={21}>
                              <Row>
                                <Col
                                  span={isMyInfo ? 22 : 24}
                                  xs={isMyInfo ? 22 : 24}
                                  xl={isMyInfo ? 22 : 24}
                                  style={{ paddingRight: 10 }}
                                >
                                  <Form.Item name="addresstext">
                                    <Input
                                      readOnly={true}
                                      placeholder="Chọn địa chỉ"
                                      disabled={uploading}
                                    />
                                  </Form.Item>
                                </Col>
                                {isMyInfo ? (
                                  <Col span={2} xs={2} xl={2}>
                                    <Button
                                      type="primary"
                                      block
                                      icon={
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                      }
                                      onClick={onOpenAddressDialog}
                                      readOnly={isMyInfo === false}
                                      disabled={uploading}
                                    />
                                  </Col>
                                ) : null}
                              </Row>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row>
                        <Col
                          span={12}
                          xs={24}
                          xl={12}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={6}
                              xs={24}
                              xl={6}
                              style={{ textAlign: "left" }}
                            >
                              Số Điện Thoại:
                            </Col>
                            <Col span={18} xs={24} xl={18}>
                              <Form.Item
                                name="phoneNumber"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập số điện thoại!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Input
                                  placeholder="Nhập số điện thoại"
                                  maxLength={15}
                                  readOnly={isMyInfo === false}
                                  disabled={uploading}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col
                          span={12}
                          xs={24}
                          xl={12}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={6}
                              xs={24}
                              xl={6}
                              style={{ textAlign: isBroken ? "left" : "" }}
                            >
                              Email:
                            </Col>
                            <Col span={18} xs={24} xl={18}>
                              <Form.Item
                                name="emailText"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập email!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Input
                                  placeholder="Nhập email"
                                  type="email"
                                  maxLength={255}
                                  readOnly={isMyInfo === false}
                                  disabled={uploading}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row>
                        <Col
                          span={24}
                          xs={24}
                          xl={24}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={3}
                              xs={24}
                              xl={3}
                              style={{ textAlign: "left" }}
                            >
                              Facebook:
                            </Col>
                            <Col span={21} xs={24} xl={21}>
                              <Row>
                                <Col
                                  span={22}
                                  xs={22}
                                  xl={22}
                                  style={{ paddingRight: 10 }}
                                >
                                  <Form.Item
                                    name="facebookURL"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Vui lòng nhập link facebook!",
                                      },
                                    ]}
                                    style={{ textAlign: "left" }}
                                  >
                                    <Input
                                      placeholder="Nhập link facebook"
                                      type="url"
                                      maxLength={255}
                                      readOnly={isMyInfo === false}
                                      disabled={uploading}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={2} xs={2} xl={2}>
                                  <Button
                                    type="primary"
                                    block
                                    icon={<FontAwesomeIcon icon={faGlobe} />}
                                    onClick={openFacebook}
                                    readOnly={isMyInfo === false}
                                    disabled={uploading}
                                  />
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row>
                        <Col
                          span={12}
                          xs={24}
                          xl={12}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={6}
                              xs={24}
                              xl={6}
                              style={{ textAlign: "left" }}
                            >
                              Mã Số Sinh Viên:
                            </Col>
                            <Col span={18} xs={24} xl={18}>
                              <Form.Item
                                name="studentId"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập mã sinh viên!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Input
                                  placeholder="Nhập mã sinh viên"
                                  maxLength={20}
                                  readOnly={isMyInfo === false}
                                  disabled={uploading}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col
                          span={12}
                          xs={24}
                          xl={12}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={6}
                              xs={24}
                              xl={6}
                              style={{ textAlign: isBroken ? "left" : "" }}
                            >
                              Lớp:
                            </Col>
                            <Col span={18} xs={24} xl={18}>
                              <Form.Item
                                name="className"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập tên lớp!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Input
                                  placeholder="Nhập tên lớp"
                                  maxLength={40}
                                  readOnly={isMyInfo === false}
                                  disabled={uploading}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row>
                        <Col
                          span={24}
                          xs={24}
                          xl={24}
                          style={{ marginTop: 5, marginBottom: 5 }}
                        >
                          <Row>
                            <Col
                              span={3}
                              xs={24}
                              xl={3}
                              style={{ textAlign: "left" }}
                            >
                              Khoa/Viện:
                            </Col>
                            <Col span={21} xs={24} xl={21}>
                              <Form.Item
                                name="facultyName"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn khoa viện!",
                                  },
                                ]}
                                style={{ textAlign: "left" }}
                              >
                                <Select
                                  showSearch
                                  className="text-left"
                                  placeholder="Chọn khoa/viện"
                                  filterOption={(input, option) =>
                                    RemoveVietnameseAccents(option.children)
                                      .toLowerCase()
                                      .indexOf(
                                        RemoveVietnameseAccents(
                                          input
                                        ).toLowerCase()
                                      ) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.value
                                      .toLowerCase()
                                      .localeCompare(
                                        optionB.value.toLowerCase()
                                      )
                                  }
                                  disabled={uploading}
                                >
                                  {facultys != null ? (
                                    facultys.map((facultyItem) => (
                                      <Option
                                        key={facultyItem.id}
                                        value={facultyItem.id}
                                      >
                                        {facultyItem.facultyName}
                                      </Option>
                                    ))
                                  ) : (
                                    <Option value="chon">Chọn Khoa/Viện</Option>
                                  )}
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row hidden={isMyInfo === false}>
                        <Col span={6} xs={0} xl={6}></Col>
                        <Col
                          span={6}
                          xs={12}
                          xl={6}
                          style={{ paddingRight: 10 }}
                        >
                          <Form.Item>
                            <Button
                              size="large"
                              style={{ marginTop: 5 }}
                              type="primary"
                              block
                              htmlType="submit"
                              loading={uploading}
                            >
                              Cập Nhật
                            </Button>
                          </Form.Item>
                        </Col>
                        <Col
                          span={6}
                          xs={12}
                          xl={6}
                          style={{ paddingLeft: 10 }}
                        >
                          <Form.Item>
                            <Button
                              size="large"
                              danger
                              style={{ marginTop: 5 }}
                              disabled={uploading}
                              type="primary"
                              block
                              onClick={onOpenPasswdDialog}
                            >
                              Đổi Mật Khẩu
                            </Button>
                          </Form.Item>
                        </Col>
                        <Col
                          span={6}
                          xs={0}
                          xl={6}
                          style={{ paddingRight: 15 }}
                        ></Col>
                      </Row>
                    </div>
                  </Form>
                </Card>
              </Col>
            </Row>
          ) : (
            <Result
              status="404"
              title="Rỗng!"
              subTitle="Không tìm thấy thông tin cá nhân."
            />
          )}
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

export default connect(mapStateToProps, mapDispatchToProps)(UserInfo);

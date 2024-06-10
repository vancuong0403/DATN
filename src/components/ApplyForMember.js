import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  Row,
  Select,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { Option } from "antd/es/mentions";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL, RemoveVietnameseAccents } from "../Helper/TextHelper";
import moment from "moment";
import { useNavigate } from "react-router";

function ApplyForMember({ x_objData }) {
  const navigate = useNavigate();
  const [captChaImage, setCaptChaImage] = useState(null);
  const [captChaToken, setCaptChaToken] = useState("");
  const [modaform] = Form.useForm();
  const [provinceId, setProvinceId] = useState(null);
  const [districtList, setDistrictList] = useState(null);
  const [districtId, setDistrictId] = useState(null);
  const [wardList, setWardList] = useState(null);
  const [wardId, setWardId] = useState(null);
  const [provinceList, setProvinceList] = useState(null);
  const [isRecruitValid, setIsRecryitValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facultys, setFacultys] = useState(null);

  const [inputIsNull, setInputIsNull] = useState(true);
  const [registing, setRegisting] = useState(false);
  const [isSuccsess, setIsSuccsess] = useState(false);
  const [email, setEmail] = useState(null);
  const [readingTime, setReadingTime] = useState(null);
  const [bIsShowModal, setIsShowModal] = useState(false);
  const [bShowCheckBox, setShowCheckBox] = useState(true);

  async function getCaptCha() {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    let requestData = {
      token: captChaToken,
    };

    await axios
      .post(API_URL + "api/Account/GetCaptcha", JSON.stringify(requestData), {
        headers,
      })
      .then((response) => {
        if (response.data.isSuccess === true) {
          setCaptChaToken(response.data.dataValue.token);
          setCaptChaImage(response.data.dataValue.captchaPath);
        } else {
        }
      })
      .catch((response) => {});
  }

  function getFaculty() {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    axios
      .get(API_URL + "api/Facultys/GetAllFacultys", { headers: headers })
      .then((response) => {
        if (response.data.isSuccess) {
          setFacultys(response.data.dataValue);
        }
      })
      .catch((response) => {});
  }

  const onRegisting = async () => {
    setRegisting(true);
    let isValid = true;
    let captCha = modaform.getFieldValue("captchacode");
    let fullName = modaform.getFieldValue("fullname");
    let birthday = modaform.getFieldValue("birthday");
    let sex = modaform.getFieldValue("sex");
    let province = modaform.getFieldValue("province");
    let district = modaform.getFieldValue("district");
    let ward = modaform.getFieldValue("ward");
    let street = modaform.getFieldValue("street");
    let phonenumber = modaform.getFieldValue("phonenumber");
    let email = modaform.getFieldValue("email");
    let facebookpath = modaform.getFieldValue("facebookpath");
    let studentid = modaform.getFieldValue("studentid");
    let faculty = modaform.getFieldValue("faculty");
    let classname = modaform.getFieldValue("classname");
    let reason = modaform.getFieldValue("reason");
    console.log("aaa", captCha);
    console.log("aaa", fullName);
    console.log("aaa", birthday);
    console.log("aaa", sex);
    console.log("aaa", province);
    console.log("aaa", district);
    console.log("aaa", ward);
    console.log("aaa", street);
    console.log("aaa", phonenumber);
    console.log("aaa", email);
    console.log("aaa", facebookpath);
    console.log("aaa", studentid);
    console.log("aaa", faculty);
    console.log("aaa", classname);
    console.log("aaa", reason);
    if (fullName === undefined || fullName.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "fullname",
          errors: ["Vui lòng nhập họ và tên"],
        },
      ]);
    }
    if (captCha === undefined || captCha.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "captchacode",
          errors: ["Vui lòng nhập mã xác nhận"],
        },
      ]);
    }

    if (classname === undefined || classname.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "classname",
          errors: ["Vui lòng nhập lớp"],
        },
      ]);
    }

    if (studentid === undefined || studentid.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "studentid",
          errors: ["Vui lòng nhập mã sinh viên"],
        },
      ]);
    }
    if (phonenumber === undefined || phonenumber.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "phonenumber",
          errors: ["Vui lòng nhập số điện thoại"],
        },
      ]);
    }
    if (street === undefined || street.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "street",
          errors: ["Vui lòng nhập số nhà"],
        },
      ]);
    }
    if (email === undefined || email.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "email",
          errors: ["Vui lòng nhập email"],
        },
      ]);
    }
    if (facebookpath === undefined || facebookpath.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "facebookpath",
          errors: ["Vui lòng nhập link Facebook"],
        },
      ]);
    }

    if (birthday === undefined) {
      modaform.setFields([
        {
          name: "birthday",
          errors: ["Vui lòng nhập ngày sinh"],
        },
      ]);
    }

    if (sex === undefined) {
      modaform.setFields([
        {
          name: "sex",
          errors: ["Vui lòng chọn giới tính"],
        },
      ]);
    }

    if (province === undefined) {
      modaform.setFields([
        {
          name: "province",
          errors: ["Vui lòng chọn Tỉnh/Thành"],
        },
      ]);
    }

    if (district === undefined) {
      modaform.setFields([
        {
          name: "district",
          errors: ["Vui lòng chọn Quận/Huyện"],
        },
      ]);
    }

    if (ward === undefined) {
      modaform.setFields([
        {
          name: "ward",
          errors: ["Vui lòng chọn Xã/Phường"],
        },
      ]);
    }

    if (faculty === undefined) {
      modaform.setFields([
        {
          name: "faculty",
          errors: ["Vui lòng chọn Khoa/Viện chủ quản"],
        },
      ]);
    }

    let errorList = modaform.getFieldsError();

    errorList.forEach((error) => {
      if (error.errors.length > 0) {
        isValid = false;
      }
    });

    if (reason === undefined || reason.replace(/ /g, "") === "") {
      modaform.setFields([
        {
          name: "reason",
          errors: ["Vui lòng nhập lý do bạn muốn tham gia CLB"],
        },
      ]);
    }

    if (isValid) {
      var objMomentDateTime = moment(birthday.toISOString());
      const birthDayFormat = objMomentDateTime.format("DD/MM/YYYY");
      const memberRegisterRequestModel = {
        fullName: fullName,
        birthDay: birthDayFormat,
        sex: sex === 1 ? "Nam" : "Nữ",
        provinceId: province,
        districtId: district,
        wardId: ward,
        specificAddress: street,
        phoneNumber: phonenumber,
        email: email,
        linkFacebook: facebookpath,
        facultyId: faculty,
        className: classname,
        studentId: studentid,
        reason: reason,
        recruitId: x_objData.id,
        token: captChaToken,
        captcha: captCha,
      };
      console.log("te", JSON.stringify(memberRegisterRequestModel));
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
      };
      await axios
        .post(
          API_URL + "api/Recruitment/ApplyingForMember",
          JSON.stringify(memberRegisterRequestModel),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            message.success("Đăng ký thành công");
            navigate("/");
            setEmail(email);
            setIsSuccsess(true);
          } else {
            message.error(response.data.errors);
          }
          setRegisting(false);
        })
        .catch((response) => {
          message.error("Mất kết nối với máy chủ");
          setRegisting(false);
        });
      // navigate("/");
    } else {
      setRegisting(false);
    }
  };

  const getDistrict = async (proviceId) => {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    await axios
      .get(
        API_URL + "api/Address/GetDistrictsByProvinceId",
        {
          params: {
            x_strProvinceId: proviceId,
          },
        },
        { headers: headers }
      )
      .then((response) => {
        if (response.data.isSuccess) {
          setDistrictList(response.data.dataValue);
        } else {
          message.error(response.data.errors[0]);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");
      });
  };

  const getWards = async (districtId) => {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    await axios
      .get(
        API_URL + "api/Address/GetWardsByDistrictId",
        {
          params: {
            x_strDistrictId: districtId,
          },
        },
        { headers: headers }
      )
      .then((response) => {
        if (response.data.isSuccess) {
          setWardList(response.data.dataValue);
        } else {
          message.error(response.data.errors[0]);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");
      });
  };
  function getProvince() {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    axios
      .get(API_URL + "api/Address/GetProvinces", { headers: headers })
      .then((response) => {
        if (response.data.isSuccess) {
          setProvinceList(response.data.dataValue);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ!");
      });
  }
  const handleChangeProvince = (e) => {
    modaform.setFields([
      {
        name: "district",
        value: undefined,
      },
    ]);
    modaform.setFields([
      {
        name: "ward",
        value: undefined,
      },
    ]);
    getDistrict(e);
  };
  const handleChangeDistrict = (e) => {
    modaform.setFields([
      {
        name: "ward",
        value: undefined,
      },
    ]);
    getWards(e);
  };

  useEffect(() => {
    getProvince();
    getFaculty();
    getCaptCha();
  }, []);

  return (
    <>
      <div>
        <div style={{ textAlign: "center" }}>
          <h2>Đăng ký thành viên </h2>
        </div>
        <h6 style={{ marginBottom: 25 }}>
          Nhận hồ sơ từ:{" "}
          {moment(x_objData.startTime).format("DD/MM/yyyy HH:mm ")} đến:{" "}
          {moment(x_objData.endTime).format("DD/MM/yyyy HH:mm")}
        </h6>
        <Form form={modaform}>
          <Row>
            <Col span={24} xs={24} xl={24}>
              <Form.Item
                name="fullname"
                label="Họ & tên:"
                labelCol={{ span: 4 }}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ & tên",
                  },
                ]}
              >
                <Input
                  disabled={registing}
                  placeholder="Nhập họ và tên"
                  maxLength={30}
                  style={{ width: "100%" }} // Chỉnh độ rộng 100%
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12} xs={24} xl={12}>
              {/* Ngày sinh thành viên */}
              <Form.Item
                name="birthday"
                label="Ngày sinh:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  { required: true, message: "Vui lòng nhập ngày sinh!" },
                ]}
              >
                <DatePicker
                  disabled={registing}
                  className={"container"}
                  showToday={false}
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
            <Col span={12} xs={24} xl={12}>
              {/* Giới tính thành viên */}
              <Form.Item
                name="sex"
                label="Giới tính:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Radio.Group>
                  <Radio disabled={registing} value={1}>
                    Nam
                  </Radio>
                  <Radio disabled={registing} value={2}>
                    Nữ
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12} xs={24} xl={12}>
              <Form.Item
                name="province"
                label="Tỉnh/Thành phố:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  { required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" },
                ]}
              >
                <Select
                  showSearch
                  disabled={registing}
                  placeholder="Chọn Tỉnh/Thành phố"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    RemoveVietnameseAccents(option.children)
                      .toLowerCase()
                      .indexOf(RemoveVietnameseAccents(input).toLowerCase()) >=
                    0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.value
                      .toLowerCase()
                      .localeCompare(optionB.value.toLowerCase())
                  }
                  value={provinceId}
                  onChange={handleChangeProvince}
                >
                  {provinceList != null ? (
                    provinceList.map((province) => (
                      <option value={province.provinceId}>
                        {province.provinceName}
                      </option>
                    ))
                  ) : (
                    <Option value="chon">Chọn Tỉnh/Thành phố</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} xs={24} xl={12}>
              <Form.Item
                name="district"
                label="Quận/Huyện:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  { required: true, message: "Vui lòng chọn Quận/Huyện!" },
                ]}
              >
                <Select
                  disabled={registing}
                  showSearch
                  placeholder="Chọn quận/huyện"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    RemoveVietnameseAccents(option.children)
                      .toLowerCase()
                      .indexOf(RemoveVietnameseAccents(input).toLowerCase()) >=
                    0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.value
                      .toLowerCase()
                      .localeCompare(optionB.value.toLowerCase())
                  }
                  defaultValue={districtId}
                  onChange={handleChangeDistrict}
                >
                  {districtList != null ? (
                    districtList.map((district) => (
                      <option value={district.districtId}>
                        {district.districtName}
                      </option>
                    ))
                  ) : (
                    <Option value="chon">Chọn Quận/Huyện</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12} xs={24} xl={12}>
              <Form.Item
                name="ward"
                label="Xã/Phường:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  { required: true, message: "Vui lòng chọn Xã/Phường!" },
                ]}
              >
                <Select
                  showSearch
                  disabled={registing}
                  placeholder="Chọn Xã/Phường"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    RemoveVietnameseAccents(option.children)
                      .toLowerCase()
                      .indexOf(RemoveVietnameseAccents(input).toLowerCase()) >=
                    0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.value
                      .toLowerCase()
                      .localeCompare(optionB.value.toLowerCase())
                  }
                  defaultValue={wardId}
                >
                  {wardList != null ? (
                    wardList.map((ward) => (
                      <option value={ward.wardId}>{ward.wardName}</option>
                    ))
                  ) : (
                    <Option value="chon">Chọn Xã/Phường</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} xs={24} xl={12}>
              <Form.Item
                name="street"
                rules={[{ required: true, message: "Vui lòng nhập Đường!" }]}
                label="Số nhà:"
                labelCol={{ span: 8 }}
                labelAlign="left"
              >
                <Input
                  disabled={registing}
                  rows={2}
                  placeholder="Nhập số nhà"
                  maxLength={40}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12} xs={24} xl={12}>
              {/* Số điện thoại thành viên */}
              <Form.Item
                name="phonenumber"
                label="Điện thoại:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input
                  disabled={registing}
                  placeholder="Nhập số điện thoại"
                  maxLength={15}
                />
              </Form.Item>
            </Col>
            <Col span={12} xs={24} xl={12}>
              {/* email thành viên */}
              <Form.Item
                name="email"
                label="Email:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  disabled={registing}
                  type="email"
                  placeholder="Nhập email"
                  maxLength={100}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12} xs={24} xl={12}>
              <Form.Item
                name="facebookpath"
                label="Facebook:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  { required: true, message: "Vui lòng nhập facebook!" },
                  { type: "url", message: "Link không hợp lệ!" },
                ]}
              >
                <Input
                  disabled={registing}
                  placeholder="Nhập link Facebook"
                  maxLength={150}
                />
              </Form.Item>
            </Col>
            <Col span={12} xs={24} xl={12}>
              <Form.Item
                name="studentid"
                label="Mã số sinh viên:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã sinh viên!",
                  },
                ]}
              >
                <Input
                  disabled={registing}
                  placeholder="Nhập mã sinh viên"
                  maxLength={15}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12} xs={24} xl={12}>
              <Form.Item
                name="faculty"
                label="Khoa/ viện:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn khoa viện!",
                  },
                ]}
              >
                <Select
                  disabled={registing}
                  showSearch
                  placeholder="Chọn khoa/viện"
                  filterOption={(input, option) =>
                    RemoveVietnameseAccents(option.children)
                      .toLowerCase()
                      .indexOf(RemoveVietnameseAccents(input).toLowerCase()) >=
                    0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.value
                      .toLowerCase()
                      .localeCompare(optionB.value.toLowerCase())
                  }
                >
                  {facultys != null ? (
                    facultys.map((facultyItem) => (
                      <option value={facultyItem.id}>
                        {facultyItem.facultyName}
                      </option>
                    ))
                  ) : (
                    <Option value="chon">Chọn Khoa/Viện</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} xs={24} xl={12}>
              {/* Mã lớp */}
              <Form.Item
                name="classname"
                label="Lớp:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}
              >
                <Input
                  disabled={registing}
                  placeholder="Nhập tên lớp"
                  maxLength={15}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col span={12} xs={24} xl={12}>
              {/* Mã lớp */}
              <Form.Item
                name="reason"
                label="Lý do:"
                labelCol={{ span: 8 }}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập lý do bạn muốn tham gia clb!",
                  },
                ]}
              >
                <TextArea
                  rows={3}
                  showCount
                  maxLength={500}
                  disabled={registing}
                  placeholder="Lý do bạn muốn tham gia CLB của chúng tôi"
                />
              </Form.Item>
            </Col>
            <Col span={12} xs={24} xl={12}>
              <Form.Item
                name="captchacode"
                label="Mã xác nhận:"
                labelAlign="left"
                labelCol={{ span: 8 }}
                rules={[
                  {
                    required: true,
                    message: "Mã xác nhận không được để trống!",
                  },
                ]}
                style={{ display: "flex" }}
              >
                <Row>
                  <Col span={12} xs={12} xl={12}>
                    <img
                      style={{ width: 150 }}
                      src={API_URL + captChaImage}
                      className="captchaimage"
                    />
                  </Col>
                  <Col span={12} xs={12} xl={12}>
                    <Input
                      style={{ marginTop: 7, marginLeft: 30, width: 150 }}
                      size="large"
                      disabled={registing}
                      maxLength={6}
                      placeholder="Mã xác nhận"
                      className="inputstudentid"
                    />
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
          <Button
            loading={registing}
            block
            type="primary"
            onClick={onRegisting}
          >
            Đăng ký
          </Button>
        </Form>
      </div>
    </>
  );
}

export default ApplyForMember;

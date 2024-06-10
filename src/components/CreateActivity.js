import React, { useEffect, useState } from "react";
import {
  Layout,
  message,
  DatePicker,
  Row,
  Col,
  Input,
  Form,
  Button,
  Modal,
  Upload,
  Select,
  Switch,
} from "antd";
import axios from "axios";
import { Helmet } from "react-helmet";
import { ImageResize } from "./ImageResize";
import Preview from "./Preview";
import ReactQuill, { Quill } from "react-quill";
import ImageUploader from "quill-image-uploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import "react-quill/dist/quill.snow.css";
import "../assets/styles/quill-video-resize.css";
import "../assets/styles/createrecuit.css";
import { Video } from "./quill-video-resize";
import { API_URL, RemoveVietnameseAccents } from "../Helper/TextHelper";
import TextEditorCustoms from "./TextEditorCustoms";

import {
  ACCESS_TOKEN,
  GetCookieData,
  LogOutClearCookie,
} from "../Helper/CookieHelper";

Quill.register("modules/imageUploader", ImageUploader);
Quill.register("modules/imageResize", ImageResize);
Quill.register({ "formats/video": Video });
const { RangePicker } = DatePicker;
const { Content } = Layout;
const dateFormat = "YYYY-MM-DD hh:mm";
var upLoadImages = [];
var addImage = false;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
    [{ color: [] }, { background: [] }],

    [{ align: [] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    [{ direction: "rtl" }],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
  history: {
    delay: 1000,
    maxStack: 50,
    userOnly: false,
  },
  imageUploader: {
    upload: async (file) => {
      const token = GetCookieData(ACCESS_TOKEN);
      var fmData = new FormData();
      const config = {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: "Bearer " + token,
          accept: "*/*",
        },
      };
      fmData.append("image", file);
      try {
        const res = await axios.post(
          API_URL + "api/Newspaper/UploadImage",
          fmData,
          config
        );
        if (res.data.isSuccess) {
          addImage = true;
          var images = upLoadImages;
          images.push(res.data.dataValue);
          upLoadImages = images;
          return API_URL + res.data.dataValue;
        } else {
          if (res.data.errors[0].indexOf("(401)") >= 0) {
            LogOutClearCookie();
            window.location.href = "/";
          }
          message.error(res.data.errors[0]);
          return null;
        }
      } catch (err) {
        if (err.toString().indexOf(401) >= 0) {
          LogOutClearCookie();
          message.error("Phiên đăng nhập đã hết hạn");
        } else {
          message.error("Mất kết nối với máy chủ");
        }
        return null;
      }
    },
  },
  imageResize: {
    displayStyles: {
      backgroundColor: "black",
      border: "none",
      color: "white",
    },
    modules: ["Resize", "DisplaySize", "Toolbar"],
  },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "color",
  "background",
  "font",
  "align",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "clean",
  "code",
  "formula",
];

function removeImage(imagepath) {
  const token = GetCookieData(ACCESS_TOKEN);
  if (token !== null) {
    const config = {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: "Bearer " + token,
    };
    const removeImageModel = {
      imagePath: imagepath,
    };
    axios
      .post(
        API_URL + "api/Newspaper/RemoveImage",
        JSON.stringify(removeImageModel),
        { headers: config }
      )
      .then((response) => {
        if (response.data.isSuccess) {
        } else {
          if (response.data.errors[0].indexOf("(401)") >= 0) {
            LogOutClearCookie();
          }
          message.error(response.data.errors[0]);
        }
      })
      .catch((response) => {
        if (response.toString().indexOf(401) >= 0) {
          LogOutClearCookie();
          message.error("Phiên đăng nhập đã hết hạn");
        } else {
          message.error("Mất kết nối máy chủ");
        }
      });
  }
}

export default function CreateActivity() {
  const [form] = Form.useForm();
  const [value, setValue] = useState("");
  const [contentNull, setContentNull] = useState(false);
  const [isShowPreview, setIsShowPreview] = useState(false);
  const [isCreading, setIsCreading] = useState(false);
  const [isDateNull, setDateIsNull] = useState(true);
  const [titleIsNull, setTitleIsNull] = useState(true);
  const [idActivity, setIdActivity] = useState(null);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [poster, setPoster] = useState(null);
  const [provinceList, setProvinceList] = useState(null);
  const [provinceId, setProvinceId] = useState(null);
  const [districtList, setDistrictList] = useState(null);
  const [districtId, setDistrictId] = useState(null);
  const [wardList, setWardList] = useState(null);
  const [wardId, setWardId] = useState(null);
  const [m_strContent, setContent] = useState(null);
  const [m_bUpLoading, setUpLoading] = useState(false);

  const { Option } = Select;
  

  function confirm() {
    Modal.confirm({
      title: "Xoá hoạt động!",
      icon: <ExclamationCircleOutlined />,
      content:
        "Việc xoá của bạn sẽ không khôi phục lại được. Bạn có chắc chắn muốn xoá?",
      okText: "Xoá",
      cancelText: "Huỷ Bỏ",
      onOk: () => {
        deleteClick();
      },
    });
  }

  const OnChangeContent = (value) => {
    setContent(value);
   setValue(value)
  };

  async function saveActivity() {
    setIsCreading(true);
    var title = form.getFieldValue("title");
    var timeline = form.getFieldValue("timeline");
    var deadline = form.getFieldValue("deadline");
    var provinceId = form.getFieldValue("province");
    var district = form.getFieldValue("district");
    var ward = form.getFieldValue("ward");
    var street = form.getFieldValue("street");
    var type = form.getFieldValue("type");
    var sponsor = form.getFieldValue("sponsor");
    var valid = true;
    if (title === undefined || title === null) {
      valid = false;
      form.setFields([
        {
          name: "title",
          errors: ["Vui lòng nhập tiêu đề!"],
        },
      ]);
    } else {
      if (title.replace(/ /g, "") === "") {
        valid = false;
        form.setFields([
          {
            name: "title",
            errors: ["Vui lòng nhập tiêu đề!"],
          },
        ]);
      }
    }

    if (value === null || value === "<p><br></p>" || value === "") {
      valid = false;
      setContentNull(true);
    }

    if (timeline === null || timeline === undefined) {
      valid = false;
      form.setFields([
        {
          name: "timeline",
          errors: ["Vui lòng nhập thời gian diễn ra!"],
        },
      ]);
    }

    if (deadline === null || deadline === undefined) {
      valid = false;
      form.setFields([
        {
          name: "deadline",
          errors: ["Vui lòng nhập hạn cuối nhận hồ sơ!"],
        },
      ]);
    }

    if (deadline < new Date()) {
      valid = false;
      form.setFields([
        {
          name: "deadline",
          errors: [
            "Hạn cuối nhận hồ sơ không được nhỏ hơn thời gian hiện tại!",
          ],
        },
      ]);
    }

    if (poster === null || poster === undefined) {
      valid = false;
      form.setFields([
        {
          name: "poster",
          errors: ["Vui lòng tải lên poster!"],
        },
      ]);
    }

    if (provinceId === null || provinceId === undefined) {
      valid = false;
      form.setFields([
        {
          name: "province",
          errors: ["Vui lòng chọn Tỉnh/Thành phố!"],
        },
      ]);
    }

    if (district === null || district === undefined) {
      valid = false;
      form.setFields([
        {
          name: "district",
          errors: ["Vui lòng chọn Quận/Huyện!"],
        },
      ]);
    }

    if (ward === null || ward === undefined) {
      valid = false;
      form.setFields([
        {
          name: "ward",
          errors: ["Vui lòng chọn Xã/Phường!"],
        },
      ]);
    }

    if (street === null || street === undefined) {
      valid = false;
      form.setFields([
        {
          name: "street",
          errors: ["Vui lòng nhập địa chỉ cụ thể!"],
        },
      ]);
    }

    if (type === null || type === undefined) {
      type = true;
    }

    if (sponsor === null || sponsor === undefined) {
      type = false;
    }

    if (valid) {
      const token = GetCookieData(ACCESS_TOKEN);
      if (token !== null) {
        var frdata = new FormData();
        frdata.append("title", title);
        frdata.append("content", value);
        frdata.append("poster", poster);
        frdata.append("specificAddress", street);
        frdata.append("provinceId", provinceId);
        frdata.append("districtId", district);  
        frdata.append("wardId", ward);
        frdata.append(
          "startDate",
          moment(timeline[0].toISOString()).format("DD/MM/YYYY HH:mm")
        );
        frdata.append(
          "endDate",
          moment(timeline[1].toISOString()).format("DD/MM/YYYY HH:mm")
        );
        frdata.append(
          "registrationDeadline",
          moment(deadline.toISOString()).format("DD/MM/YYYY HH:mm")
        );
        frdata.append("isPublic", !type);
        frdata.append("SponsorshipAllowed", sponsor);
        frdata.append("StopRecvSponsorship", false);

        const config = {
          headers: {
            "content-type": "multipart/form-data",
            Authorization: "Bearer " + token,
            accept: "*/*",
          },
        };
        frdata.forEach(function(value, key){
          console.log(key + ": " + value);
      });
        var path = "api/Activities/CreateActivitie";
        if (idActivity) {
          path = "api/Activities/UpdateActivitie";
          frdata.append("id", idActivity);
        }
        await axios
          .post(API_URL + path, frdata, config)
          .then((response) => {
            if (response.data.isSuccess) {
              if (idActivity) {
                message.success("Cập nhật hoạt động thành công");
              } else {
                message.success("Tạo hoạt động thành công");
                setIdActivity(response.data.dataValue.id);
              }
            } else {
              if (response.data.errors[0].indexOf("(401)") >= 0) {
                LogOutClearCookie();
              }
              message.error(response.data.errors);
            }
            setIsCreading(false);
          })
          .catch((response) => {
            message.error("Mất kết nối với máy chủ");
            setIsCreading(false);
          });
      }
    }
    setIsCreading(false);
  }

  function deleteClick() {
    setIsCreading(true);
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      // console.log(idActivity);
      if (idActivity) {
        const config = {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: "Bearer " + token,
        };
        var requestData = {
          activitiesAndEventId: idActivity,
        };
        axios
          .get(API_URL + "api/Activities/DeleteActivitie", {
            headers: config,
            params: requestData,
          })
          .then((response) => {
            if (response.data.isSuccess) {
              message.success("Xoá thành công");
              window.location.reload();
            } else {
              if (response.data.errors[0].indexOf("(401)") >= 0) {
                LogOutClearCookie();
              }
              message.error(response.data.errors[0]);
            }
          })
          .catch((response) => {
            if (response.toString().indexOf(401) >= 0) {
              LogOutClearCookie();
              message.error("Phiên đăng nhập đã hết hạn");
            } else {
              message.error("Mất kết nối máy chủ");
            }
          });
      } else {
        message.error("Bạn chỉ được xoá hoạt động vừa tạo");
      }
    }
  }

  function onChangeDate(e) {
    setDateIsNull(e === null);
  }

  function onChangeTitle(e) {
    setTitleIsNull(e === null);
  }

  const handleOnChange = ({ fileList: newFileList }) => {
    if (
      newFileList.length !== 0 &&
      newFileList[0].name.match(/\.(jpg|jpeg|png)$/)
    ) {
      setDefaultFileList(newFileList);
    }
    if (newFileList.length == 0) {
      setPoster(null);
      setDefaultFileList([]);
    }
  };

  const onPreview = async (file) => {
    if (file) {
      let src = file.url;
      if (!src) {
        src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj);
          reader.onload = () => resolve(reader.result);
        });
      }
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow.document.write(image.outerHTML);
    } else {
      setPoster(null);
    }
  };
  const dummyRequest = ({ file, onSuccess }) => {
    if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
      onSuccess("error");
    } else {
      setTimeout(() => {
        onSuccess("ok");
        setPoster(file);
        form.setFields([
          {
            name: "poster",
            errors: [],
          },
        ]);
      }, 0);
    }
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

  const handleChangeProvince = (e) => {
    form.setFieldsValue({ district: undefined });
    form.setFieldsValue({ ward: undefined });
    setProvinceId(e);
    getDistrict(e);
  };

  const handleChangeDistrict = (e) => {
    form.setFieldsValue({ ward: undefined });
    setDistrictId(e);
    getWards(e);
  };

  const handleChangeWard = (e) => {
    setWardId(e);
  };

  function disabledDate(current) {
    // Can not select days before today and today
    //return current && current < moment().endOf("day");
     // Lấy ngày và giờ hiện tại
     var now = moment();

     // Nếu current không được xác định hoặc nó nhỏ hơn ngày và giờ hiện tại
     // thì vô hiệu hóa nó
     return current && (
      current.isBefore(now, 'day') ||  // Kiểm tra ngày trước ngày hiện tại
      (current.isSame(now, 'day') && 
          (current.hour() < now.hour() ||  // Kiểm tra giờ trước giờ hiện tại
          (current.hour() === now.hour() && current.minute() <= now.minute()))  // Cùng giờ và kiểm tra phút
      )
  );
  }

  useEffect(() => {
    getProvince();
  }, []);
  return (
    <div className="container card-body" style={{ background: "#fff" }}>
      <Helmet>
        <title>Tạo hoạt động</title>
      </Helmet>
      <Layout style={{ minHeight: "85vh" }}>
        <Content>
          <Layout style={{ background: "#fff" }}>
            <div style={{ minHeight: "70vh" }}>
              <Form form={form}>
                <Row span={24}>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <Form.Item
                      name="title"
                      label="Tiêu đề:"
                      disabled={isCreading}
                      rules={[
                        { required: true, message: "Vui lòng nhập tiêu đề!" },
                      ]}
                    >
                      <Input
                        maxLength={250}
                        placeholder="Tiêu đề"
                        onChange={(e) => {
                          onChangeTitle(e);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                  >
                    <Form.Item
                      name="timeline"
                      label="Thời gian:"
                      disabled={isCreading}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập thời gian tuyển!",
                        },
                      ]}
                    >
                      <RangePicker
                        showTime
                        format={dateFormat}
                        disabledDate={disabledDate}
                        onChange={(e) => {
                          onChangeDate(e);
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <Form.Item
                      name="deadline"
                      label="Hạn cuối nhận hồ sơ:"
                      disabled={isCreading}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập hạn cuối nhận hồ sơ!",
                        },
                      ]}
                    >
                      <DatePicker
                        showTime
                        format={dateFormat}
                        disabledDate={disabledDate}
                        onChange={(e) => {
                          onChangeDate(e);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                  >
                    <Form.Item
                      name="poster"
                      label="Poster:"
                      disabled={isCreading}
                      rules={[
                        { required: true, message: "Vui lòng tải lên ảnh!" },
                      ]}
                    >
                      <ImgCrop
                        aspect={16 / 9}
                        cropperProps={"posterCrop"}
                        modalTitle="Cắt ảnh"
                        modalOk={"Lưu"}
                        modalCancel={"Huỷ"}
                      >
                        <Upload
                          accept="image/*"
                          onChange={handleOnChange}
                          onPreview={onPreview}
                          customRequest={dummyRequest}
                          listType="picture"
                          maxCount={1}
                        >
                          {defaultFileList.length < 1 && "+ Tải lên"}
                        </Upload>
                      </ImgCrop>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <Form.Item
                      name="province"
                      label="Tỉnh/Thành phố:"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn Tỉnh/Thành phố!",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        disabled={isCreading}
                        className="container text-left"
                        placeholder="Chọn Tỉnh/Thành phố"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          RemoveVietnameseAccents(option.children)
                            .toLowerCase()
                            .indexOf(
                              RemoveVietnameseAccents(input).toLowerCase()
                            ) >= 0
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
                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                  >
                    <Form.Item
                      name="district"
                      label="Quận/Huyện:"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn Quận/Huyện!",
                        },
                      ]}
                    >
                      <Select
                        disabled={isCreading}
                        showSearch
                        className="container text-left"
                        placeholder="Chọn quận/huyện"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          RemoveVietnameseAccents(option.children)
                            .toLowerCase()
                            .indexOf(
                              RemoveVietnameseAccents(input).toLowerCase()
                            ) >= 0
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
                <Row>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <Form.Item
                      name="ward"
                      label="Xã/Phường:"
                      rules={[
                        { required: true, message: "Vui lòng chọn Xã/Phường!" },
                      ]}
                    >
                      <Select
                        showSearch
                        disabled={isCreading}
                        className="container text-left"
                        placeholder="Chọn Xã/Phường"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          RemoveVietnameseAccents(option.children)
                            .toLowerCase()
                            .indexOf(
                              RemoveVietnameseAccents(input).toLowerCase()
                            ) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value
                            .toLowerCase()
                            .localeCompare(optionB.value.toLowerCase())
                        }
                        defaultValue={wardId}
                        onChange={handleChangeWard}
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
                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                  >
                    <Form.Item
                      name="street"
                      rules={[
                        { required: true, message: "Vui lòng nhập Đường!" },
                      ]}
                      label="Số nhà:"
                    >
                      <Input
                        disabled={isCreading}
                        rows={2}
                        placeholder="Nhập số nhà"
                        maxLength={40}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="start">
                  <Col span={12} className={"col-md-5"} xs={12} xl={12}>
                    <Form.Item
                      name="type"
                      label="Loại:"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn loại hoạt động!",
                        },
                      ]}
                      disabled={isCreading}
                    >
                      <Switch
                        defaultChecked
                        title="Hoạt động nội bộ"
                        style={{ float: "left" }}
                        checkedChildren={"Hoạt động nội bộ"}
                        unCheckedChildren={"Hoạt động công khai"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} className={"col-md-5"} xs={12} xl={12}>
                    <Form.Item
                      name="sponsor"
                      label="Quyên góp:"
                      rules={[
                        {
                          required: true,
                          message: "Hoạt động này có nhận tài trợ không!",
                        },
                      ]}
                      disabled={isCreading}
                    >
                      <Switch
                        defaultChecked
                        title="Nhận tài trợ"
                        style={{ float: "left" }}
                        checkedChildren={"Nhận tài trợ"}
                        unCheckedChildren={"Không nhận tài trợ"}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
              <Row>
                {/* <Col span={24} xs={24} className={"col-md-5"} xl={24}>
                  <div className="ant-row ant-form ant-form-horizontal">
                    <div className="ant-col ant-form-item-label">
                      <label className="ant-form-item-required">Nội dung</label>
                    </div>
                  </div>
                  <ReactQuill
                    placeholder="Nội dung..."
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    disabled={isCreading}
                    value={value}
                    onChange={handleChange}
                  />
                  {contentNull ? (
                    <div class="ant-form-item-explain ant-form-item-explain-error">
                      <div role="alert">Vui lòng nhập nội dung!</div>
                    </div>
                  ) : null}
                </Col> */}
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
                    {contentNull ? (
                      <div class="ant-form-item-explain ant-form-item-explain-error">
                        <div role="alert">Vui lòng nhập nội dung!</div>
                      </div>
                    ) : null}
                  </Row>
                </Col>
              </Row>
              <Button
                style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                disabled={value === "<p><br></p>" || value === ""}
                onClick={() => {
                  setIsShowPreview(!isShowPreview);
                }}
                icon={
                  <FontAwesomeIcon style={{ marginRight: 10 }} icon={faEye} />
                }
                loading={isCreading}
                type="primary"
              >
                Xem Trước
              </Button>
              <Button
                style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                icon={
                  <FontAwesomeIcon style={{ marginRight: 10 }} icon={faSave} />
                }
                onClick={() => {
                  saveActivity();
                }}
                loading={isCreading}
                disabled={
                  value === "<p><br></p>" ||
                  value === "" ||
                  isDateNull ||
                  titleIsNull
                }
                type="primary"
              >
                {idActivity === null ? "Tạo Mới" : "Cập Nhật"}
              </Button>
              <Button
                style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                icon={
                  <FontAwesomeIcon style={{ marginRight: 10 }} icon={faTrash} />
                }
                danger
                disabled={idActivity === null}
                loading={isCreading}
                onClick={() => {
                  confirm();
                }}
                type="primary"
              >
                Xoá
              </Button>
              {isShowPreview ? (
                <div>
                  <hr />
                  <Preview value={value} />
                </div>
              ) : null}
            </div>
          </Layout>
        </Content>
      </Layout>
    </div>
  );
}

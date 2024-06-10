import React, { useEffect, useState } from "react";
import {
  message,
  Row,
  Col,
  Input,
  Form,
  Button,
  Modal,
  Upload,
  Skeleton,
} from "antd";
import "react-quill/dist/quill.snow.css";
import "../assets/styles/quill-video-resize.css";
import "../assets/styles/createrecuit.css";
import axios from "axios";
import { useLocation } from "react-router-dom";

import {
  ACCESS_TOKEN,
  GetCookieData,
  LogOutClearCookie,
} from "../Helper/CookieHelper";

// import { Helmet } from 'react-helmet';
import { ImageResize } from "./ImageResize";
import Preview from "./Preview";
import ReactQuill, { Quill } from "react-quill";
import ImageUploader from "quill-image-uploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Video } from "./quill-video-resize";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import { API_URL } from "../Helper/TextHelper";

Quill.register("modules/imageUploader", ImageUploader);
Quill.register("modules/imageResize", ImageResize);
Quill.register({ "formats/video": Video });
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

export default function NewspaperTopic() {
  const [form] = Form.useForm();
  const [value, setValue] = useState("");
  const [contentNull, setContentNull] = useState(false);
  const [isShowPreview, setIsShowPreview] = useState(false);
  const [titleIsNull, setTitleIsNull] = useState(true);
  const [idNewspaper, setIdNewspaper] = useState(null);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newsId, setNewsId] = useState(null);
  let { topicId } = useParams();
  const location = useLocation();
  const handleChange = (data) => {
    setValue(data);
    var images = [];
    upLoadImages.forEach((image) => {
      images.push(image);
    });
    upLoadImages = images;
    addImage = false;
    setContentNull(data === "<p><br></p>");
  };

  function confirm() {
    Modal.confirm({
      title: "Xoá bài viết!",
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

  async function saveNewspaper() {
    setLoading(true);
    var title = form.getFieldValue("title");
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const config = {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: "Bearer " + token,
          accept: "*/*",
        },
      };
      var fmData = new FormData();
      fmData.append("id", newsId);
      fmData.append("poster", poster);
      fmData.append("title", title);
      fmData.append("content", value);
      await axios
        .put(API_URL + "api/Newspaper/UpdateNewspaper", fmData, config)
        .then((response) => {
          console.log("response", response);
          if (response.data.isSuccess) {
            message.success("Cập nhật thành công");
          } else {
            message.error(response.data.errors[0]);
            if (response.data.errors[0].indexOf("(401)") >= 0) {
              LogOutClearCookie();
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.log("response", error);
          message.error(error.response.data.errors[0]);

          setLoading(false);
        });
    }
  }

  function deleteClick() {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      if (newsId) {
        const config = {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: "Bearer " + token,
        };
        var requestData = {
          x_strNewspaperId: newsId,
        };
        // console.log(requestData);
        axios
          .delete(API_URL + "api/Newspaper/DeleteNewspaper", {
            headers: config,
            params: requestData,
          })
          .then((response) => {
            if (response.data.isSuccess) {
              message.success("Xoá thành công");
              form.setFieldsValue({
                title: "",
              });
              setValue("");
              upLoadImages = [];
              setIdNewspaper(null);
              setDefaultFileList([]);
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
              console.log(response.response);
              message.error("Mất kết nối máy chủ");
            }
          });
      } else {
        message.error("Bạn chỉ được xoá bản tin tức vừa tạo");
      }
    }
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
      }, 0);
    }
  };

  const getNewspaper = async (newID) => {
    setLoading(true);
    const config = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    var requestData = {
      x_strNewspaperId: newID,
    };
    await axios
      .get(API_URL + "api/Newspaper/GetNewspaperById", {
        params: requestData,
        headers: config,
      })
      .then((response) => {
        if (response.data.isSuccess) {
          console.log(response.data.dataValue);
          setValue(response.data.dataValue.content);
          setDefaultFileList([
            {
              uid: "-1",
              name: response.data.dataValue.posterPath.split("/")[
                response.data.dataValue.posterPath.split("/").length - 1
              ],
              status: "done",
              url: API_URL + response.data.dataValue.posterPath,
              thumbUrl: API_URL + response.data.dataValue.posterPath,
            },
          ]);
          form.setFieldsValue({
            title: response.data.dataValue.title,
          });
          setLoading(false);
        } else {
          setLoading(false);
          message.error(response.data.errors);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");
        setLoading(false);
      });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const strActId = searchParams.get("newspapers");
    setNewsId(strActId);
    getNewspaper(strActId);
  }, []);

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : (
        <div>
          {defaultFileList ? (
            <div style={{ minHeight: "61vh" }}>
              <Form form={form}>
                <Row span={24}>
                  <Col span={24} className={"col-md-5"} xs={24} xl={24}>
                    <Form.Item name="title" label="Tiêu đề:">
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
                    span={24}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={24}
                  >
                    <Form.Item label="Poster">
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
                          defaultFileList={[...defaultFileList]}
                          maxCount={1}
                        >
                          {defaultFileList.length < 1 && (
                            <Button>+ Tải lên</Button>
                          )}
                        </Upload>
                      </ImgCrop>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
              <Row>
                <Col span={24} xs={24} xl={24}>
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
                    value={value}
                    onChange={handleChange}
                  />
                  {contentNull ? (
                    <div class="ant-form-item-explain ant-form-item-explain-error">
                      <div role="alert">Vui lòng nhập nội dung!</div>
                    </div>
                  ) : null}
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
                  saveNewspaper();
                }}
                loading={loading}
                type="primary"
              >
                Cập Nhật
              </Button>
              <Button
                style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                icon={
                  <FontAwesomeIcon style={{ marginRight: 10 }} icon={faTrash} />
                }
                danger
                onClick={() => {
                  confirm();
                }}
                loading={loading}
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
          ) : null}
        </div>
      )}
    </div>
  );
}

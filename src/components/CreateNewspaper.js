import React, { useState } from 'react';
import { Layout, message, DatePicker, Row, Col, Input, Form, Button, Modal, Upload } from 'antd';
import axios from 'axios';

import { Helmet } from 'react-helmet';
import { ImageResize } from "./ImageResize";
import "react-quill/dist/quill.snow.css";
import Preview from "./Preview";
import ReactQuill, { Quill } from "react-quill";
import ImageUploader from "quill-image-uploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/createrecuit.css';
import { Video } from "./quill-video-resize";
import "../assets/styles/quill-video-resize.css";
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { API_URL } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData, RemoveCookie } from "../Helper/CookieHelper";
import TextEditorCustoms from "./TextEditorCustoms";




Quill.register("modules/imageUploader", ImageUploader);
Quill.register("modules/imageResize", ImageResize);
Quill.register({ "formats/video": Video });

const TITLE = "Viết Tin Tức";
const { Content, Footer, Header } = Layout;
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
            { indent: "+1" }
        ],
        [{ direction: "rtl" }],
        ["link", "image", "video"],
        ["clean"]
    ],
    clipboard: {
        matchVisual: false
    },
    history: {
        delay: 1000,
        maxStack: 50,
        userOnly: false
    },
    imageUploader: {
        upload: async (file) => {
            const token = GetCookieData(ACCESS_TOKEN);
            var fmData = new FormData();
            const config = {
                headers: {
                    'content-type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + token,
                    'accept': '*/*'
                }
            };
            fmData.append('image', file);
            try {
                const res = await axios.post(API_URL + 'api/Newspaper/UploadImage', fmData, config);
                if (res.data.isSuccess) {
                    addImage = true;
                    var images = upLoadImages;
                    images.push(res.data.dataValue);
                    upLoadImages = images;
                    return API_URL + res.data.dataValue;
                } else {
                    if (res.data.errors[0].indexOf("(401)") >= 0) {
                        RemoveCookie()
                    }
                    message.error(res.data.errors[0]);
                    return null;
                }
            } catch (err) {
                if (err.toString().indexOf(401) >= 0) {
                    RemoveCookie()
                    message.error("Phiên đăng nhập đã hết hạn");
                } else {
                    message.error("Mất kết nối với máy chủ");
                }
                return null;
            }
        }
    },
    imageResize: {
        displayStyles: {
            backgroundColor: "black",
            border: "none",
            color: "white"
        },
        modules: ["Resize", "DisplaySize", "Toolbar"]
    }
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
    "formula"
];

function removeImage(imagepath) {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
        const config = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + token
        }
        const removeImageModel = {
            "imagePath": imagepath
        }
        axios.post(API_URL + 'api/Newspaper/RemoveImage', JSON.stringify(removeImageModel), { headers: config })
            .then((response) => {
                if (response.data.isSuccess) {
                } else {
                    if (response.data.errors[0].indexOf("(401)") >= 0) {
                        RemoveCookie()
                    }
                    message.error(response.data.errors[0]);
                }
            })
            .catch((response) => {
                if (response.toString().indexOf(401) >= 0) {
                    RemoveCookie();
                    message.error("Phiên đăng nhập đã hết hạn");
                } else {
                    message.error("Mất kết nối máy chủ");
                }
            })
    }
}

export default function CreateNewspaper() {
    const [form] = Form.useForm();
    const [value, setValue] = useState("");
    const [contentNull, setContentNull] = useState(false);
    const [isShowPreview, setIsShowPreview] = useState(false);
    const [isCreading, setIsCreading] = useState(false);
    const [titleIsNull, setTitleIsNull] = useState(true);
    const [idNewspaper, setIdNewspaper] = useState(null);
    const [defaultFileList, setDefaultFileList] = useState([]);
    const [poster, setPoster] = useState(null);
    const [m_strContent, setContent] = useState(null);
    const [m_bUpLoading, setUpLoading] = useState(false);


    const handleChange = (data) => {
        setValue(data);
        var images = []
        upLoadImages.forEach((image) => {
            if (data.indexOf(API_URL + image) < 0 && !addImage) {
                removeImage(image);
            } else {
                images.push(image);
            }
        })
        upLoadImages = images;
        addImage = false;
        setContentNull(data === "<p><br></p>");
    };

    function confirm() {
        Modal.confirm({
            title: 'Xoá bài viết!',
            icon: <ExclamationCircleOutlined />,
            content: 'Việc xoá của bạn sẽ không khôi phục lại được. Bạn có chắc chắn muốn xoá?',
            okText: 'Xoá',
            cancelText: 'Huỷ Bỏ',
            onOk: () => { deleteClick() }
        });
    }

    const OnChangeContent = (value) => {
        setContent(value);
        setValue(value);

      };

    const handleOnChange = ({ fileList: newFileList }) => {
        if (newFileList.length !== 0 && newFileList[0].name.match(/\.(jpg|jpeg|png)$/)) {
            setDefaultFileList(newFileList);
        }
        if (newFileList.length == 0) {
            setPoster(null);
            setDefaultFileList([]);
        }
    };

    const onPreview = async file => {
        if (file) {
            let src = file.url;
            if (!src) {
                src = await new Promise(resolve => {
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

    function saveNewspaper() {
        setIsCreading(true);
        setUpLoading(true)
        var title = form.getFieldValue("title");
        var valid = true;
        if (poster === null) {
            valid = false;
            form.setFields([{
                name: "poster",
                errors: ["Vui lòng nhập tải ảnh lên!"]
            }]);
            setUpLoading(false);
             return;
        }

        if (title === undefined || title === null) {
            valid = false;
            form.setFields([{
                name: "title",
                errors: ["Vui lòng nhập tiêu đề!"]
            }]);
            setUpLoading(false);
            return;
        } else {
            if (title.replace(/ /g, '') === '') {
                valid = false;
                form.setFields([{
                    name: "title",
                    errors: ["Vui lòng nhập tiêu đề!"]
                }]);
            }
            setUpLoading(false);
        }

        if (value === null || value === "<p><br></p>" || value === "") {
            valid = false;
            setContentNull(true);
        }
        if (poster === null || titleIsNull) {
            setIsCreading(false);
        } else {
            const token = GetCookieData(ACCESS_TOKEN)
            var fmData = new FormData();
            if (token !== null && valid) {
                const config = {
                    headers: {
                        'content-type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + token,
                        'accept': '*/*'
                    },
                }

                fmData.append('poster', poster);
                fmData.append('title', title);
                fmData.append('content', value);

                var path = 'api/Newspaper/CreateNewspaper'
                if (idNewspaper !== null) {
                    fmData.append('id', idNewspaper);
                    path = 'api/Newspaper/UpdateNewspaper';
                }
                axios.post(API_URL + path, fmData, config)
                    .then((response) => {
                        if (response.data.isSuccess) {
                            if (idNewspaper === null) {
                                message.success("Tạo bài viết thành công");
                                // console.log(response.data.dataValue);
                                setIdNewspaper(response.data.dataValue.id);
                                setIsCreading(false);
                            } else {
                                message.success("Cập nhật thành công");
                                setIsCreading(false);
                            }
                        } else {
                            if (response.data.errors[0].indexOf("(401)") >= 0) {
                                RemoveCookie();
                            }
                            message.error(response.data.errors);
                            setIsCreading(false);
                        }
                    })
                    .catch((response) => {
                        if (response.toString().indexOf(401) >= 0) {
                            RemoveCookie();
                            message.error("Phiên đăng nhập đã hết hạn");
                        } else {
                            message.error("Mất kết nối máy chủ");
                        }
                        setIsCreading(false);
                    })
                    setUpLoading(false)
            }
        }
    }

    function deleteClick() {
        const token = GetCookieData(ACCESS_TOKEN);
        if (token !== null) {
            if (idNewspaper) {
                const config = {
                    "Content-Type": "application/json",
                    "accept": "*/*",
                    "Authorization": 'Bearer ' + token
                }
                var requestData = {
                    x_strNewspaperId: idNewspaper
                };
                // console.log(requestData);
                axios.get(API_URL + 'api/Newspaper/DeleteNewspaper', { headers: config, params: requestData })
                    .then((response) => {
                        if (response.data.isSuccess) {
                            message.success("Xoá thành công");
                            form.setFieldsValue({
                                title: "",
                            });
                            setValue("");
                            if (upLoadImages) {
                                upLoadImages.forEach((item) => {
                                    removeImage(item);
                                })
                            }
                            upLoadImages = [];
                            setIdNewspaper(null);
                            setDefaultFileList([]);
                            window.location.reload();
                        } else {
                            if (response.data.errors[0].indexOf("(401)") >= 0) {
                                RemoveCookie();
                            }
                            message.error(response.data.errors[0]);
                        }
                    })
                    .catch((response) => {
                        if (response.toString().indexOf(401) >= 0) {
                            RemoveCookie();
                            message.error("Phiên đăng nhập đã hết hạn");
                        } else {
                            message.error("Mất kết nối máy chủ");
                        }
                    })
            } else {
                message.error("Bạn chỉ được xoá bản Tuyển thành viên vừa tạo");
            }
        }
    }

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

    function onChangeTitle(e) {
        setTitleIsNull(e === null);
    }

    function disabledDate(current) {
        // Can not select days before today and today
        return current && current < moment().endOf('day');
    }
    return (
        <div className="container card-body" style={{ background: "#fff" }}>
            <Helmet>
                <title>{TITLE}</title>
            </Helmet>
            <Layout style={{ minHeight: "85vh" }}>
                <Header style={{ background: "#fff" }}>
                    <p className={"activetitle"}>Viết Tin Tức</p>
                </Header>
                <Content>
                    <Layout style={{ background: "#fff" }}>
                        <div style={{ minHeight: "70vh" }}>
                            <Form form={form}>
                                <Row span={24}>
                                    <Col span={24} className={"col-md-5"} xs={24} xl={24}>
                                        <Form.Item
                                            name="title"
                                            label="Tiêu đề:"
                                            disabled={isCreading}
                                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                                        >
                                            <Input maxLength={250} placeholder="Tiêu đề" onChange={(e) => { onChangeTitle(e) }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24} className={"col-md-5 col-md-offset-2"} xs={24} xl={24}>
                                        <Form.Item
                                            name="poster"
                                            label="Poster:"
                                            disabled={isCreading}
                                            rules={[{ required: true, message: 'Vui lòng tải lên ảnh!' }]}
                                        >
                                            <ImgCrop aspect={16 / 9} cropperProps={"posterCrop"}
                                                modalTitle="Cắt ảnh"
                                                modalOk={"Lưu"}
                                                modalCancel={"Huỷ"}>
                                                <Upload
                                                    accept="image/*"
                                                    onChange={handleOnChange}
                                                    onPreview={onPreview}
                                                    customRequest={dummyRequest}
                                                    listType="picture"
                                                    maxCount={1}
                                                >
                                                    {
                                                        defaultFileList.length < 1 && '+ Tải lên'
                                                    }
                                                </Upload>
                                            </ImgCrop>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                            <Row>
                                {/* <Col span={24} className={"col-md-5"} xs={24} xl={24}>
                                    <div className="ant-row ant-form ant-form-horizontal">
                                        <div className="ant-col ant-form-item-label">
                                            <label className="ant-form-item-required" >Nội dung</label>
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
                                    {
                                        contentNull ?
                                            <div class="ant-form-item-explain ant-form-item-explain-error">
                                                <div role="alert">Vui lòng nhập nội dung!</div>
                                            </div>
                                            : null
                                    }
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
                                        {
                                        contentNull ?
                                            <div class="ant-form-item-explain ant-form-item-explain-error">
                                                <div role="alert">Vui lòng nhập nội dung!</div>
                                            </div>
                                            : null
                                    }
                                    </Row>
                                </Col>
                            </Row>
                            <Button
                                style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                                disabled={value === "<p><br></p>" || value === ""}
                                onClick={() => { setIsShowPreview(!isShowPreview) }}
                                icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faEye} />}
                                type="primary">Xem Trước
                            </Button>
                            <Button
                                style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                                icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faSave} />}
                                onClick={() => { saveNewspaper() }}
                                loading={isCreading}
                                disabled={value === "<p><br></p>"
                                    || value === "" || poster === null || titleIsNull}
                                type="primary">{idNewspaper === null ? "Tạo Mới" : "Cập Nhật"}
                            </Button>
                            <Button
                                style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                                icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faTrash} />}
                                danger
                                disabled={idNewspaper === null}
                                onClick={() => { confirm() }}
                                type="primary">Xoá
                            </Button>
                            {
                                isShowPreview ?
                                    <div>
                                        <hr />
                                        <Preview value={value} />
                                    </div>
                                    : null
                            }
                        </div>
                    </Layout>
                </Content>
            </Layout>
        </div>
    )
};
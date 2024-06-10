import React, { useEffect, useRef, useState } from "react";
import { Form, Upload, Button, Image, message, Row, Col, Input, ColorPicker, Space, Select, Modal, Table, Typography } from "antd";
import ImgCrop from "antd-img-crop";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { API_URL, GetFullPath } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData, LogOutClearCookie } from "../Helper/CookieHelper";
import { connect } from "react-redux";
import { login, logout } from "../Redux/actions/actions";
import { Option } from "antd/es/mentions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

const SendCertificate = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isMyInfo, memberId, isBroken }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const location = useLocation();
    const [idActivity, setIdActivity] = useState(null);
    const [poster, setPoster] = useState(null);
    const [setting, setSetting] = useState(false);
    const [listSetting, setListSetting] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [listFont, setListFont] = useState(null);
    const [defaultText, setDefaultText] = useState(null);
    const [colorHex, setColorHex] = useState('#1677ff');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isViewModal, setViewModal] = useState(false)
    const [formatHex, setFormatHex] = useState('hex');
    const hexString = React.useMemo(
        () => (typeof colorHex === 'string' ? colorHex : colorHex?.toHexString()),
        [colorHex],
    );



    // Function to handle custom upload logic
    const dummyRequest = ({ file, onSuccess }) => {
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            onSuccess("error");
        } else {
            setTimeout(() => {
                onSuccess("ok");
                setPoster(file);
                form.setFields([
                    {
                        name: "imageCertificate",
                        errors: [],
                    },
                ]);
            }, 0);
        }
    };

    const onRegisting = async () => {
        setSetting(true);
        let isValid = true;
        let fontSize = form.getFieldValue("fontSize");
        let locationX = form.getFieldValue("locationX");
        let locationY = form.getFieldValue("locationY");
        let maxWidth = form.getFieldValue("maxWidth");
        let maxHeight = form.getFieldValue("maxHeight");
        let vertical = form.getFieldValue("vertical");
        let horizontal = form.getFieldValue("horizontal");
        let fontStyle = form.getFieldValue("fontStyle");
        let fontId = form.getFieldValue("fontId");
        let valueType = form.getFieldValue("valueType");
        let defaultText = form.getFieldValue("defaultText");

        if (fontSize === undefined) {
            form.setFields([
                {
                    name: "fontSize",
                    errors: ["Vui lòng nhập kích cỡ"],
                },
            ]);
        }
        if (locationX === undefined) {
            form.setFields([
                {
                    name: "locationX",
                    errors: ["Vui lòng nhập căng chiều ngang"],
                },
            ]);
        }

        if (locationY === undefined) {
            form.setFields([
                {
                    name: "locationY",
                    errors: ["Vui lòng nhập căng chiều dọc"],
                },
            ]);
        }

        if (maxWidth === undefined) {
            form.setFields([
                {
                    name: "maxWidth",
                    errors: ["Vui lòng nhập chiều rộng tối đa"],
                },
            ]);
        }
        if (maxHeight === undefined) {
            form.setFields([
                {
                    name: "maxHeight",
                    errors: ["Vui lòng nhập chiều cao tối đa"],
                },
            ]);
        }
        if (vertical === undefined) {
            form.setFields([
                {
                    name: "vertical",
                    errors: ["Vui lòng nhập căng theo chiều dọc"],
                },
            ]);
        }
        if (horizontal === undefined) {
            form.setFields([
                {
                    name: "horizontal",
                    errors: ["Vui lòng nhập căng chiều ngang"],
                },
            ]);
        }
        if (fontStyle === undefined) {
            form.setFields([
                {
                    name: "fontStyle",
                    errors: ["Vui lòng nhập kiểu chữ"],
                },
            ]);
        }

        if (fontId === undefined) {
            form.setFields([
                {
                    name: "fontId",
                    errors: ["Vui lòng chọn font"],
                },
            ]);
        }

        if (valueType === undefined) {
            form.setFields([
                {
                    name: "valueType",
                    errors: ["Vui lòng chọn kiểu chữ"],
                },
            ]);
        }

        if (fontId === undefined) {
            form.setFields([
                {
                    name: "fonId",
                    errors: ["Vui lòng chọn font chữ"],
                },
            ]);
        }

        if (defaultText === undefined) {
            form.setFields([
                {
                    name: "defailtText",
                    errors: ["Vui lòng chọn giá trị điền"],
                },
            ]);
        }

        let errorList = form.getFieldsError();

        errorList.forEach((error) => {
            if (error.errors.length > 0) {
                isValid = false;
            }
        });


        if (isValid) {
            const memberRegisterRequestModel = {
                certificateTextId: selectedItem ? selectedItem : "",
                activityId: idActivity,
                fontSize: fontSize,
                locationX: locationX,
                locationY: locationY,
                maxWidth: maxWidth,
                maxHeight: maxHeight,
                fontId: fontId,
                vertical: vertical,
                horizontal: horizontal,
                color: hexString,
                defaultText: defaultText ? defaultText : "",
                fontStyle: fontStyle,
                valueType: valueType
            };
            console.log("te", JSON.stringify(memberRegisterRequestModel));
            //return
            const strAccessToken = GetCookieData(ACCESS_TOKEN);
            const headers = {
                "Content-Type": "application/json",
                accept: "*/*",
                Authorization: "Bearer " + strAccessToken,
            };
            await axios
                .post(
                    API_URL + "api/Activities/UpdateSetupCertificate",
                    JSON.stringify(memberRegisterRequestModel),
                    { headers }
                )
                .then((response) => {
                    if (response.data.isSuccess) {
                        const image = GetFullPath(response.data.dataValue.certificateTemp, viewtoken) + `&time=${Date.now()}`;
                        setImageUrl(image)
                        getSetting(idActivity);
                        message.success("Cập nhật thành công");
                    } else {
                        message.error(response.data.errors);
                    }
                    setSetting(false);
                })
                .catch((response) => {
                    message.error("Mất kết nối với máy chủ");
                    setSetting(false);
                });
        } else {
            setSetting(false);
        }
    };

    // Handle file list change
    const handleOnChange = ({ fileList }) => {
        setFileList(fileList);
    };

    const handleDefaultText = (value) => {
        setDefaultText(value);
    };

    const getTextFont = async () => {

        const token = GetCookieData(ACCESS_TOKEN);
        const config = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + token,
        };

        await axios
            .get(API_URL + "api/Activities/GetListTextFont", {
                headers: config,
            })
            .then((response) => {
                if (response.data.isSuccess) {
                    console.log(response.data.dataValue);
                    setListFont(response.data.dataValue)
                } else {
                    if (response.data.errors[0].indexOf("(401)") >= 0) {
                        LogOutClearCookie();
                    }
                    message.error(response.data.errors);
                }
            })
            .catch((response) => {
                message.error("Mất kết nối với máy chủ2");
            });
    };

    const getActivity = async (x_strActId) => {

        const token = GetCookieData(ACCESS_TOKEN);
        const config = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + token,
        };
        var requestData = {
            x_strActivityId: x_strActId,
        };
        await axios
            .get(API_URL + "api/Activities/GetActivitieById", {
                params: requestData,
                headers: config,
            })
            .then((response) => {
                if (response.data.isSuccess) {
                    console.log(response.data.dataValue);
                    const image = GetFullPath(response.data.dataValue.certificateFile, viewtoken);
                    setImageUrl(image);
                } else {
                    if (response.data.errors[0].indexOf("(401)") >= 0) {
                        LogOutClearCookie();
                    }
                    message.error(response.data.errors);
                }
            })
            .catch((response) => {
                message.error("Mất kết nối với máy chủ2");
            });
    };


    const setNullForm = () => {
        form.setFieldsValue({
            fontSize: "",
            locationY: "",
            locationX: "",
            maxWidth: "",
            maxHeight: "",
            fontId: "",
            vertical: "",
            horizontal: "",
            fontStyle: "",
            valueType: "",
        });
    }

    const handleSelectChange = (value) => {
        const item = listSetting.find(d => d.id === value);
        setViewModal(true)
        if (item) {
            setSelectedItem(item.id);
            setColorHex(item.color);
            form.setFieldsValue({
                fontSize: item.fontSize,
                locationY: item.locationY,
                locationX: item.locationX,
                maxWidth: item.maxWidth,
                maxHeight: item.maxHeight,
                fontId: item.fontId,
                vertical: item.vertical,
                horizontal: item.horizontal,
                fontStyle: item.fontStyle,
                valueType: item.valueType,
            });
        }
    };
    const getSetting = async (x_strActId) => {

        const token = GetCookieData(ACCESS_TOKEN);
        const config = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + token,
        };
        var requestData = {
            x_strActivityId: x_strActId,
        };
        await axios
            .get(API_URL + "api/Activities/GetListSetupCertificate", {
                params: requestData,
                headers: config,
            })
            .then((response) => {
                if (response.data.isSuccess) {
                    console.log(response.data.dataValue);
                    setListSetting(response.data.dataValue)
                } else {
                    if (response.data.errors[0].indexOf("(401)") >= 0) {
                        LogOutClearCookie();
                    }
                    message.error(response.data.errors);
                }
            })
            .catch((response) => {
                message.error("Mất kết nối với máy chủ2");
            });
    };

    const deleteSetup = async (id) => {

        const token = GetCookieData(ACCESS_TOKEN);
        const config = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + token,
        };
        var requestData = {
            x_strTextId: id,
        };
        await axios
            .delete(API_URL + "api/Activities/DeleteSetupCertificate", {
                params: requestData,
                headers: config,
            })
            .then((response) => {
                if (response.data.isSuccess) {
                    console.log(response.data.dataValue);
                    const image = GetFullPath(response.data.dataValue, viewtoken) + `&time=${Date.now()}`;
                    setImageUrl(image)
                } else {
                    if (response.data.errors[0].indexOf("(401)") >= 0) {
                        LogOutClearCookie();
                    }
                    message.error(response.data.errors);
                }
            })
            .catch((response) => {
                message.error("Mất kết nối với máy chủ2");
            });
    };

    // Get the activity ID from the URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const strAcId = searchParams.get("activityId");
        setIdActivity(strAcId);
        getActivity(strAcId);
        getTextFont();
        getSetting(strAcId);
    }, [location.search]);

    // Handle file upload
    const handleUpload = async () => {
        if (!poster) {
            message.error("Vui lòng chọn ảnh để tải lên!");
            return;
        }

        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + strAccessToken,
        };

        const formData = new FormData();
        formData.append("ActivityId", idActivity);
        formData.append("CertificateImage", poster);

        try {
            setUploading(true);
            const response = await axios.post(API_URL + "api/Activities/UploadCertificate", formData, { headers });
            const image = GetFullPath(response.data.dataValue.certificateFile, viewtoken);
            setImageUrl(image);
            message.success("Tải lên thành công!");
        } catch (error) {
            message.error("Tải lên thất bại!");
        } finally {
            setUploading(false);
        }
    };

    const sendMail = async () => {

        const token = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + token,
        };
        var requestData = {
            activityId: idActivity,
            memberIds:[],
            isSendAll:true
        };
        await axios
            .post(API_URL + "api/Activities/SendCertificate", 
                JSON.stringify(requestData),
                {headers},
            )
            .then((response) => {
                if (response.data.isSuccess) {
                   message.success("Bắt đầu gửi maill")
                } else {
                    if (response.data.errors[0].indexOf("(401)") >= 0) {
                        LogOutClearCookie();
                    }
                    message.error(response.data.errors);
                }
            })
            .catch((response) => {
                message.error("Mất kết nối với máy chủ2");
            });
    };

    // Preview image before upload
    const onPreview = async (file) => {
        let src = file.url;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const imgWindow = window.open(src);
        imgWindow.document.write(`<img src="${src}" />`);
    };
    function pagination(page, pageSize) {
        setPage(page);
        setPageSize(pageSize);
    }

    const columns = [
        {
            title: "STT",
            dataIndex: "no1",
            key: "no1",
            width: 50,
            render: (value, item, index) => (page - 1) * pageSize + index + 1,
        },
        {
            title: "FontSize",
            dataIndex: "fontSize",
            key: "fontSize",
            width: 150,
            render: (fontSize) => (
                <span>{fontSize}</span>
            ),
        },
        {
            title: "Canh chiều ngang",
            dataIndex: "locationX",
            key: "locationX",
            width: 150,
            render: (locationX) => (
                <span>{locationX}</span>
            ),
        },
        {
            title: "Canh chiều dọc",
            dataIndex: "locationY",
            key: "locationY",
            width: 150,
            render: (locationY) => (
                <span>{locationY}</span>
            ),
        },
        {
            title: "Chiều rộng tối đa",
            dataIndex: "maxWidth",
            key: "maxWidth",
            width: 150,
            render: (maxWidth) => (
                <span>{maxWidth}</span>
            ),
        },
        {
            title: "Chiều cao tối đa",
            dataIndex: "maxHeight",
            key: "maxHeight",
            width: 150,
            render: (maxHeight) => (
                <span>{maxHeight}</span>
            ),
        },
        {
            title: "Kiểu chữ",
            dataIndex: "maxHeight",
            key: "maxHeight",
            width: 150,
            render: (maxHeight) => (
                <span>{maxHeight}</span>
            ),
        },
        {
            title: "Giá trị điền",
            dataIndex: "valueType",
            key: "valueType",
            width: 150,
            render: (valueType, record) => {
                switch (valueType) {
                    case 0:
                        return <span>{"Họ và Tên"}</span>;
                    case 1:
                        return <span>{"Họ"}</span>;
                    case 2:
                        return <span>{"Tên"}</span>;
                    case 3:
                        return <span>{"Mã Sinh Viên"}</span>;
                    case 4:
                        return <span>{"Tên Khoa"}</span>;
                    case 5:
                        return <span>{"Tên Lớp"}</span>;
                    default:
                        return <span>{"Mặc Định"}</span>;
                }
            },
        },
        {
            title: "Hành Động",
            dataIndex: "action",
            render: (text, record) => (
                <Row>
                    <Col style={{ padding: 2 }}>
                        <Button
                            type={"primary"}
                            title="Chỉnh sửa"
                            onClick={() => handleSelectChange(record.id)}
                            icon={<FontAwesomeIcon icon={faEdit} />}
                        />
                        <Button
                            loading={setting}
                            disabled={selectedItem == null}
                            icon={<FontAwesomeIcon icon={faTrash} />}
                            type="primary"
                            danger
                            onClick={() =>deleteSetup(record.id)}
                        />
                    </Col>
                </Row>
            ),
        },
    ];



    return (
        <Form form={form} layout="vertical">
            <Form.Item
                name="imageCertificate"
                label="Image:"
                rules={[
                    { required: true, message: "Vui lòng tải lên ảnh!" },
                ]}
            >
                <Upload
                    accept="image/*"
                    onChange={handleOnChange}
                    onPreview={onPreview}
                    customRequest={dummyRequest}
                    listType="picture"
                    fileList={fileList}
                    maxCount={1}
                >
                    <Button>{fileList.length === 0 ? "+ Tải lên" : "Thay đổi ảnh"}</Button>
                </Upload>
            </Form.Item>
            <Form.Item>
                <Button
                    type="primary"
                    onClick={handleUpload}
                    loading={uploading}
                    disabled={fileList.length === 0}
                >
                    Tải lên
                </Button>
            </Form.Item>
            {imageUrl && (
                <Form.Item label="Ảnh đã tải lên:">
                    <Image
                        width={500}
                        src={imageUrl}
                        alt="Uploaded Image"
                    />
                    {/* <p>URL: <a href={imageUrl} target="_blank" rel="noopener noreferrer">{imageUrl}</a></p> */}
                </Form.Item>
            )}
            <Form.Item
                label="Chọn setting"
            >
                <Col span={24} xl={24} xs={24}>
                    <h3 variant="body1" fontWeight={600} color="#0098e5">
                        Danh Sách Cài Đặt
                    </h3>
                    <Row justify="start">
                        <Col span={6} xs={0} xl={6}></Col>
                        <Col span={6} xs={0} xl={6}></Col>
                        <Col span={6} xs={24} xl={6}>
                        <Button
                                type={"primary"}
                                title="Gửi mail"
                                onClick={() => { sendMail() }}
                                icon={<FontAwesomeIcon icon={faPlus} />}
                            >Gửi mail</Button>
                        </Col>
                        <Col span={6} xs={24} xl={6}>
                            <Button
                                type={"primary"}
                                title="Thông tin cá nhân"
                                onClick={() => { setViewModal(true); setNullForm() }}
                                icon={<FontAwesomeIcon icon={faPlus} />}
                            >Tạo Setup Mới</Button>
                        </Col>
                    </Row>
                    {listSetting ?
                        <Table
                            style={{ marginTop: 15 }}
                            columns={columns}
                            dataSource={listSetting}
                            scroll={{ x: 400 }}
                            pagination={{
                                onChange: (page, pageSize) => {
                                    pagination(page, pageSize);
                                },
                                current: page,
                                pageSize: pageSize,
                                total: listSetting.length,
                            }}
                        /> : null
                    }
                </Col>

            </Form.Item>
            <Modal
                title="Setting"
                centered
                visible={isViewModal}
                onCancel={() => {
                    setViewModal(false);
                    setSelectedItem("");
                }}
                width={1000}
                style={{ top: 10 }}
            >
                <div>
                    <Row>
                        <Col span={12} xs={24} xl={12}>
                            <Form.Item
                                name="fontSize"
                                label="Kích cỡ chữ:"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập kích cỡ chữ",
                                    },
                                ]}
                            >
                                <Input
                                    disabled={setting}
                                    placeholder="Nhập kích cỡ chữ"
                                    type="number"
                                    maxLength={5}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12} xs={24} xl={12}>
                            <Form.Item
                                name={"fontId"}
                                label="Kiểu chữ:"
                            >
                                <Select
                                    placeholder="Select an item"
                                    style={{ width: '100%' }}
                                >
                                    {listFont != null ? listFont.map(item => (
                                        <Option key={item.id} value={item.id}>
                                            {item.fontName}
                                        </Option>
                                    )) : <Option value={"chon"}>
                                        {"Chọn font"}
                                    </Option>}
                                </Select>
                            </Form.Item>

                        </Col>
                    </Row>

                    <Row>
                        <Col span={12} xs={24} xl={12}>
                            {/* Ngày sinh thành viên */}
                            <Form.Item
                                name="locationX"
                                label="Chiều ngang:"
                                rules={[
                                    { required: true, message: "Vui lòng nhập chiều ngang" },
                                ]}
                            >
                                <Input
                                    disabled={setting}
                                    type="number"
                                    placeholder="Nhập chiều ngang"
                                    maxLength={4}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12} xs={24} xl={12}>
                            {/* Giới tính thành viên */}
                            <Form.Item
                                name="locationY"
                                label="Chiều dọc:"
                                rules={[
                                    { required: true, message: "Vui lòng nhập chiều dọc!" },
                                ]}
                            >
                                <Input
                                    disabled={setting}
                                    type="number"
                                    placeholder="Nhập chiều dọc"
                                    maxLength={4}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} xs={24} xl={12}>
                            <Form.Item
                                name="maxWidth"
                                label="Chiều rộng tối đa:"
                                rules={[
                                    { required: true, message: "Vui lòng chọn chiều rộng tối da" },
                                ]}
                            >
                                <Input
                                    disabled={setting}
                                    type="number"
                                    placeholder="Nhập chiều rộng tối đa"
                                    maxLength={4}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12} xs={24} xl={12}>
                            <Form.Item
                                name="maxHeight"
                                label="Chiều cao tối đa:"
                                rules={[
                                    { required: true, message: "Vui lòng chọn chiều cao tối đa" },
                                ]}
                            >
                                <Input
                                    disabled={setting}
                                    type="number"
                                    placeholder="Nhập chiều cao tối đa"
                                    maxLength={4}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} xs={24} xl={12}>
                            <Form.Item
                                name="color"
                                label="Màu chữ:"
                                rules={[
                                    { required: true, message: "Vui lòng chọn màu chữ" },
                                ]}
                            >
                                <Space>
                                    <ColorPicker
                                        format={formatHex}
                                        value={colorHex}
                                        onChange={setColorHex}
                                        onFormatChange={setFormatHex}
                                    />
                                    <span>HEX: {hexString}</span>
                                </Space>
                            </Form.Item>
                        </Col>
                        <Col span={12} xs={24} xl={12}>
                            <Form.Item
                                name="vertical"
                                rules={[{ required: true, message: "Vui lòng nhập canh chiều dọc!" }]}
                                label="Canh chiều dọc:"
                            >
                                <Select
                                    placeholder="Select an item"
                                    style={{ width: '100%' }}
                                >
                                    <Option key={0} value={0}>
                                        {"Canh trên"}
                                    </Option>
                                    <Option key={1} value={1}>
                                        {"Canh giữa"}
                                    </Option>
                                    <Option key={2} value={2}>
                                        {"Canh dưới"}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} xs={24} xl={12}>
                            <Form.Item
                                name="horizontal"
                                label="Canh chiều ngang:"
                                rules={[
                                    { required: true, message: "Vui lòng nhập canh chiều ngang!" },
                                ]}
                            >
                                <Select
                                    placeholder="Select an item"
                                    style={{ width: '100%' }}
                                >
                                    <Option key={0} value={0}>
                                        {"Canh trái"}
                                    </Option>
                                    <Option key={2} value={2}>
                                        {"Canh giữa"}
                                    </Option>
                                    <Option key={1} value={1}>
                                        {"Canh phải"}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12} xs={24} xl={12}>
                            {/* email thành viên */}
                            <Form.Item
                                name="fontStyle"
                                label="Kiểu chữ:"
                                rules={[
                                    { required: true, message: "Vui lòng nhập kiểu chữ!" },
                                ]}
                            >
                                <Select
                                    placeholder="Select an item"
                                    style={{ width: '100%' }}
                                >
                                    <Option key={0} value={"Regular"}>
                                        {"Regular"}
                                    </Option>
                                    <Option key={1} value={"Bold"}>
                                        {"Bold"}
                                    </Option>
                                    <Option key={2} value={"Italic"}>
                                        {"Italic"}
                                    </Option>
                                    <Option key={2} value={"Underline"}>
                                        {"Underline"}
                                    </Option>
                                    <Option key={2} value={"Strikeout"}>
                                        {"Strikeout"}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} xs={24} xl={12}>
                            <Form.Item
                                name="defaultText"
                                label="Chuỗi mặc định:"
                                rules={[
                                    { required: true, message: "Vui lòng nhập canh chiều ngang!" },
                                ]}
                            >
                                <Input
                                    disabled={setting || defaultText != 6}
                                    placeholder="Chuỗi mặc định"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12} xs={24} xl={12}>
                            {/* email thành viên */}
                            <Form.Item
                                name="valueType"
                                label="Giá trị điền:"
                                rules={[
                                    { required: true, message: "Vui lòng nhập giá trị điền" },
                                ]}
                            >
                                <Select
                                    placeholder="Select an item"
                                    onChange={handleDefaultText}
                                    style={{ width: '100%' }}
                                >
                                    <Option key={0} value={0}>
                                        {"Họ và tên"}
                                    </Option>
                                    <Option key={1} value={1}>
                                        {"Họ"}
                                    </Option>
                                    <Option key={2} value={2}>
                                        {"Tên"}
                                    </Option>
                                    <Option key={2} value={3}>
                                        {"Mã Sinh Viên"}
                                    </Option>
                                    <Option key={2} value={4}>
                                        {"Tên Khoa"}
                                    </Option>
                                    <Option key={2} value={5}>
                                        {"Tên Lớp"}
                                    </Option>
                                    <Option key={2} value={6}>
                                        {"Chuỗi mặc định"}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} xs={24} xl={24}>
                            <Button
                                loading={setting}
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                block
                                type="primary"
                                onClick={onRegisting}
                            >
                                Đăng ký
                            </Button>
                        </Col>

                    </Row>

                </div>
            </Modal>
        </Form>
    );
};
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

export default connect(mapStateToProps, mapDispatchToProps)(SendCertificate);


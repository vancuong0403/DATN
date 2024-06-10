import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../Helper/TextHelper';
import '../assets/styles/Faculty.css';
import { DeleteOutlined, ExclamationCircleOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

import { Button, Input, notification, Modal, Form, Row, Col, InputNumber } from 'antd';
import { color } from 'framer-motion';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
import { ACCESS_TOKEN, GetCookieData } from '../Helper/CookieHelper';





const ExampleComponent = () => {
    const [api, contextHolder] = notification.useNotification();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formAddScore] = Form.useForm();
    const [formAddScore2] = Form.useForm();
    const modalRef = useRef(null); // Ref để truy cập vào phần tử modal
    const [searchValue, setSearchValue] = useState('');
    const [ShowModal, setShowModal] = useState(false)
    const [ShowModal1, setShowModal1] = useState(false)
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [Id, setId] = useState('');
    const [editedFacultyName, setEditedFacultyName] = useState('');

    const openNotificationWithIcon = (type, strTitle, strDescription) => {
        notification.open({
            message: strTitle,
            description: strDescription,
            type: type,
        });
    };
    

    const errorHelper = async (data) => {
        if (data === null || data === undefined) {
            openNotificationWithIcon('error', "Mất kết nối với máy chủ", "Không thể kết nối với máy chủ, vui lòng thử lại sau ít phút hoặc báo cáo với BCN.");
            logout();
            return;
        }

        if (data.response && data.response.status) {
            if (data.response && data.response.status && data.response.status === 401) {
                logout();
                return;
            }
            else if (data.response && data.response.status && data.response.status === 404) {
                logout();
                return;
            }
            else {
                openNotificationWithIcon('error', `Lỗi ${data.response.status}`, data.response.error ? data.response.error : data.response.message ? data.response.message : "Xuất hiện lỗi không xác định.");
                logout();
                return;
            }
        }

        if (data.errorsCode && data.errorsCode === 100002) {
            // refresh token
            window.location.href = window.location.href;
        }
        else if (data.errorsCode && data.errorsCode === 100004) {
            openNotificationWithIcon('error', "Phiên đăng nhập hết hạn", "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.");
            logout();
        }
        else if (data.errorsCode && data.errorsCode === 200001) {
            openNotificationWithIcon('error', "Thông báo hệ thống", "Hệ thống đang bảo trì, vui lòng quay lại sau ít phút.");
        }
        else if ((data.error && (data.error === "ERR_NETWORK" || data.error === "ERR_CONNECTION_REFUSED")) ||
            (data.name && data.name === "AxiosError")) {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", "Mất kết nối với máy chủ. Vui lòng thử lại sau ít phút");
            logout();
        }
        else {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", data.errors ? data.errors[0] : "Không xác định được lỗi!");
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL + 'api/Facultys/GetAllFacultys');
            setData(response.data.dataValue);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };





    const closeModal = () => {
        modalRef.current.style.display = 'none'; // Đóng modal nếu hủy
    };

    //tìm kiếm
    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        console.log('searchValue:', e.target.value);

    };
    function edit(id) {
        const faculty = data.find(item => item.id === id);
        if (faculty) {       
            formAddScore2.setFieldsValue({faculty : faculty.facultyName});
            setId(id);
            setShowModal1(true);       
        }
    }
    const handleEdit = async () => {
        const facultyname = formAddScore2.getFieldValue("faculty"); // Thay vì formAddScore, sử dụng formAddScore2
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + strAccessToken
        };
        const objUpdateData = {
            facultyName: facultyname,
            id: Id // Sử dụng Id đã được lưu khi chỉnh sửa
        };
        const strApiURL = API_URL + 'api/Facultys/UpdateFaculty';
        await axios.post(strApiURL, JSON.stringify(objUpdateData), { headers })
            .then((response) => {
                if (response.data.isSuccess === false) {
                    errorHelper(response.data);
                } else {
                    openNotificationWithIcon('success', "Thành Công", `Cập nhật thông tin khoa/viện thành công.`);
                    fetchData(); // Gọi lại hàm fetchData để cập nhật danh sách mới
                    setShowModal1(false); // Đóng modal chỉnh sửa
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
    };
    

    function add() {
        setShowModal(true)
        console.log("vc");
    }
    const handleAdd = async () => {
        const facultyname = formAddScore.getFieldValue("faculty")
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + strAccessToken
        }
        const objUpdateData = {
            "facultyName": facultyname
        }
        const strApiURL = API_URL + 'api/Facultys/CreateFaculty';
        await axios.post(strApiURL, JSON.stringify(objUpdateData), { headers })
            .then((response) => {
                if (response.data.isSuccess === false) {
                    errorHelper(response.data);
                }
                else {
                    openNotificationWithIcon('success', "Thành Công", `Tạo chức vụ thành công.`);
                    console.log("ok");
                    fetchData();
                    setShowModal(false); // Đóng modal chỉnh sửa
                }
            })
            .catch((error) => {
                errorHelper(error);
            });

    };
    const filteredData = data.filter(item =>
        item.facultyName.toLowerCase().includes(searchValue.toLowerCase())
    );


    return (

        <div className="faculty-list">


            <Modal
                visible={ShowModal}
                onOk={handleAdd}
                onCancel={() => setShowModal(false)}
                centered
                title={"Tạo khoa"}
                footer={[
                    <Button key="back" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => handleAdd()}>
                        Cập nhật
                    </Button>
                ]}
            >
                <Form form={formAddScore}>
                    <Row>
                        <Col span={40} className={"col-md-5"} xs={24} xl={24}>
                            <Form.Item
                                name="faculty"
                                label="Khoa:"
                                rules={[{
                                    required: true,
                                    message: 'Vui lòng nhập khoa/viện!',
                                }]}
                            >
                                <Input placeholder="Nhập khoa/viện" style={{ width: '300px' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                </Form>
            </Modal>

            <Modal
                visible={ShowModal1}
                onOk={handleEdit}
                onCancel={() => setShowModal1(false)}
                centered
                title={"Đổi tên khoa/viện"}
                footer={[
                    <Button key="back" onClick={() => setShowModal1(false)}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => handleEdit()}>
                        Cập nhật
                    </Button>
                ]}
            >
                <Form form={formAddScore2}>
                    <Row>
                        <Col span={40} className={"col-md-5"} xs={24} xl={24}>
                            <Form.Item
                                name="faculty"
                                label="Tên khoa/viện:"
                                rules={[{
                                    required: true,
                                    message: 'Vui lòng nhập khoa/viện!',
                                }]}
                            >
                                <Input placeholder="Nhập khoa/viện" style={{ width: '300px' }} defaultValue={editedFacultyName} />
                            </Form.Item>
                        </Col>
                    </Row>

                </Form>
            </Modal>
            <div style={{ width: '452px', marginBottom: '10px', height: '35px' }}>
                <Input
                    placeholder="Tìm kiếm"
                    value={searchValue}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Danh sách chức vụ */}
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    {filteredData.map(item => (
                        <div key={item.id} className="faculty-item">
                            <div className="faculty-name">{item.facultyName}</div>
                            <Button className='primary-button' icon={<EditOutlined />} onClick={() => edit(item.id)}></Button>
                        </div>

                    ))}
                </div>
            )}

            <div className='add'>
                <Button type="primary" onClick={add} >
                    <PlusOutlined />
                </Button>
            </div>
        </div>
    );
};

export default ExampleComponent;

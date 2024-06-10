import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Form,
    Input,
    Select,
    Button,
    Modal
} from "antd";
import { API_URL, RemoveVietnameseAccents } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';

function ChangeAddressDlg({ wardId, districtId, provinceId, specificAddress, onChangeAddressSuccess, onError, isModalOpen, handleCancel }) {
    const [loading, setLoading] = useState(false);
    const [lstProvince, setLstProvince] = useState(null);
    const [lstDistrict, setLstDistrict] = useState(null);
    const [lstWard, setLstWard] = useState(null);
    const { Option } = Select;
    const { TextArea } = Input;

    const [addressInfo] = Form.useForm();
    const UpdateAddress = async () => {
        const selectprovince = addressInfo.getFieldValue("province");
        const selectdistrict = addressInfo.getFieldValue("district");
        const selectward = addressInfo.getFieldValue("ward");
        const specifictxt = addressInfo.getFieldValue("specificaddress");
        var isValid = true;
        setLoading(true);
        if (selectprovince === undefined || selectprovince.replace(/ /g, '') === '') {
            addressInfo.setFields([{
                name: "province",
                errors: ["Vui lòng chọn Tỉnh/Thành phố"]
            }]);
            isValid = false;
        }
        if (selectdistrict === undefined || selectdistrict.replace(/ /g, '') === '') {
            addressInfo.setFields([{
                name: "district",
                errors: ["Vui lòng chọn Quận/Huyện"]
            }]);
            isValid = false;
        }
        if (selectward === undefined || selectward.replace(/ /g, '') === '') {
            addressInfo.setFields([{
                name: "ward",
                errors: ["Vui lòng chọn Phường/Xã"]
            }]);
            isValid = false;
        }
        if (specifictxt === undefined || specifictxt.replace(/ /g, '') === '') {
            addressInfo.setFields([{
                name: "specificaddress",
                errors: ["Vui lòng nhập số nhà, tên đường"]
            }]);
            isValid = false;
        }
        if (isValid == false) {
            setLoading(false);
            return;
        }

        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + strAccessToken
        }
        const requestData = {
            "specificAddress": specifictxt,
            "provinceId": selectprovince,
            "districtId": selectdistrict,
            "wardId": selectward
        };
        const strApiURL = `${API_URL}api/Address/UpdateHometown`;
        await axios.put(strApiURL, JSON.stringify(requestData), { headers })
            .then((response) => {
                if (response.data.isSuccess === false) {
                    onError(response);
                }
                else {
                    onChangeAddressSuccess();
                }
            })
            .catch((error) => {
                onError(error);
            });
        setLoading(false);
    }

    const GetProvince = async () => {
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
        }
        const strApiURL = `${API_URL}api/Address/GetProvinces`;
        await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setLstProvince(response.data.dataValue);
                }
            })
            .catch((error) => {
            })
    }

    const changeSelectProvince = e => {
        addressInfo.setFieldsValue({ district: undefined });
        GetDistrict(e);
    }

    const changeSelectDistrict = e => {
        addressInfo.setFieldsValue({ ward: undefined });
        GetWard(e);
    }

    const GetDistrict = async (selectedProvinceId) => {
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
        };
        const param = {
            x_strProvinceId: selectedProvinceId
        };
        const strApiURL = `${API_URL}api/Address/GetDistrictsByProvinceId`;
        await axios.get(strApiURL, { withCredentials: true, params: param, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setLstDistrict(response.data.dataValue);
                    const isDistrictIdExist = response.data.dataValue.find(item => item.districtId === districtId) !== undefined;
                    if (districtId && isDistrictIdExist) {
                        addressInfo.setFieldsValue({ district: districtId });
                    }
                }
            })
            .catch((error) => {
            })
    }

    const GetWard = async (selectedDistrictId) => {
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
        };
        const param = {
            x_strDistrictId: selectedDistrictId
        };
        const strApiURL = `${API_URL}api/Address/GetWardsByDistrictId`;
        await axios.get(strApiURL, { withCredentials: true, params: param, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setLstWard(response.data.dataValue);
                    const isWardIdExist = response.data.dataValue.find(item => item.wardId === wardId) !== undefined;
                    if (wardId && isWardIdExist) {
                        addressInfo.setFieldsValue({ ward: wardId });
                    }
                }
            })
            .catch((error) => {
            })
    }

    useEffect(() => {
        GetProvince();
        if (provinceId) {
            addressInfo.setFieldsValue({ province: provinceId });
            GetDistrict(provinceId);
        }
        if (districtId) {
            GetWard(districtId);
        }
        if (specificAddress) {
            addressInfo.setFieldsValue({ specificaddress: specificAddress });
        }
    }, []);
    return (
        <div>
            <Modal
                title="Cập nhật địa chỉ"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel} loading={loading}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={UpdateAddress}>
                        Cập Nhật
                    </Button>
                ]}>
                <Form form={addressInfo}>
                    <Row style={{ marginTop: 30 }}>
                        <Col span={24} xs={24} xl={24}>
                            <Row>
                                <Col span={8} xs={24} xl={8} style={{ textAlign: "left" }}>
                                    Tỉnh/Thành phố:
                                </Col>
                                <Col span={16} xs={24} xl={16}>
                                    <Form.Item
                                        name="province"
                                        rules={[{
                                            required: true,
                                            message: 'Vui lòng chọn tỉnh/thành phố!'
                                        }]}
                                    >
                                        <Select
                                            showSearch
                                            className="text-left"
                                            placeholder="Chọn tỉnh/thành phố"
                                            filterOption={
                                                (input, option) =>
                                                    RemoveVietnameseAccents(option.children).toLowerCase().indexOf(RemoveVietnameseAccents(input).toLowerCase()) >= 0
                                            }
                                            filterSort={
                                                (optionA, optionB) =>
                                                    optionA.value.toLowerCase().localeCompare(optionB.value.toLowerCase())
                                            }
                                            disabled={loading}
                                            onChange={changeSelectProvince}
                                        >
                                            {lstProvince ? lstProvince.map((provinceItem) => (
                                                <Option value={provinceItem.provinceId} >{provinceItem.provinceName}</Option>
                                            )) : <Option value="chon">Chọn Tỉnh/Thành phố</Option>}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24} xs={24} xl={24}>
                            <Row>
                                <Col span={8} xs={24} xl={8} style={{ textAlign: "left" }}>
                                    Quận/Huyện:
                                </Col>
                                <Col span={16} xs={24} xl={16}>
                                    <Form.Item
                                        name="district"
                                        rules={[{
                                            required: true,
                                            message: 'Vui lòng chọn quận/huyện!'
                                        }]}
                                    >
                                        <Select
                                            showSearch
                                            className="text-left"
                                            placeholder="Chọn quận/huyện"
                                            filterOption={
                                                (input, option) =>
                                                    RemoveVietnameseAccents(option.children).toLowerCase().indexOf(RemoveVietnameseAccents(input).toLowerCase()) >= 0
                                            }
                                            filterSort={
                                                (optionA, optionB) =>
                                                    optionA.value.toLowerCase().localeCompare(optionB.value.toLowerCase())
                                            }
                                            disabled={loading}
                                            onChange={changeSelectDistrict}
                                        >
                                            {lstDistrict ? lstDistrict.map((districtItem) => (
                                                <Option value={districtItem.districtId} >{districtItem.districtName}</Option>
                                            )) : <Option value="chon">Chọn Quận/Huyện</Option>}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24} xs={24} xl={24}>
                            <Row>
                                <Col span={8} xs={24} xl={8} style={{ textAlign: "left" }}>
                                    Xã/Phường:
                                </Col>
                                <Col span={16} xs={24} xl={16}>
                                    <Form.Item
                                        name="ward"
                                        rules={[{
                                            required: true,
                                            message: 'Vui lòng chọn xã/phường!'
                                        }]}
                                    >
                                        <Select
                                            showSearch
                                            className="text-left"
                                            placeholder="Chọn xã/phường"
                                            filterOption={
                                                (input, option) =>
                                                    RemoveVietnameseAccents(option.children).toLowerCase().indexOf(RemoveVietnameseAccents(input).toLowerCase()) >= 0
                                            }
                                            filterSort={
                                                (optionA, optionB) =>
                                                    optionA.value.toLowerCase().localeCompare(optionB.value.toLowerCase())
                                            }
                                            disabled={loading}
                                        >
                                            {lstWard ? lstWard.map((wardItem) => (
                                                <Option value={wardItem.wardId} >{wardItem.wardName}</Option>
                                            )) : <Option value="chon">Chọn Xã/Phường</Option>}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24} xs={24} xl={24}>
                            <Row>
                                <Col span={8} xs={24} xl={8} style={{ textAlign: "left" }}>
                                    Số nhà, tên đường:
                                </Col>
                                <Col span={16} xs={24} xl={16}>
                                    <Form.Item
                                        name="specificaddress"
                                        rules={[{
                                            required: true,
                                            message: 'Vui lòng nhập số nhà, tên đường!'
                                        }]}
                                    >
                                        <TextArea
                                            disabled={loading}
                                            showCount
                                            maxLength={255}
                                            placeholder="Số nhà, tên đường"
                                            style={{
                                                height: 120,
                                                resize: 'none',
                                            }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}

export default ChangeAddressDlg;
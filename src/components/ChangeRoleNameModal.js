import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Form,
    Input,
    Card,
    Button,
    Modal
} from "antd";

const ChangeRoleNameModal = ({ x_objData, x_nDataType, x_bIsShowModal, x_bIsChangeLoading, x_evtOnOk, x_evtOnCancel }) => {
    const [changeRoleName] = Form.useForm();

    const onChangeOk = () => {
        const strRoleName = changeRoleName.getFieldValue("roleName");
        if (strRoleName === undefined || strRoleName.replace(/ /g, '') === '') {
            changeRoleName.setFields([{
                name: "roleName",
                errors: ["Vui lòng nhập tên chức vụ!"]
            }]);
            return;
        }

        if (x_evtOnOk) {
            x_evtOnOk(strRoleName, x_objData ? x_objData.roleName : null);
        }
    }

    useEffect(() => {
        if (x_objData) {
            changeRoleName.setFieldsValue({ roleName: x_objData.roleName });
        }
        else {
            changeRoleName.setFieldsValue({ roleName: undefined });
        }
    }, [x_objData]);

    return (
        <div>
            <Modal
                title={x_objData && x_nDataType === 1 ? "Đổi tên chức vụ" : "Tạo chức vụ"}
                open={x_bIsShowModal}
                onCancel={x_evtOnCancel}
                footer={[
                    <Button key="back" onClick={x_evtOnCancel}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" loading={x_bIsChangeLoading} onClick={onChangeOk}>
                        Cập Nhật
                    </Button>
                ]}>
                <Form form={changeRoleName}>
                    <Row style={{ marginTop: 30 }}>
                        <Col span={24} xs={24} xl={24}>
                            <Row>
                                <Col span={8} xs={24} xl={8} style={{ textAlign: "left" }}>
                                    Tên Chức Vụ:
                                </Col>
                                <Col span={16} xs={24} xl={16}>
                                    <Form.Item
                                        name="roleName"
                                        rules={[{ required: true, message: 'Tên chức vụ không được để trống!' }]}
                                    >
                                        <Input size="large" disabled={x_bIsChangeLoading} maxLength={100} />
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

export default ChangeRoleNameModal;
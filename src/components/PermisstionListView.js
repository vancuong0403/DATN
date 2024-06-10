import React, { useEffect, useState, useRef } from 'react';
import {
    Result,
    Card,
    Row,
    Col,
    Input,
    Button,
    Modal
} from 'antd';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Typography } from './StyledTypography';
import { RemoveVietnameseAccents } from "../Helper/TextHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus, faPenToSquare, faTrash
} from "@fortawesome/free-solid-svg-icons";
import '../assets/styles/PermisstionListView.css';
import ChangeRoleNameModal from './ChangeRoleNameModal';

const PermisstionListView = ({ x_lstData, x_objSelectRole, x_nDataType, x_bIsLoading, onDelete, onAdded, onChangeRoleName, onItemSelected, x_bIsBroken }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [m_bIsShowModal, setIsShowModal] = useState(false);
    const [m_bIsChangeLoading, setIsChangeLoading] = useState(false);
    const [m_lstFilteredData, setFilteredData] = useState(x_lstData);
    const { confirm } = Modal;
    let searchTimeout;

    const handleSearchRoleName = (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const filtered = x_lstData.filter(item =>
                RemoveVietnameseAccents(item.roleName).toLowerCase().includes(RemoveVietnameseAccents(term).toLowerCase())
            );
            setFilteredData(filtered);
        }, 500);
    };

    const handleSearchPermissionName = (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const filtered = x_lstData.filter(item =>
                RemoveVietnameseAccents(item.name).toLowerCase().includes(RemoveVietnameseAccents(term).toLowerCase())
            );
            setFilteredData(filtered);
        }, 500);
    };

    const handleSearchPermissionName2 = (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const filtered = x_lstData.filter(item =>
                RemoveVietnameseAccents(item.permissionsName).toLowerCase().includes(RemoveVietnameseAccents(term).toLowerCase())
            );
            setFilteredData(filtered);
        }, 500);
    };

    const handleItemClick = (item) => {
        if (x_nDataType !== 3) {
            setSelectedItem(item);
        }

        if (onItemSelected) {
            onItemSelected(item, x_nDataType);
        }
    };

    const handleAddNew = () => {
        if (x_nDataType === 1) {
            setSelectedItem(null);
            setIsShowModal(true);
        }
        else if (onAdded) {
            onAdded(x_nDataType);
        }
    }

    const DeletePermission = (item) => {
        DeleteConfirm(item);
    }

    const ChangeRoleName = (item) => {
        setSelectedItem(item);
        setIsShowModal(true);
    }

    const onCancelDlgChangeRoleName = () => {
        setIsShowModal(false);
    }

    const DeleteConfirm = (item) => {
        confirm({
            title: 'Xoá Quyền',
            icon: <ExclamationCircleOutlined />,
            content: <span>Bạn có muốn xoá quyền <b style={{ color: "red" }}>{item.permissionsName}</b> khỏi chức vụ <b style={{ color: "red" }}>{x_objSelectRole ? x_objSelectRole.roleName : ""}</b>?</span>,
            okText: 'Đồng Ý',
            cancelText: 'Huỷ',
            onOk() {
                if (onDelete) {
                    onDelete(item);
                }
            }
        });
    };

    const ChangeRoleNameConfirm = (x_strRoleName, x_strOldRoleName) => {
        confirm({
            title: 'Xoá Quyền',
            icon: <ExclamationCircleOutlined />,
            content: <span>Bạn có muốn đổi tên chức vụ <b style={{ color: "red" }}>{x_strOldRoleName}</b> thành <b style={{ color: "red" }}>{x_strRoleName}</b> không?</span>,
            okText: 'Đồng Ý',
            cancelText: 'Huỷ',
            onOk() {
                if (onChangeRoleName) {
                    onChangeRoleName(x_strRoleName, x_strOldRoleName);
                }
            }
        });
    };

    const handleChangeRoleName = (x_strRoleName, x_strOldRoleName) => {
        if (x_strOldRoleName) {
            setIsChangeLoading(true);
            ChangeRoleNameConfirm(x_strRoleName, x_strOldRoleName);
            setIsChangeLoading(false);
            setIsShowModal(false);
        }
        else {
            onAdded(x_strRoleName);
        }
    }

    useEffect(() => {
        if (m_lstFilteredData && m_lstFilteredData.length > 0) {
            handleItemClick(m_lstFilteredData[0]);
        }
    }, [m_lstFilteredData]);

    useEffect(() => {
        if (x_lstData) {
            setFilteredData(x_lstData);
        }
        else {
            setFilteredData([]);
        }
    }, [x_lstData]);

    return (
        <div>
            <ChangeRoleNameModal
                x_bIsChangeLoading={m_bIsChangeLoading}
                x_bIsShowModal={m_bIsShowModal}
                x_nDataType={x_nDataType}
                x_evtOnCancel={onCancelDlgChangeRoleName}
                x_evtOnOk={handleChangeRoleName}
                x_objData={selectedItem} />
            <Card style={x_bIsBroken === false ? { minHeight: 500, maxHeight: 500, overflowY: "auto" } : {}}>
                {
                    x_bIsLoading === false ?
                        <div>
                            {
                                x_nDataType === 1 && m_lstFilteredData !== null ?
                                    <Row>
                                        <Col span={24} xs={24} xl={24} style={{ marginBottom: 15 }}>
                                            <Input
                                                placeholder="Tìm kiếm"
                                                value={searchTerm}
                                                onChange={handleSearchRoleName}
                                            />
                                        </Col>
                                        <Col span={24} xs={24} xl={24}>
                                            {m_lstFilteredData.map((item, index) => (
                                                <li
                                                    key={item.permissionsId}
                                                    onClick={() => handleItemClick(item)}
                                                    className={"permisstion-item" + (selectedItem === item ? ' permisstion-selected' : '')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <Row>
                                                        <Col span={22} xs={22} xl={22}>
                                                            <Typography variant="body1" fontWeight={400}>
                                                                {item.roleName}
                                                            </Typography>
                                                        </Col>
                                                        <Col span={2} xs={2} xl={2}>
                                                            <Button 
                                                            size='small' 
                                                            icon={<FontAwesomeIcon icon={faPenToSquare} />} 
                                                            onClick={() => { ChangeRoleName(item) }} 
                                                            type="primary" />
                                                        </Col>
                                                    </Row>
                                                </li>
                                            ))}

                                            <li
                                                onClick={() => handleAddNew()}
                                                className={"permisstion-item"}
                                                style={{ cursor: 'pointer', textAlign: "center" }}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                            </li>
                                        </Col>
                                    </Row>
                                    :
                                    x_nDataType === 2 && m_lstFilteredData !== null ?
                                        <Row>
                                            <Col span={24} xs={24} xl={24} style={{ marginBottom: 15 }}>
                                                <Input
                                                    type="text"
                                                    placeholder="Tìm kiếm"
                                                    value={searchTerm}
                                                    onChange={handleSearchPermissionName}
                                                />
                                            </Col>
                                            <Col span={24} xs={24} xl={24}>
                                                {m_lstFilteredData.map((item, index) => (
                                                    <li
                                                        onClick={() => handleItemClick(item)}
                                                        key={item.id}
                                                        className={"permisstion-item" + (selectedItem === item ? ' permisstion-selected' : '')}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <Typography variant="body1" fontWeight={400}>
                                                            {item.name}
                                                        </Typography>
                                                    </li>
                                                ))}
                                            </Col>
                                        </Row>
                                        :
                                        x_nDataType === 3 && m_lstFilteredData !== null ?
                                            <Row>
                                                <Col span={24} xs={24} xl={24} style={{ marginBottom: 15 }}>
                                                    <Input
                                                        type="text"
                                                        placeholder="Tìm kiếm"
                                                        value={searchTerm}
                                                        onChange={handleSearchPermissionName2}
                                                    />
                                                </Col>
                                                <Col span={24} xs={24} xl={24}>
                                                    {m_lstFilteredData ? m_lstFilteredData.map((item, index) => (
                                                        <li
                                                            key={item.permissionsId}
                                                            className={"permisstion-item" + (selectedItem === item ? ' permisstion-selected' : '')}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <Row>
                                                                <Col span={22} xs={22} xl={22}>
                                                                    <Typography variant="body1" fontWeight={400}>
                                                                        {item.permissionsName}
                                                                    </Typography>
                                                                </Col>
                                                                <Col span={2} xs={2} xl={2}>
                                                                    <Button
                                                                        danger
                                                                        type="primary"
                                                                        size='small'
                                                                        icon={<FontAwesomeIcon icon={faTrash} />}
                                                                        onClick={() => { DeletePermission(item) }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </li>
                                                    )) : null}
                                                    <li
                                                        onClick={() => handleAddNew()}
                                                        className={"permisstion-item"}
                                                        style={{ cursor: 'pointer', textAlign: "center" }}
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </li>
                                                </Col>
                                            </Row>
                                            : <Result
                                                status="404"
                                                title="Rỗng!"
                                                subTitle="Không tìm thấy dữ liệu."
                                            />
                            }
                        </div>
                        :
                        <Result
                            status="404"
                            title="Rỗng!"
                            subTitle="Không tìm thấy dữ liệu."
                        />
                }
            </Card>
        </div>
    );
}

export default PermisstionListView;
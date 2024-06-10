
import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Form,
    Result,
    Card,
    Collapse,
    Button,
    Modal
} from "antd";
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Typography } from './StyledTypography';
import { RemoveVietnameseAccents } from "../Helper/TextHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus, faTrash, faArrowRightFromBracket
} from "@fortawesome/free-solid-svg-icons";

const AddNewPermission = ({ x_objRoleSelected, x_objPermissionSelected, x_lstFullPermissionGroup, x_bIsShowModal, x_evtOnOk, x_evtOnCancel, x_bIsBroken }) => {
    const [m_lstFilteredPermissionGroups, setFilteredPermissionGroups] = useState([]);
    const [m_lstGroupItems, setGroupItems] = useState(null);
    const [m_lstGroupItemsSelected, setGroupItemsSelected] = useState([]);

    const FilteredPermission = () => {
        if (x_objRoleSelected && x_lstFullPermissionGroup) {
            const arrClonedFullPermissionGroup = [...x_lstFullPermissionGroup];
            const arrSelectedPermissionIds = [];

            if (!x_objRoleSelected || !x_objRoleSelected.permissions || x_objRoleSelected.permissions.length === 0) {
                console.log(arrClonedFullPermissionGroup);
                return arrClonedFullPermissionGroup;
            }

            x_objRoleSelected.permissions.forEach(permissionGroup => {
                permissionGroup.permissions.forEach(permission => {
                    arrSelectedPermissionIds.push(permission.permissionsId);
                });
            });

            const arrFilteredPermissionGroups = arrClonedFullPermissionGroup.map(objGroup => {
                return {
                    ...objGroup,
                    permissions: objGroup.permissions.filter(objPermission => !arrSelectedPermissionIds.includes(objPermission.permissionsId))
                };
            }).filter(objGroup => objGroup.permissions.length > 0);

            if (x_objPermissionSelected && arrFilteredPermissionGroups) {
                arrFilteredPermissionGroups.sort((a, b) => {
                    if (a.id === x_objPermissionSelected.id) return -1;
                    if (b.id === x_objPermissionSelected.id) return 1;
                    return 0;
                });
            }
            return arrFilteredPermissionGroups;
        }
        else {
            return null;
        }
    }

    const onSelectedItem = (item, x_nId, x_strname) => {
        const strName = x_strname;

        if (!m_lstGroupItemsSelected) {
            setGroupItemsSelected([{
                id: x_nId,
                name: strName,
                permissions: [item]
            }]);
        } else {
            const existingGroupIndex = m_lstGroupItemsSelected.findIndex(group => group.id === x_nId);
            if (existingGroupIndex !== -1) {
                setGroupItemsSelected(prevState => {
                    const updatedGroups = [...prevState];
                    updatedGroups[existingGroupIndex] = {
                        ...updatedGroups[existingGroupIndex],
                        permissions: [...updatedGroups[existingGroupIndex].permissions, item]
                    };
                    return updatedGroups;
                });
            } else {
                setGroupItemsSelected(prevState => [
                    ...prevState,
                    {
                        id: x_nId,
                        name: strName,
                        permissions: [item]
                    }
                ]);
            }
        }
        deletePermissionFromGroup(item, x_nId)
    }

    const deletePermissionFromGroup = (item, x_nId) => {
        const groupIndex = m_lstFilteredPermissionGroups.findIndex(group => group.id === x_nId);

        if (groupIndex === -1) {
            return;
        }

        const updatedGroup = {
            ...m_lstFilteredPermissionGroups[groupIndex],
            permissions: m_lstFilteredPermissionGroups[groupIndex].permissions.filter(permission => permission.permissionsId !== item.permissionsId)
        };

        setFilteredPermissionGroups(prevGroups => {
            const updatedGroups = [...prevGroups];
            updatedGroups[groupIndex] = updatedGroup;
            return updatedGroups;
        });
    };

    const DeletePermissionFromSelected = (item, x_nGroupId) => {
        var groupIndex = m_lstFilteredPermissionGroups.findIndex(group => group.id === x_nGroupId);

        if (groupIndex === -1) {
            return;
        }

        const updatedGroup = {
            ...m_lstFilteredPermissionGroups[groupIndex],
            permissions: [...m_lstFilteredPermissionGroups[groupIndex].permissions, item]
        };

        setFilteredPermissionGroups(prevGroups => {
            const updatedGroups = [...prevGroups];
            updatedGroups[groupIndex] = updatedGroup;
            return updatedGroups;
        });

        groupIndex = m_lstGroupItemsSelected.findIndex(group => group.id === x_nGroupId);

        if (groupIndex === -1) {
            return;
        }

        const updatedGroupSelected = {
            ...m_lstGroupItemsSelected[groupIndex],
            permissions: m_lstGroupItemsSelected[groupIndex].permissions.filter(permission => permission !== item)
        };

        setGroupItemsSelected(prevGroups => {
            const updatedGroups = [...prevGroups];
            updatedGroups[groupIndex] = updatedGroupSelected;
            return updatedGroups;
        });
        setGroupItemsSelected(prevGroups => prevGroups.filter(obj => obj.permissions.length > 0));
    };

    const CreateGroupItem = (x_objGroup) => {
        return (
            <Row>
                <Col span={24} xs={24} xl={24}>
                    {
                        x_objGroup ? x_objGroup.permissions.map((item, index) => (
                            <li
                                key={item.permissionsId}
                                className={"permisstion-item"}
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
                                            type="primary"
                                            size='small'
                                            onClick={() => { onSelectedItem(item, x_objGroup.id, x_objGroup.name) }}
                                            icon={<FontAwesomeIcon icon={faArrowRightFromBracket} />}
                                        />
                                    </Col>
                                </Row>
                            </li>
                        )) : null}
                </Col>
            </Row>
        );
    }

    const onChangeOk = () => {
        const allPermissionIds = [];

        m_lstGroupItemsSelected.forEach(objGroup => {
            if (objGroup && objGroup.permissions && objGroup.permissions.length > 0) {
                objGroup.permissions.forEach(objPermission => {
                    if (objPermission) {
                        allPermissionIds.push(objPermission.permissionsId);
                    }
                });
            }
        });
        if (x_evtOnOk && allPermissionIds.length > 0) {
            x_evtOnOk(allPermissionIds);
        }
    }

    useEffect(() => {
        const lstFilteredGroup = FilteredPermission();
        setFilteredPermissionGroups(lstFilteredGroup);
    }, [x_objRoleSelected, x_objPermissionSelected, x_lstFullPermissionGroup]);


    useEffect(() => {
        if (x_bIsShowModal) {
            setGroupItemsSelected([]);
        }
    }, [x_bIsShowModal]);

    useEffect(() => {
        if (m_lstFilteredPermissionGroups !== null && m_lstFilteredPermissionGroups.length > 0) {
            var items = [];
            m_lstFilteredPermissionGroups.map((item, index) => {
                var objGroupItem = CreateGroupItem(item);
                var objData = {
                    key: `${item.id}`,
                    label: item.name,
                    children: objGroupItem
                }
                items.push(objData);
            });
            setGroupItems(items);
        }
    }, [m_lstFilteredPermissionGroups]);

    return (
        <div>
            <Modal
                title={"Thêm quyền" + (x_objRoleSelected ? ` (${x_objRoleSelected.roleName})` : "")}
                open={x_bIsShowModal}
                onCancel={x_evtOnCancel}
                footer={[
                    <Button key="back" onClick={x_evtOnCancel}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" onClick={onChangeOk} disabled={!(m_lstGroupItems && m_lstGroupItems.length > 0)}>
                        Cập Nhật
                    </Button>
                ]}
                width={1000}
            >
                <Card>
                    {
                        m_lstGroupItems && m_lstGroupItems.length > 0 ?
                            <div>
                                <Row>
                                    <Col span={12} xs={24} xl={12}>
                                        <Card style={x_bIsBroken === false ? { minHeight: 300, maxHeight: 300, overflowY: "auto" } : {}}>
                                            {
                                                m_lstGroupItems ?
                                                    <Collapse
                                                        items={m_lstGroupItems}
                                                        defaultActiveKey={[m_lstGroupItems !== null && m_lstGroupItems.length > 0 ? m_lstGroupItems[0].key : '']} />
                                                    : null
                                            }
                                        </Card>
                                    </Col>
                                    <Col span={12} xs={24} xl={12}>
                                        <Card style={x_bIsBroken === false ? { minHeight: 300, maxHeight: 300, overflowY: "auto" } : {}}>
                                            {m_lstGroupItemsSelected ? m_lstGroupItemsSelected.map(group => (
                                                <div key={group.id}>
                                                    <Typography variant="body1" fontWeight={500} color="gray">{group.name}</Typography>
                                                    {group.permissions.map(permission => (
                                                        <li
                                                            key={permission.permissionsId}
                                                            className="permisstion-item"
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <Row>
                                                                <Col span={22} xs={22} xl={22}>
                                                                    <Typography variant="body1" fontWeight={400}>
                                                                        {permission.permissionsName}
                                                                    </Typography>
                                                                </Col>
                                                                <Col span={2} xs={2} xl={2}>
                                                                    <Button
                                                                        danger
                                                                        type="primary"
                                                                        size='small'
                                                                        icon={<FontAwesomeIcon icon={faTrash} />}
                                                                        onClick={() => { DeletePermissionFromSelected(permission, group.id) }}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </li>
                                                    ))}
                                                </div>
                                            )) : null}
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                            :
                            <Result
                                status="404"
                                title="Rỗng!"
                                subTitle="Chức vụ này đã đầy đủ các quyền truy cập mà hệ thống cho phép."
                            />
                    }
                </Card>
            </Modal>
        </div>
    );
};

export default AddNewPermission;
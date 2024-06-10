import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
    Row,
    Col,
    notification,
    Card,
    Skeleton,
} from "antd";
import { API_URL} from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import { Typography } from './StyledTypography';
import PermisstionListView from './PermisstionListView';
import AddNewPermission from './AddNewPermission';
import ChangeRoleMemberList from './ChangeRoleMemberList';

const RolesManagerment = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isBroken, x_bIsToggled }) => {
    const [api, contextHolder] = notification.useNotification();
    const [m_lstRoleList, setRoleList] = useState(null);
    const [m_lstMemberList, setMemberList] = useState(null);
    const [m_lstPermissionList, setPermissionList] = useState(null);
    const [m_objRoleSelectedItem, setRoleSelectedItem] = useState(null);
    const [m_objPermSelectedItem, setPermSelectedItem] = useState(null);
    const [m_bIsShowAddPermissionModal, setIsShowAddPermissionModal] = useState(false);
    const [m_bLoading, setLoading] = useState(false);
    const [m_bChangeRoleLoading, setChangeRoleLoading] = useState(false);
    const openNotificationWithIcon = (type, strTitle, strDescription) => {
        api[type]({
            message: strTitle,
            description: strDescription,
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

    const GetRoleList = async () => {
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const strApiURL = `${API_URL}api/Roles/GetAllRole`;
        await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setRoleList(response.data.dataValue);
                }
                else {
                    errorHelper(response);
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setLoading(false);
    }

    const GetPermissionList = async () => {
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const strApiURL = `${API_URL}api/Roles/GetAllPermissions`;
        await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setPermissionList(response.data.dataValue);
                }
                else {
                    errorHelper(response);
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setLoading(false);
    }

    const GetAccountList = async () => {
        setLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + strAccessToken,
            "accept": "*/*",
        };
        const strApiURL = `${API_URL}api/Account/GetListAccount`;
        await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
            .then((response) => {
                if (response.data.isSuccess) {
                    setMemberList(response.data.dataValue);
                }
                else {
                    errorHelper(response);
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
        setLoading(false);
    }

    const onItemSelected = (item, x_nDataType) => {
        if (x_nDataType === 1) {
            setRoleSelectedItem(item);
            if (item.permissions === null || item.permissions === undefined || item.permissions.length === 0) {
                setPermSelectedItem(null);
            }
        }
        else if (x_nDataType === 2) {
            setPermSelectedItem(item);
        }
    }

    const onDeletePermission = (item) => {
        if (m_objRoleSelectedItem && m_objRoleSelectedItem.permissions && m_objPermSelectedItem) {
            const objUpdatePermission = m_objRoleSelectedItem.permissions.map(objGoup => {
                if (objGoup.id === m_objPermSelectedItem.id) {
                    const lstFilteredPermissions = objGoup.permissions.filter(objPermission => objPermission.permissionsId !== item.permissionsId);
                    return lstFilteredPermissions.length > 0 ? { ...objGoup, permissions: lstFilteredPermissions } : null;
                }
                return objGoup;
            }).filter(objGoup => objGoup !== null);
            const objUpdateRole = { ...m_objRoleSelectedItem, permissions: objUpdatePermission };
            if (objUpdateRole && objUpdateRole.permissions) {
                const objPermissionGroup = objUpdateRole.permissions.find(obj => obj.id === m_objPermSelectedItem.id);
                setPermSelectedItem(objPermissionGroup);
            }
            else {
                setPermSelectedItem(null);
            }
            setRoleSelectedItem(objUpdateRole);
            UpdateRole(objUpdateRole, item);
        }
    }

    const UpdateRole = async (x_objRole, x_objDeleteItem, x_lstPermissionId) => {
        if (x_objRole === null || x_objRole === undefined) {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", "Không có dữ liệu chức vụ cần cập nhật.");
            return;
        }

        var lstPermissionId = getAllPermissionsId(x_objRole);
        if (x_lstPermissionId) {
            var arrTotalList = [...lstPermissionId, ...x_lstPermissionId];
            lstPermissionId = arrTotalList;
        }
        const objUpdateRoleData = {
            "id": x_objRole.id,
            "roleName": x_objRole.roleName,
            "permissions": lstPermissionId
        };
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + strAccessToken
        }
        const strApiURL = `${API_URL}api/Roles/UpdateRole`;
        await axios.put(strApiURL, JSON.stringify(objUpdateRoleData), { headers })
            .then((response) => {
                if (response.data.isSuccess === false) {
                    errorHelper(response.data);
                }
                else {
                    if (x_objDeleteItem) {
                        openNotificationWithIcon('success', "Thành Công", `Thực hiện xoá quyền ${x_objDeleteItem.permissionsName} thành công.`);
                    }
                    else if (x_lstPermissionId) {
                        openNotificationWithIcon('success', "Thành Công", `Cập nhật quyền hệ thống thành công.`);
                    }
                    else {
                        openNotificationWithIcon('success', "Thành Công", `Thực hiện đổi tên chức vụ thành công.`);
                    }
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
    }

    const getAllPermissionsId = (x_objRole) => {
        if (x_objRole === null || x_objRole === undefined || x_objRole.permissions === null || x_objRole.permissions === undefined || x_objRole.permissions.length === 0) {
            return [];
        }
        return x_objRole.permissions.flatMap(objGroup => {
            return objGroup.permissions.map(objPermission => objPermission.permissionsId);
        });
    };

    const onChangeRoleName = async (x_strRoleName, x_strOldRoleName) => {
        if (m_objRoleSelectedItem === null || m_objRoleSelectedItem === undefined) {
            openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", "Không có dữ liệu chức vụ cần cập nhật.");
            return;
        }

        if (x_strOldRoleName) {
            var objRoleUpdateData = createNewDataWithRoleName(m_objRoleSelectedItem, x_strRoleName);
            setRoleSelectedItem(objRoleUpdateData);
            await UpdateRole(objRoleUpdateData);
            var lstNewRoleList = updateRoleById(m_lstRoleList, objRoleUpdateData);
            setRoleList(lstNewRoleList);
        }
    }

    function updateRoleById(x_lstRole, x_objNewData) {
        if (x_lstRole) {
            return x_lstRole.map(objRole => {
                if (objRole.id === x_objNewData.id) {
                    return { ...objRole, ...x_objNewData };
                }
                return objRole;
            });
        }
    }

    function createNewDataWithRoleName(originalData, newRoleName) {
        return {
            ...originalData,
            roleName: newRoleName
        };
    }

    const onAdded = (x_nDataType) => {
        if (x_nDataType === 3) {
            setIsShowAddPermissionModal(true);
        }
    }

    const onCancelAdded = () => {
        setIsShowAddPermissionModal(false);
    }

    const onChangePermission = (x_lstPermissionId) => {
        UpdateRole(m_objRoleSelectedItem, null, x_lstPermissionId);
        GetRoleList();
        setIsShowAddPermissionModal(false);
    }

    const onAddRole = async (x_strRoleName) => {
        const objUpdateRoleData = {
            "roleName": x_strRoleName,
            "permissions": []
        };
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + strAccessToken
        }
        const strApiURL = `${API_URL}api/Roles/CreateRole`;
        await axios.post(strApiURL, JSON.stringify(objUpdateRoleData), { headers })
            .then((response) => {
                if (response.data.isSuccess === false) {
                    errorHelper(response.data);
                }
                else {
                    openNotificationWithIcon('success', "Thành Công", `Tạo chức vụ thành công.`);
                    GetRoleList();
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
    }

    const onEvtChangeRole = async(objRoleSelected) =>{
        setChangeRoleLoading(true);
        const strAccessToken = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": 'Bearer ' + strAccessToken
        }
        const requestData = {
            "roleId": objRoleSelected.roleId,
            "memberId": objRoleSelected.memberId,
        };
        const strApiURL = `${API_URL}api/Account/ChangeRoleOfMember`;
        await axios.put(strApiURL, JSON.stringify(requestData), { headers })
            .then((response) => {
                if (response.data.isSuccess === false) {
                    errorHelper(response.data);
                }
                else {
                    openNotificationWithIcon('success', "Thành Công", "Cập nhật chức vụ thành công");
                    GetAccountList();
                }
            })
            .catch((error) => {
                errorHelper(error);
            });
            setChangeRoleLoading(false);
    }

    useEffect(() => {
        GetRoleList();
        GetAccountList();
        GetPermissionList();
    }, []);

    return (
        <div>
            {contextHolder}
            <Helmet>
                <title>Quản Lý Chức Vụ</title>
            </Helmet>
            <div className={'userinfo-main'} style={{ marginLeft: isBroken ? -30 : 15, marginRight: 15, marginBottom: 15, marginTop: 15 }}>
                <div className={'userinfo-container'}>
                    <Card className='dashboard-header'>
                        <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
                            Quản Lý Chức Vụ
                        </Typography>
                    </Card>
                    <AddNewPermission
                        x_lstFullPermissionGroup={m_lstPermissionList}
                        x_objPermissionSelected={m_objPermSelectedItem}
                        x_objRoleSelected={m_objRoleSelectedItem}
                        x_bIsShowModal={m_bIsShowAddPermissionModal}
                        x_bIsBroken={isBroken}
                        x_evtOnOk={onChangePermission}
                        x_evtOnCancel={onCancelAdded}
                    />
                    <Card style={{ marginTop: 10, marginBottom: 10 }} className='h-100'>
                        <Row >
                            <Col span={24} xs={24} xl={24}>
                                <Row>
                                    <Col span={8} xs={24} xl={8}>
                                        <div style={{ marginBottom: isBroken ? 5 : 0, marginRight: isBroken ? 0 : 5 }}>
                                            {
                                                m_bLoading ?
                                                    <Skeleton />
                                                    :
                                                    <PermisstionListView
                                                        className='h-100'
                                                        x_lstData={m_lstRoleList}
                                                        x_bIsLoading={m_bLoading}
                                                        x_nDataType={1}
                                                        onChangeRoleName={onChangeRoleName}
                                                        onItemSelected={onItemSelected}
                                                        onAdded={onAddRole}
                                                        x_bIsBroken={isBroken} />
                                            }
                                        </div>
                                    </Col>
                                    <Col span={8} xs={24} xl={8}>
                                        <div style={{ marginTop: isBroken ? 5 : 0, marginLeft: isBroken ? 0 : 5 }}>
                                            {
                                                m_bLoading ?
                                                    <Skeleton />
                                                    :
                                                    <PermisstionListView
                                                        className='h-100'
                                                        x_lstData={m_objRoleSelectedItem ? m_objRoleSelectedItem.permissions : null}
                                                        x_bIsLoading={m_bLoading}
                                                        x_nDataType={2}
                                                        onItemSelected={onItemSelected}
                                                        x_bIsBroken={isBroken} />
                                            }
                                        </div>
                                    </Col>
                                    <Col span={8} xs={24} xl={8}>
                                        <div style={{ marginTop: isBroken ? 5 : 0, marginLeft: isBroken ? 0 : 5 }}>
                                            {
                                                m_bLoading ?
                                                    <Skeleton />
                                                    :
                                                    <PermisstionListView
                                                        className='h-100'
                                                        x_lstData={m_objPermSelectedItem ? m_objPermSelectedItem.permissions : null}
                                                        x_objSelectRole={m_objRoleSelectedItem}
                                                        x_bIsLoading={m_bLoading}
                                                        x_nDataType={3}
                                                        onDelete={onDeletePermission}
                                                        onAdded={onAdded}
                                                        x_bIsBroken={isBroken} />
                                            }
                                        </div>
                                    </Col>
                                    <Col span={24} xs={24} xl={24}>
                                        <Card style={{ marginTop: 15 }}>
                                            <ChangeRoleMemberList
                                                x_lstMemberList={m_lstMemberList}
                                                x_lstRoleList={m_lstRoleList}
                                                x_bIsBroken={isBroken}
                                                x_bIsToggled={x_bIsToggled}
                                                x_bLoading={m_bLoading}
                                                x_bChangeRoleLoading={m_bChangeRoleLoading}
                                                x_evtOnChangeRole={onEvtChangeRole}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </div>
        </div>
    )
}
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

export default connect(mapStateToProps, mapDispatchToProps)(RolesManagerment);
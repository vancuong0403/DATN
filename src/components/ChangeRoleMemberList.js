import React, { useEffect, useState, useRef } from 'react';
import {
    Image,
    Row,
    Col,
    Tag,
    Input,
    Button,
    Space,
    Table,
    Select,
    Card,
} from "antd";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFloppyDisk
} from "@fortawesome/free-solid-svg-icons";
import { GetFullPath, RemoveVietnameseAccents } from "../Helper/TextHelper";
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';

const ChangeRoleMemberList = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, x_lstRoleList, x_lstMemberList, x_bLoading, x_bChangeRoleLoading, x_bIsBroken, x_bIsToggled, x_evtOnChangeRole }) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setsearchText] = useState(null);
    const [searchedColumn, setsearchedColumn] = useState(null);
    const [m_lstSelectedRole, setSelectedRole] = useState(null);
    const [totalItem, setSetTotalItem] = useState(0);
    const searchInput = useRef(null);
    const { Option } = Select;


    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => { setSelectedKeys(e.target.value ? [e.target.value] : []); }}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button onClick={() => { handleReset(clearFilters); }} size="small" style={{ width: 90 }}>
                        Đặt Lại
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? RemoveVietnameseAccents(record[dataIndex].toString()).toLowerCase().includes(RemoveVietnameseAccents(value.toLowerCase()))
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current.select());
            }
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setsearchText(selectedKeys[0]);
        setsearchedColumn(dataIndex);
    };

    const handleReset = clearFilters => {
        clearFilters();
        setsearchText(null);
    };

    const onChangeSelectedRole = (value, x_strMemberId) => {
        AddRoleId(value, x_strMemberId);
        console.log(m_lstSelectedRole);
    }

    const AddRoleId = (value, x_strMemberId) => {
        if (!m_lstSelectedRole || m_lstSelectedRole.length === 0) {
            setSelectedRole([{ memberId: x_strMemberId, roleId: value }]);
        } else {
            const index = m_lstSelectedRole.findIndex(item => item.memberId === x_strMemberId);
            if (index !== -1) {
                const updatedRoles = [...m_lstSelectedRole];
                updatedRoles[index] = { ...updatedRoles[index], roleId: value };
                setSelectedRole(updatedRoles);
            } else {
                setSelectedRole(prevRoles => [...prevRoles, { memberId: x_strMemberId, roleId: value }]);
            }
        }
    }

    const onClickChangeRole = (x_strMemberId) => {
        if (m_lstSelectedRole) {
            var objRoleSelected = m_lstSelectedRole.find(obj => obj.memberId === x_strMemberId);
            if (x_evtOnChangeRole && objRoleSelected) {
                x_evtOnChangeRole(objRoleSelected);
            }
        }

    }

    const columns = [
        {
            title: "STT",
            dataIndex: "no1",
            key: "no1",
            width: 100,
            render: (value, item, index) => (page - 1) * pageSize + index + 1
        },
        {
            title: "Avatar",
            dataIndex: "avatarPath",
            key: "avatarPath",
            width: 80,
            render: avatarPath => <Image src={GetFullPath(avatarPath, viewtoken)} style={{ width: 40, height: 40, objectFit: "cover" }} />
        },
        {
            title: "MSSV",
            dataIndex: "studentId",
            key: "studentId",
            width: 250,
            ...(x_bIsBroken === false ? getColumnSearchProps("studentId") : x_bIsToggled === false ? getColumnSearchProps("studentId") : {}),
        },
        {
            title: "Họ",
            dataIndex: "firstName",
            key: "firstName",
            ...(x_bIsBroken === false ? getColumnSearchProps("firstName") : x_bIsToggled === false ? getColumnSearchProps("firstName") : {}),
        },
        {
            title: "Tên",
            dataIndex: "lastName",
            key: "lastName",
            width: 50,
            ...(x_bIsBroken === false ? getColumnSearchProps("lastName") : x_bIsToggled === false ? getColumnSearchProps("lastName") : {}),
        },
        {
            title: "Trạng Thái",
            dataIndex: "isLocked",
            key: "isLocked",
            width: 100,
            render: (text, record) => record.isLocked ? <Tag color="#f50">Đã Khoá</Tag> : <Tag color="#108ee9">Hoạt Động</Tag>
        },
        {
            title: "Chức Vụ",
            dataIndex: "role",
            width: 250,
            render: (text, record) =>
                <Select
                    style={{ width: 250 }}
                    showSearch
                    className="text-left"
                    placeholder="Chọn Chức Vụ"
                    disabled={x_bChangeRoleLoading || record.isLocked || permission.permissions.includes(1002) === false}
                    filterOption={
                        (input, option) =>
                            RemoveVietnameseAccents(option.children).toLowerCase().indexOf(RemoveVietnameseAccents(input).toLowerCase()) >= 0
                    }
                    filterSort={
                        (optionA, optionB) =>
                            optionA.value.toLowerCase().localeCompare(optionB.value.toLowerCase())
                    }
                    defaultValue={record.roleId}
                    onChange={(value) => { onChangeSelectedRole(value, record.memberId) }}
                >
                    {x_lstRoleList != null ? x_lstRoleList.map((objRole) => (
                        <Option key={objRole.id} value={objRole.id} >{objRole.roleName}</Option>
                    )) : <Option value="chon">Chọn Chức Vụ</Option>}
                </Select>
        },
        {
            title: "Hành Động",
            dataIndex: "action",
            render: (text, record) =>
                <Row>
                    <Col style={{ padding: 2 }}>
                        <Button
                            disabled={x_bChangeRoleLoading || record.isLocked || permission.permissions.includes(1002) === false}
                            type={"primary"}
                            icon={<FontAwesomeIcon icon={faFloppyDisk} />}
                            onClick={() => { onClickChangeRole(record.memberId) }}
                        >Lưu Chức Vụ</Button>
                    </Col>
                </Row>
        },
    ]

    function pagination(page, pageSize) {
        setPage(page);
        setPageSize(pageSize);
    }

    useEffect(() => {
        const objMapRoleId = [];
        if (x_lstMemberList && x_lstMemberList.length > 0) {
            x_lstMemberList.map((item, index) => {
                var objData = {
                    roleId: item.roleId,
                    memberId: item.memberId
                };
                objMapRoleId.push(objData);
            });
            setSelectedRole(objMapRoleId);
        }
    }, [x_lstMemberList])

    return (
        <div>
            <Card >
                <Row>
                    <Col span={24} xs={24} xl={24} style={{ marginTop: 10 }}>
                        <Table
                            columns={columns}
                            dataSource={x_lstMemberList}
                            scroll={{ x: 400 }}
                            pagination={{
                                onChange: (page, pageSize) => {
                                    pagination(page, pageSize);
                                },
                                current: page,
                                pageSize: pageSize,
                                total: totalItem
                            }} />
                    </Col>
                </Row>
            </Card>
        </div>
    );
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
export default connect(mapStateToProps, mapDispatchToProps)(ChangeRoleMemberList);
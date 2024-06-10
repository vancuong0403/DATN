import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import {
  Image,
  Row,
  Col,
  notification,
  Input,
  Button,
  Space,
  Table,
  Modal,
  Card,
  Tag,
  Result,
  message,
  Form,
  Select,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faChartBar,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  API_URL,
  GetFullPath,
  RemoveVietnameseAccents,
} from "../Helper/TextHelper";
import {
  ACCESS_TOKEN,
  GetCookieData,
  LogOutClearCookie,
} from "../Helper/CookieHelper";
import axios from "axios";
import { login, logout } from "../Redux/actions/actions"; // Import các action creators
// Redux Imports
import { connect } from "react-redux";
import { Typography } from "./StyledTypography";
import moment from "moment-timezone";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Option } from "antd/es/mentions";

const MemberRegisterList = ({
  isLogin,
  fullName,
  avatarPath,
  permission,
  viewtoken,
  isdefaultpasswd,
  logout,
  login,
  isBroken,
  isToggled,
  x_lstMemberList,
  x_strId,
  onRemoveMember,
  x_lstRoomList,
  x_bIsStop,
  x_objEndTime,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setsearchText] = useState(null);
  const [searchedColumn, setsearchedColumn] = useState(null);
  const [m_bDownLoading, setDownLoading] = useState(false);
  const [m_bLoading, setLoading] = useState(false);
  const searchInput = useRef(null);
  const { confirm } = Modal;
  const [api, contextHolder] = notification.useNotification();
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [moveRoom, setMoveRoom] = useState([]);
  const [modalMoveRoom, setModalMoveRoom] = useState(null);
  const [formMoveRoom] = Form.useForm();
  const [moveMemberToRoom, setMoveMemberToRoom] = useState([]);


  useEffect(() => {
    console.log("okoko",x_lstRoomList);
  }, []);
  const openNotificationWithIcon = (type, strTitle, strDescription) => {
    api[type]({
      message: strTitle,
      description: strDescription,
    });
  };

  const errorHelper = async (data) => {
    if (data === null || data === undefined) {
      openNotificationWithIcon(
        "error",
        "Mất kết nối với máy chủ",
        "Không thể kết nối với máy chủ, vui lòng thử lại sau ít phút hoặc báo cáo với BCN."
      );
      logout();
      return;
    }

    if (data.response && data.response.status) {
      if (
        data.response &&
        data.response.status &&
        data.response.status === 401
      ) {
        logout();
        return;
      } else if (
        data.response &&
        data.response.status &&
        data.response.status === 404
      ) {
        logout();
        return;
      } else {
        openNotificationWithIcon(
          "error",
          `Lỗi ${data.response.status}`,
          data.response.error
            ? data.response.error
            : data.response.message
            ? data.response.message
            : "Xuất hiện lỗi không xác định."
        );
        logout();
        return;
      }
    }

    if (data.errorsCode && data.errorsCode === 100002) {
      // refresh token
      window.location.href = window.location.href;
    } else if (data.errorsCode && data.errorsCode === 100004) {
      openNotificationWithIcon(
        "error",
        "Phiên đăng nhập hết hạn",
        "Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại."
      );
      logout();
    } else if (data.errorsCode && data.errorsCode === 200001) {
      openNotificationWithIcon(
        "error",
        "Thông báo hệ thống",
        "Hệ thống đang bảo trì, vui lòng quay lại sau ít phút."
      );
    } else if (
      (data.error &&
        (data.error === "ERR_NETWORK" ||
          data.error === "ERR_CONNECTION_REFUSED")) ||
      (data.name && data.name === "AxiosError")
    ) {
      openNotificationWithIcon(
        "error",
        "Ối dồi ôi, lỗi rồi",
        "Mất kết nối với máy chủ. Vui lòng thử lại sau ít phút"
      );
      logout();
    } else {
      openNotificationWithIcon(
        "error",
        "Ối dồi ôi, lỗi rồi",
        data.errors ? data.errors[0] : "Không xác định được lỗi!"
      );
    }
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    const arr = selectedRows.map(row => row.id);
    console.log(arr);
    const filteredRows = selectedRows.filter(
      (row) => row.interviewInfo?.scores > 0
    );
    const select = selectedRows.filter((row) => row.interviewInfo?.id != null);
    const memberIds = filteredRows.map((row) => row.id);
    const memberIdMoveToRoom = select.map(
      (row) => row.memberInfo.interviewInfo.id
    );
    setMoveMemberToRoom(memberIdMoveToRoom);

    const roomIdMoveToRoom = select.map((row) => row.memberInfo.interviewInfo);
    setSelectedMemberIds(memberIds);
    setMoveRoom(arr)
    console.log(memberIds);
  };

  const rowSelection = {
    onChange: onSelectChange,
  };
  const addMemberToRoom = async (recruitId, roomid) => {
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: "Bearer " + strAccessToken,
    };
    const requestData = {
      roomId: roomid,
      recruitId: recruitId,
      interviewerIds: [],
      isAuto: true,
    };
    const strApiURL = `${API_URL}api/Recruitment/AddInterviewToRoom`;
    await axios
      .post(strApiURL, JSON.stringify(requestData), { headers })
      .then((response) => {
        if (response.data.isSuccess) {
          message.success("Thêm thành viên vào phòng thành công");
        } else {
          errorHelper(response);
        }
      })
      .catch((error) => {
        // errorHelper(error);
      });
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
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
          <Button
            onClick={() => {
              handleReset(clearFilters);
            }}
            size="small"
            style={{ width: 90 }}
          >
            Đặt Lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? RemoveVietnameseAccents(record[dataIndex].toString())
            .toLowerCase()
            .includes(RemoveVietnameseAccents(value.toLowerCase()))
        : "",
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select());
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
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

  const handleReset = (clearFilters) => {
    clearFilters();
    setsearchText(null);
  };

  const GetStatus = (record) => {
    if (record.approvalInfo) {
      // Đã xác nhận
      return <Tag color="#108ee9">Đã Phê Duyệt</Tag>;
    } else if (record.interviewInfo) {
      if (record.interviewInfo.interviewed) {
        // Đã Phỏng vấn
        return <Tag color="#2db7f5">Đã Phỏng Vấn</Tag>;
      } else if (record.interviewInfo.emailSent) {
        // Đã Gửi email
        return <Tag color="#87d068">Đã Gửi Email</Tag>;
      } else {
        // Không xác định
        return <Tag color="#f50">Chưa Xác Định</Tag>;
      }
    } else {
      // Không Xác Định
      return <Tag color="#f50">Chưa Xác Định</Tag>;
    }
  };

  const DeleteConfirm = (x_strMemberId, x_strMemberFullName) => {
    confirm({
      title: "Xoá Thành Viên",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          Việc xoá sẽ dẫn đến không khôi phục được dữ liệu. Bạn có chắc chắn
          muốn xoá hồ sơ <b style={{ color: "red" }}>{x_strMemberFullName}</b>{" "}
          khỏi hệ thống?
        </span>
      ),
      okText: "Đồng Ý",
      cancelText: "Huỷ",
      onOk() {
        DeleteMemberById(x_strMemberId, x_strMemberFullName);
      },
    });
  };

  const DeleteMemberById = async (x_strMemberId, x_strMemberFullName) => {
    setLoading(true);
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + strAccessToken,
      accept: "*/*",
    };
    const param = {
      x_strMemberId: x_strMemberId,
      x_strRecruitmentId: x_strId,
    };
    const strApiURL = `${API_URL}api/Recruitment/DeleteApplyingForMemberInfo`;
    await axios
      .delete(strApiURL, {
        withCredentials: true,
        params: param,
        headers: headers,
        credentials: "same-origin",
      })
      .then((response) => {
        if (response.data.isSuccess) {
          if (onRemoveMember) {
            onRemoveMember(x_strMemberId);
          }
          var strMess =
            "Xoá hồ sơ ứng viên " + x_strMemberFullName + " thành công";
          openNotificationWithIcon("success", "Xoá Thành Công", strMess);
        } else {
          errorHelper(response);
        }
      })
      .catch((error) => {
        errorHelper(error);
      });
    setLoading(false);
  };

  const IsShowDeletionButton = (isStop, endTime) => {
    if (isStop || moment(endTime).isSameOrBefore(moment())) {
      return true;
    }
    return false;
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "no1",
      key: "no1",
      width: 50,
      render: (value, item, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Ngày Đăng Ký",
      dataIndex: "regisDate",
      key: "regisDate",
      width: 150,
      render: (regisDate) => (
        <span>{moment(regisDate).format("DD/MM/yyyy HH:mm")}</span>
      ),
    },
    {
      title: "MSSV",
      dataIndex: "studentId",
      key: "studentId",
      width: 140,
      ...(isBroken === false
        ? getColumnSearchProps("studentId")
        : isToggled === false
        ? getColumnSearchProps("studentId")
        : {}),
    },
    {
      title: "Họ",
      dataIndex: "firstName",
      key: "firstName",
      ...(isBroken === false
        ? getColumnSearchProps("firstName")
        : isToggled === false
        ? getColumnSearchProps("firstName")
        : {}),
    },
    {
      title: "Tên",
      dataIndex: "lastName",
      key: "lastName",
      ...(isBroken === false
        ? getColumnSearchProps("lastName")
        : isToggled === false
        ? getColumnSearchProps("lastName")
        : {}),
    },
    {
      title: "Giới Tính",
      dataIndex: "sex",
      key: "sex",
      render: (sex) => <span>{sex}</span>,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      render: (text, record) => <div>{GetStatus(record)}</div>,
    },
    {
      title: "Hành Động",
      dataIndex: "action",
      render: (text, record) => (
        <Row>
          {permission.permissions.includes(2017) ? (
            <Col style={{ padding: 2 }}>
              <Button
                disabled={m_bLoading}
                onClick={() => {
                  DeleteConfirm(
                    record.id,
                    `${record.firstName} ${record.lastName}`
                  );
                }}
                type={"primary"}
                title="Xoá"
                icon={<FontAwesomeIcon icon={faTrash} />}
                danger
              />
            </Col>
          ) : null}
        </Row>
      ),
    },
  ];

  const DownloadMemberList = async () => {
    setDownLoading(true);
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + strAccessToken,
      accept: "*/*",
    };
    const param = {
      x_strRecruitmentId: x_strId,
    };
    const strApiURL = `${API_URL}api/Recruitment/DownloadApplyingForMembers`;
    await axios
      .get(strApiURL, {
        withCredentials: true,
        params: param,
        headers: headers,
        credentials: "same-origin",
      })
      .then((response) => {
        if (response.data.isSuccess) {
          var filePath = GetFullPath(response.data.filePath, viewtoken);
          window.open(filePath, "_blank");
        } else {
          errorHelper(response);
        }
      })
      .catch((error) => {
        // errorHelper(error);
      });
    setDownLoading(false);
  };

  const sendMailPass = async () => {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };

      const sendMail = {
        membersId: selectedMemberIds,
        recruitId: x_strId,
        isAddMessaggeUrl: false,
        messaggeUrl: "string",
      };
      console.log(JSON.stringify(sendMail));
      await axios
        .post(
          API_URL + "api/Recruitment/MemberApproval",
          JSON.stringify(sendMail),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            message.success("Quá trình gửi mail bắt đầu");
          } else {
            if (response.data.errors[0].indexOf("(401)") >= 0) {
              LogOutClearCookie();
            }
            message.error(response.data.errors);
          }
        })
        .catch((response) => {
          if (response.toString().indexOf(401) >= 0) {
            LogOutClearCookie();
            message.error("Phiên đăng nhập đã hết hạn");
          } else {
            message.error("Mất kết nối máy chủ");
          }
        });
    }
  };
  const addRoomInterView = async () => {};

  function pagination(page, pageSize) {
    setPage(page);
    setPageSize(pageSize);
  }

  return (
    <div>
      {contextHolder}
      <Row>
        <Col span={24} xl={24} xs={24}>
          <Typography variant="body1" fontWeight={600} color="#0098e5">
            Danh Sách Ứng Viên
          </Typography>
        </Col>
        <Col span={24} xl={24} xs={24}>
          <Card style={{ marginTop: 15 }}>
            {x_lstMemberList ? (
              <Row>
                <Col span={24} xl={24} xs={24}>
                  <Row gutter={[16, 16]} justify="start">
                    <Col span={9} xs={0} xl={9}></Col>
                    <Col span={3} xs={0} xl={3}>
                      <Button
                        block
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        type={"primary"}
                        onClick={() => {
                          setModalMoveRoom(true);
                        }}
                        disabled={moveRoom==null}
                        loading={m_bDownLoading}
                      >
                        Thêm vào phòng
                      </Button>
                    </Col>
                    <Col span={3} xs={0} xl={3}>
                      <Button
                        block
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        type={"primary"}
                        onClick={() => {
                          sendMailPass();
                        }}
                        disabled={selectedMemberIds==null}
                        loading={m_bDownLoading}
                      >
                        Gửi mail đậu
                      </Button>
                    </Col>
                    <Col span={3} xs={24} xl={3}>
                      <Button
                        block
                        icon={<FontAwesomeIcon icon={faDownload} />}
                        type={"primary"}
                        onClick={DownloadMemberList}
                        loading={m_bDownLoading}
                      >
                        Tải Xuống
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col span={24} xl={24} xs={24}>
                  <Table
                    style={{ marginTop: 15 }}
                    columns={columns}
                    rowSelection={{
                      type: "checkbox",
                      ...rowSelection,
                    }}
                    rowKey="id"
                    dataSource={x_lstMemberList}
                    scroll={{ x: 400 }}
                    pagination={{
                      onChange: (page, pageSize) => {
                        pagination(page, pageSize);
                      },
                      current: page,
                      pageSize: pageSize,
                      total: x_lstMemberList.length,
                    }}
                  />
                </Col>
              </Row>
            ) : (
              <Result
                status="404"
                title="Rỗng!"
                subTitle="Không tìm thấy ứng viên nào."
              />
            )}
          </Card>
        </Col>
      </Row>
      <Modal
            visible={modalMoveRoom}
            centered
            onCancel={() => setModalMoveRoom(false)}
            title={"Thêm vào phòng"}
            footer={[
              <Button
                key="back"
                onClick={() => setModalMoveRoom(false)} // Corrected
              >
                Quay lại
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={() => moveRoom(true)} // Corrected
              >
                Chuyển phòng
              </Button>,
            ]}
          >
            <Form form={formMoveRoom}>
              <Form.Item name="destroom" style={{ textAlign: "left" }}>
                <Select
                  showSearch
                  className="text-left"
                  placeholder="Chọn phòng"
                >
                  {x_lstRoomList != null ? (
                    x_lstRoomList.map((room) => {
                        <Option key={room.id} value={room.id}>
                          {room.roomName}
                        </Option>
                    })
                  ) : (
                    <Option value="chon">Chọn Phòng</Option>
                  )}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
    </div>
  );
};
const mapStateToProps = (state) => ({
  isLogin: state.isLogin,
  fullName: state.fullName,
  avatarPath: state.avatarPath,
  permission: state.permission,
  viewtoken: state.viewtoken,
  isdefaultpasswd: state.isdefaultpasswd,
});
const mapDispatchToProps = {
  login,
  logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(MemberRegisterList);

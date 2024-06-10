import React, { useEffect, useState, useRef } from "react";
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
  Form,
  DatePicker,
  Switch,
  message,
  Select,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Highlighter from "react-highlight-words";
import { connect } from "react-redux";
import { Typography } from "./StyledTypography";
import moment from "moment-timezone";
import {
  faArrowAltCircleRight,
  faEdit,
  faEye,
  faMailBulk,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Option } from "antd/es/mentions";
const { RangePicker } = DatePicker;

const InterviewGroup = ({
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
  x_lstRoomList,
  onRemoveGroup,
  onAddGroup,
  onChange,
  x_strId,
  x_bIsStop,
  x_objEndTime,
}) => {
  const [page, setPage] = useState(1);
  const [isViewMemberActivity, setIsViewMemberActivity] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setsearchText] = useState(null);
  const [searchedColumn, setsearchedColumn] = useState(null);
  const [m_bDownLoading, setDownLoading] = useState(false);
  const [m_bLoading, setLoading] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const searchInput = useRef(null);
  const [formCreateRoom] = Form.useForm();
  const [formScore] = Form.useForm();
  const [formMoveRoom] = Form.useForm();
  const [registing, setRegisting] = useState(false);
  const [isOnl, setIsOnl] = useState(false);
  const { confirm } = Modal;
  const [api, contextHolder] = notification.useNotification();
  const [checkInList, setCheckInList] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [roomID, setRoomID] = useState(null);
  const [recruitId, setRecruitID] = useState(null);
  const [modalScore, setModalScore] = useState(false);
  const [memberId, setMemberID] = useState(null);
  const [modalMoveRoom, setModalMoveRoom] = useState(null);

  const openNotificationWithIcon = (type, strTitle, strDescription) => {
    api[type]({
      message: strTitle,
      description: strDescription,
    });
  };

  const getMemberInRoom = async (id, recruitId) => {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const config = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      const checkin = {
        x_strRecruitmentId: recruitId,
      };
      axios
        .get(API_URL + "api/Recruitment/GetRoomByRecruitmentId", {
          params: checkin,
          headers: config,
        })
        .then((response) => {
          if (response.data.isSuccess) {
            const list = [];
            response.data.dataValue.forEach((item) => {
              if (item.id === id) {
                item.members.forEach((item2) => {
                  list.push(item2);
                });
              }
            });
            setCheckInList(list);
            console.log(list);
          } else {
            if (response.data.errors[0].indexOf("(401)") >= 0) {
              LogOutClearCookie();
            }
            message.error(response.data.errors);
          }
        })
        .catch((response) => {
          if (response.toString().indexOf(401) >= 0) {
            LogOutClearCookie()();
            message.error("Phiên đăng nhập đã hết hạn");
          } else {
            message.error("Mất kết nối máy chủ");
          }
        });
    }
  };

  const handleOnl = (checked) => {
    // Thiết lập trạng thái mới khi nút được bấm
    setIsOnl(checked);
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

  const columns = [
    {
      title: "STT",
      dataIndex: "no1",
      key: "no1",
      width: 50,
      render: (value, item, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Tên Phòng",
      dataIndex: "roomName",
      key: "roomName",
      width: 150,
      render: (roomName) => <span>{roomName}</span>,
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createDate",
      key: "createDate",
      width: 150,
      render: (createDate) => (
        <span>{moment(createDate).format("DD/MM/yyyy HH:mm")}</span>
      ),
    },
    {
      title: "Ngày Bắt Đầu",
      dataIndex: "startDateTime",
      key: "startDateTime",
      width: 140,
      render: (startDateTime) => (
        <span>{moment(startDateTime).format("DD/MM/yyyy HH:mm")}</span>
      ),
    },
    {
      title: "Ngày Kết Thúc",
      dataIndex: "endDateTime",
      key: "endDateTime",
      render: (endDateTime) => (
        <span>{moment(endDateTime).format("DD/MM/yyyy HH:mm")}</span>
      ),
    },
    {
      title: "Chủ Phòng",
      dataIndex: "managers",
      key: "managers",
      render: (text, record) => (
        <span>
          {record.managers.map((manager) => manager.fullName).join(", ")}
        </span>
      ),
    },
    {
      title: "Hình thức",
      dataIndex: "isOnline",
      key: "isOnline",
      render: (text, record) => (
        <span>{record.isOnline ? "Phòng online" : "Trực tiếp"}</span>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "roomAddress",
      key: "isOnline",
      render: (text, record) => (
        <span>
          {record.isOnline ? (
            <a
              href={record.googleMeetRoom?.hangoutLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {record.googleMeetRoom?.hangoutLink}
            </a>
          ) : (
            record.roomAddress
          )}
        </span>
      ),
    },
    {
      title: "Hành Động",
      dataIndex: "action",
      render: (text, record) => (
        <Row>
          <Col style={{ padding: 2 }}>
            <Button
              disabled={m_bLoading}
              type={"primary"}
              title="Thông tin phòng"
              onClick={() => {
                setIsViewMemberActivity(true);
                setRoomID(record.id);
                setRecruitID(record.recruitId);
                getMemberInRoom(record.id, record.recruitId);
              }}
              icon={<FontAwesomeIcon icon={faEye} />}
            />
            <Button
              style={{ padding: 2 }}
              disabled={m_bLoading}
              onClick={() => {
                DeleteConfirm(record.id, record.recruitId);
              }}
              type={"primary"}
              title="Xoá"
              icon={<FontAwesomeIcon icon={faTrash} />}
              danger
            />
            <Button
              disabled={m_bLoading}
              type={"primary"}
              title="Thêm vào phòng"
              onClick={() => {
                addMemberToRoom(record.recruitId, record.id);
              }}
              icon={<FontAwesomeIcon icon={faPlus} />}
            />
            <Button
              disabled={m_bLoading}
              type={"primary"}
              title="Gửi mail phỏng vấn"
              onClick={() => {
                sendMailInterview(record.recruitId, record.id);
              }}
              icon={<FontAwesomeIcon icon={faMailBulk} />}
            />
          </Col>
        </Row>
      ),
    },
  ];

  function pagination(page, pageSize) {
    setPage(page);
    setPageSize(pageSize);
  }

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
  const DeleteConfirm = (x_strRoomId, recruitId) => {
    confirm({
      title: "Xoá Phòng",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          Việc xoá sẽ dẫn đến không khôi phục được dữ liệu. Bạn có chắc chắn
          muốn xoá phòng này khỏi hệ thống?
        </span>
      ),
      okText: "Đồng Ý",
      cancelText: "Huỷ",
      onOk() {
        onDeleteInterviewGroup(x_strRoomId, recruitId);
      },
    });
  };

  const onDeleteInterviewGroup = async (x_strRoomId, recruitId) => {
    setLoading(true);
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + strAccessToken,
      accept: "*/*",
    };
    const param = {
      x_strRoomId: x_strRoomId,
      x_strRecruitmentId: recruitId,
    };
    const strApiURL = `${API_URL}api/Recruitment/DeleteInterviewRoom`;
    await axios
      .delete(strApiURL, {
        withCredentials: true,
        params: param,
        headers: headers,
        credentials: "same-origin",
      })
      .then((response) => {
        if (response.data.isSuccess) {
          if (onRemoveGroup) {
            onRemoveGroup(x_strRoomId);
          }
          var strMess =
            // "Xoá hồ sơ ứng viên " + x_strMemberFullName + " thành công";
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
  function openAddRoom() {
    setShowAddRoom(true);
  }

  function onChangeMember() {
    setRegisting(true);
    const token = GetCookieData(ACCESS_TOKEN);
    var roomName = formCreateRoom.getFieldValue("roomName");
    var roomAddress = formCreateRoom.getFieldValue("roomAddress");
    var note = formCreateRoom.getFieldValue("note");
    var createTime = formCreateRoom.getFieldValue("createTime");
    var breakTimes = formCreateRoom.getFieldValue("breakTimes");
    var ratedTime = formCreateRoom.getFieldValue("ratedTime");
    var isOnl = formCreateRoom.getFieldValue("isOnline");
    var noteBreak = formCreateRoom.getFieldValue("noteBreak");
    var isValid = true;
    if (roomName === undefined || roomName.replace(/ /g, "") === "") {
      formCreateRoom.setFields([
        {
          name: "roomName",
          errors: ["Vui lòng nhập tên phòng"],
        },
      ]);
      isValid = false;
    }

    if (roomAddress === undefined || roomAddress.replace(/ /g, "") === "") {
      formCreateRoom.setFields([
        {
          name: "roomAddress",
          errors: ["Vui lòng nhập địa chỉ phòng"],
        },
      ]);
      isValid = false;
    }

    if (note === undefined || note.replace(/ /g, "") === "") {
      formCreateRoom.setFields([
        {
          name: "note",
          errors: ["Vui lòng nhập ghi chú"],
        },
      ]);
      isValid = false;
    }

    if (createTime === null || createTime === undefined) {
      isValid = false;
      formCreateRoom.setFields([
        {
          name: "createTime",
          errors: ["Vui lòng nhập thời gian diễn ra!"],
        },
      ]);
    }

    if (breakTimes === null || breakTimes === undefined) {
      isValid = false;
      formCreateRoom.setFields([
        {
          name: "breakTimes",
          errors: ["Vui lòng nhập thời gian nghỉ"],
        },
      ]);
    }

    if (ratedTime === undefined || ratedTime.replace(/ /g, "") === "") {
      isValid = false;
      formCreateRoom.setFields([
        {
          name: "ratedTime",
          errors: ["Vui lòng nhập thời gian phỏng vấn"],
        },
      ]);
    }

    var errorList = formCreateRoom.getFieldsError();
    errorList.forEach((error) => {
      if (error.errors.length > 0) {
        isValid = false;
      }
    });
    if (token && isValid) {
      const startTime = moment(createTime[0].toISOString()).format(
        "DD/MM/YYYY HH:mm"
      );
      const endTime = moment(createTime[1].toISOString()).format(
        "DD/MM/YYYY HH:mm"
      );
      const breakTimesE = moment(createTime[1].toISOString()).format(
        "DD/MM/YYYY HH:mm"
      );
      const breakTimesS = moment(breakTimes[0].toISOString()).format(
        "DD/MM/YYYY HH:mm"
      );
      const param = {
        recruitId: x_strId,
        roomName: roomName,
        roomAddress: roomAddress,
        note: note,
        startDateTime: startTime,
        endDateTime: endTime,
        breakTimes: [
          {
            startDateTime: breakTimesS,
            endDateTime: breakTimesE,
            note: noteBreak,
          },
        ],
        managerIds: [],
        ratedTime: ratedTime,
        isOnline: isOnl,
      };
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      console.log(JSON.stringify(param));
      axios
        .post(
          API_URL + "api/Recruitment/CreateInterviewRoom",
          JSON.stringify(param),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            message.success("Tạo phòng thành công.");
            if (onAddGroup) {
              onAddGroup();
            }
          } else {
            message.error(response.data.errors);
          }
          setRegisting(false);
        })
        .catch((response) => {
          message.error("Mất kết nối với máy chủ");
          setRegisting(false);
        });
    } else {
      setRegisting(false);
    }
  }

  const sendMailInterview = async (recruitId, x_strRoomId) => {
    setLoading(true);
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + strAccessToken,
      accept: "*/*",
    };
    const param = {
      x_strRoomId: x_strRoomId,
      x_strRecruitmentId: recruitId,
    };
    const strApiURL = `${API_URL}api/Recruitment/SendEmailInterview`;
    await axios
      .get(strApiURL, {
        withCredentials: true,
        params: param,
        headers: headers,
        credentials: "same-origin",
      })
      .then((response) => {
        if (response.data.isSuccess) {
          openNotificationWithIcon(
            "success",
            "Xoá Thành Công",
            "Gửi mail phỏng vấn thành công"
          );
        } else {
          errorHelper(response);
        }
      })
      .catch((error) => {
        errorHelper(error);
      });
    setLoading(false);
  };

  const UpdateInterview = async () => {
    setLoading(true);
    const strAccessToken = GetCookieData(ACCESS_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + strAccessToken,
      accept: "*/*",
    };
    const reviewcontent = formScore.getFieldValue("reviewContent");
    const scorces = formScore.getFieldValue("scorces");
    var isValid = true;
    if (reviewcontent === undefined || reviewcontent.replace(/ /g, "") === "") {
      formCreateRoom.setFields([
        {
          name: "reviewcontent",
          errors: ["Vui lòng nhập nhận xét"],
        },
      ]);
      isValid = false;
    }
    if (strAccessToken && isValid) {
      const param = {
        memberId: memberId,
        roomId: roomID,
        recruitId: recruitId,
        reviewContent: reviewcontent,
        note: reviewcontent,
        scorces: scorces,
      };
      console.log(JSON.stringify(param));
      const strApiURL = `${API_URL}api/Recruitment/UpdateReview`;
      await axios
        .put(strApiURL, JSON.stringify(param), { headers })
        .then((response) => {
          if (response.data.isSuccess) {
            openNotificationWithIcon(
              "success",
              "Cập nhật thành công",
              "Chấm điểm thành công"
            );
            if (onChange) {
              onChange(recruitId);
            }
            setModalScore(false);
            getMemberInRoom(roomID, recruitId);
          } else {
            errorHelper(response);
          }
        })
        .catch((error) => {
          errorHelper(error);
        });
    }

    setLoading(false);
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    const filteredRows = selectedRows.filter(
      (row) => row.memberInfo.interviewInfo?.scores > 0
    );
    const memberIds = filteredRows.map((row) => row.memberInfo.id);
    setSelectedMemberIds(memberIds);
    console.log(memberIds);
  };

  const rowSelection = {
    onChange: onSelectChange,
  };

  const listCheckInCol = [
    {
      title: "STT",
      dataIndex: "no1",
      key: "no1",
      width: 80,
      render: (value, item, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: "Họ",
      dataIndex: "ho",
      render: (text, record) => <span>{record.memberInfo.firstName}</span>,
    },
    {
      title: "Tên",
      dataIndex: "ten",
      render: (text, record) => <span>{record.memberInfo.lastName}</span>,
    },
    {
      title: "MSSV",
      dataIndex: "mssv",
      render: (text, record) => <span>{record.memberInfo.studentId}</span>,
    },
    {
      title: "Lớp",
      dataIndex: "lop",
      render: (text, record) => <span>{record.memberInfo.className}</span>,
    },
    {
      title: "Điểm",
      dataIndex: "scores",
      render: (text, record) => (
        <span>
          {record.memberInfo.interviewInfo
            ? record.memberInfo.interviewInfo.scores
            : "Chưa có điểm"}
        </span>
      ),
    },
    {
      title: "Hành Động",
      dataIndex: "id",
      key: "id",
      render: (text, record) => (
        <Row>
          {
            <Col style={{ padding: 2 }}>
              <Button
                disabled={record.sendEmailState != 3}
                onClick={() => {
                  setModalScore(true);
                  setMemberID(record.memberInfo.id);
                }}
                type={"primary"}
                icon={<FontAwesomeIcon icon={faEdit} />}
              />
            </Col>
          }
          <Col style={{ padding: 2 }}>
            <Button
              disabled={record.sendEmailState != 3}
              type={"primary"}
              onClick={() => {
                confirmDelete(record.memberInfo.id);
              }}
              icon={<FontAwesomeIcon icon={faTrash} />}
              danger
            />
          </Col>
          <Col style={{ padding: 2 }}>
            <Button
              disabled={record.sendEmailState == 3}
              type={"primary"}
              onClick={() => {
                setModalMoveRoom(true);
                setMemberID(record.memberInfo.id);
              }}
              icon={<FontAwesomeIcon icon={faArrowAltCircleRight} />}
              danger
            />
          </Col>
        </Row>
      ),
    },
  ];

  function confirmDelete(id) {
    Modal.confirm({
      title: "Xoá!",
      icon: <ExclamationCircleOutlined />,
      content:
        "Việc xoá của bạn sẽ không khôi phục lại được. Bạn có chắc chắn muốn xoá?",
      okText: "Xoá",
      cancelText: "Huỷ Bỏ",
      onOk: () => {
        deleteMemberInRoom(id);
      },
    });
  }

  const deleteMemberInRoom = async (id) => {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const config = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      const param = {
        x_strMemberId: id,
        x_strRoomId: roomID,
        x_strRecruitmentId: recruitId,
      };
      axios
        .delete(API_URL + "api/Recruitment/RemoveInterviewFromRoom", {
          params: param,
          headers: config,
        })
        .then((response) => {
          if (response.data.isSuccess) {
            message.success("Xoá thành viên khỏi phòng thành công");
            var checkListRemove = [];
            checkInList.forEach((item) => {
              if (item.memberInfo.id !== id) {
                checkListRemove.push(item);
              }
            });
            setCheckInList(checkListRemove);
          } else {
            if (response.data.errors[0].indexOf("(401)") >= 0) {
              LogOutClearCookie();
            }
            message.error(response.data.errors);
          }
        })
        .catch((response) => {
          if (response.toString().indexOf(401) >= 0) {
            LogOutClearCookie()();
            message.error("Phiên đăng nhập đã hết hạn");
          } else {
            message.error("Mất kết nối máy chủ");
          }
        });
    }
  };

  const moveRoom = async () => {
    const destRoom = formMoveRoom.getFieldValue("destroom");
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      const requestData = {
        memberId: memberId,
        sourceRoomId: roomID,
        destRoomId: destRoom,
        recruitId: recruitId,
      };
      await axios
        .post(
          API_URL + "api/Recruitment/MoveInterview",
          JSON.stringify(requestData),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            message.success(`Chuyển thành công`);
            setModalMoveRoom(false);
            setIsViewMemberActivity(false);
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
  const selectStyles = {
    dropdownStyle: {
      pointerEvents: "none",
    },
  };

  function disabledDate(current) {
    // Can not select days before today and today
    return current && current < moment().endOf("day");
  }

  return (
    <div>
      {contextHolder}
      <Row>
        <Col span={24} xl={24} xs={24}>
          <Typography variant="body1" fontWeight={600} color="#0098e5">
            Phòng Phỏng Vấn
          </Typography>
        </Col>
        <Col span={24} xl={24} xs={24}>
          <Card style={{ marginTop: 15 }}>
            {x_lstRoomList ? (
              <Row>
                <Col span={24} xl={24} xs={24}>
                  <Row justify="start">
                    <Col span={6} xs={0} xl={6}></Col>
                    <Col span={6} xs={0} xl={6}></Col>
                    <Col span={6} xs={0} xl={6}></Col>
                    <Col span={6} xs={24} xl={6}>
                      <Button
                        block
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        type={"primary"}
                        onClick={() => {
                          openAddRoom();
                        }}
                        loading={m_bDownLoading}
                      >
                        Tạo Phòng
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col span={24} xl={24} xs={24}>
                  <Table
                    style={{ marginTop: 15 }}
                    columns={columns}
                    dataSource={x_lstRoomList}
                    scroll={{ x: 400 }}
                    pagination={{
                      onChange: (page, pageSize) => {
                        pagination(page, pageSize);
                      },
                      current: page,
                      pageSize: pageSize,
                      total: x_lstRoomList.length,
                    }}
                  />
                </Col>
              </Row>
            ) : (
              <Row>
                <Col span={24} xl={24} xs={24}>
                  <Row justify="start">
                    <Col span={6} xs={0} xl={6}></Col>
                    <Col span={6} xs={0} xl={6}></Col>
                    <Col span={6} xs={0} xl={6}></Col>
                    <Col span={6} xs={24} xl={6}>
                      <Button
                        block
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        type={"primary"}
                        onClick={() => {
                          openAddRoom();
                        }}
                        loading={m_bDownLoading}
                      >
                        Tạo Phòng
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col span={24} xl={24} xs={24}>
                  <Result
                    status="404"
                    title="Rỗng!"
                    subTitle="Không tìm thấy phòng nào."
                  />
                </Col>
              </Row>
            )}
          </Card>
          <Modal
            title={"Thành Viên Của Phòng"}
            centered
            visible={isViewMemberActivity}
            onCancel={() => setIsViewMemberActivity(false)}
            footer={[
              <Button
                type="primary"
                onClick={() => setIsViewMemberActivity(false)}
              >
                Đóng
              </Button>,
            ]}
            width={1000}
          >
            <Table
              rowSelection={{
                type: "checkbox",
                ...rowSelection,
              }}
              rowKey="id"
              columns={listCheckInCol}
              dataSource={checkInList}
              pagination={{ hideOnSinglePage: true }}
              scroll={{ y: 1000, x: 800 }}
            />
          </Modal>

          <Modal
            visible={modalScore}
            centered
            onCancel={() => setModalScore(false)}
            title={"Chấm điểm phỏng vấn"}
            footer={[
              <Button
                key="back"
                onClick={() => setModalScore(false)} // Corrected
              >
                Quay lại
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={() => UpdateInterview()} // Corrected
              >
                Chấm điểm
              </Button>,
            ]}
          >
            <Form form={formScore}>
              <Form.Item
                name="reviewContent"
                label="Nhận xét:"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập nhận xét!",
                  },
                ]}
              >
                <Input placeholder="Nhập nhận xét" maxLength={100} />
              </Form.Item>
              <Form.Item
                name="scorces"
                label="Điểm:"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập điểm!",
                  },
                  {
                    type: "number",
                    min: 1,
                    max: 10,
                    message: "Nhận điểm là số từ 1 đến 10!",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Nhập điểm"
                  min={1}
                  max={10}
                  onKeyDown={(e) => {
                    if (
                      (e.key !== "Backspace" &&
                        e.key !== "Tab" &&
                        (e.key < "0" || e.key > "9")) ||
                      (e.target.value.length >= 2 && e.key !== "Backspace")
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            visible={modalMoveRoom}
            centered
            onCancel={() => setModalMoveRoom(false)}
            title={"Chuyển phòng phỏng vấn"}
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
                  style={{ selectStyles }}
                >
                  {x_lstRoomList != null ? (
                    x_lstRoomList.map((room) => {
                      if (room.id === roomID) {
                        return null;
                      }
                      return (
                        <Option key={room.id} value={room.id}>
                          {room.roomName}
                        </Option>
                      );
                    })
                  ) : (
                    <Option value="chon">Chọn Phòng</Option>
                  )}
                </Select>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            visible={showAddRoom}
            onOk={null}
            onCancel={() => setShowAddRoom(false)}
            centered
            title={"Tạo phòng"}
            footer={[
              <Button
                disabled={registing}
                key="back"
                onClick={() => setShowAddRoom(false)}
              >
                Đóng
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={registing}
                onClick={() => onChangeMember()}
              >
                Tạo
              </Button>,
            ]}
            width={1000}
          >
            <Form form={formCreateRoom}>
              <Row>
                <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                  <Form.Item
                    name="roomName"
                    label="Tên phòng:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên phòng!",
                      },
                    ]}
                  >
                    <Input
                      disabled={registing}
                      placeholder="Nhập tên phòng"
                      maxLength={30}
                    />
                  </Form.Item>
                </Col>
                <Col
                  span={12}
                  className={"col-md-5 col-md-offset-2"}
                  xs={24}
                  xl={12}
                >
                  <Form.Item
                    name="roomAddress"
                    label="Địa chỉ:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ!",
                      },
                    ]}
                  >
                    <Input
                      disabled={registing}
                      placeholder="Nhập Địa Chỉ"
                      maxLength={30}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                  <Form.Item
                    name="note"
                    label="Ghi chú:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập ghi chú!",
                      },
                    ]}
                  >
                    <Input
                      disabled={registing}
                      placeholder="Nhập ghi chú"
                      maxLength={15}
                    />
                  </Form.Item>
                </Col>
                <Col
                  span={12}
                  className={"col-md-5 col-md-offset-2"}
                  xs={24}
                  xl={12}
                >
                  <Form.Item
                    name="createTime"
                    label="Thời gian:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập thời gian!",
                      },
                    ]}
                    style={{ textAlign: "left" }}
                  >
                    <RangePicker
                      showTime={{
                        format: "HH:mm",
                      }}
                      format="YYYY-MM-DD HH:mm"
                      style={{
                        width: "100%",
                      }}
                      disabledDate={disabledDate}
                      disabled={registing}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                  <Form.Item
                    label="Thời gian nghỉ:"
                    name="breakTimes"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập thời gian nghỉ!",
                      },
                    ]}
                    style={{ textAlign: "left" }}
                  >
                    <RangePicker
                      showTime={{
                        format: "HH:mm",
                      }}
                      format="YYYY-MM-DD HH:mm"
                      style={{
                        width: "100%",
                      }}
                      disabledDate={disabledDate}
                      disabled={registing}
                    />
                  </Form.Item>
                </Col>
                <Col
                  span={12}
                  className={"col-md-5 col-md-offset-2"}
                  xs={24}
                  xl={12}
                >
                  {/* Mã lớp */}
                  <Form.Item
                    name="noteBreak"
                    label="Ghi chú thời gian nghỉ:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập Ghi chú thời gian nghỉ",
                      },
                    ]}
                  >
                    <Input
                      disabled={registing}
                      placeholder="Nhập Ghi chú thời gian nghỉ"
                      maxLength={15}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col
                  span={12}
                  className={"col-md-5 col-md-offset-2"}
                  xs={24}
                  xl={12}
                >
                  {/* Mã lớp */}
                  <Form.Item
                    name="isOnline"
                    label="Phòng Online:"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Online"
                      unCheckedChildren="Trực tiếp"
                      checked={isOnl} // Set giá trị mặc định
                      onChange={handleOnl}
                    />
                  </Form.Item>
                </Col>
                <Col
                  span={12}
                  className={"col-md-5 col-md-offset-2"}
                  xs={24}
                  xl={12}
                >
                  {/* Mã lớp */}
                  <Form.Item
                    name="ratedTime"
                    label="Thời gian phỏng vấn:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập thời gian phỏng vấn!",
                      },
                    ]}
                  >
                    <Input
                      disabled={registing}
                      placeholder="Nhập thời gian phỏng vấn"
                      maxLength={15}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </Col>
      </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(InterviewGroup);

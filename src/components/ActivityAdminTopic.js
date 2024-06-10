import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Image,
  message,
  DatePicker,
  Row,
  Col,
  Input,
  InputNumber,
  Form,
  Button,
  Checkbox,
  Modal,
  Upload,
  Skeleton,
  Select,
  Switch,
  Result,
  Space,
  Tag,
  Tabs,
} from "antd";
import axios from "axios";
import Highlighter from "react-highlight-words";
import { ImageResize } from "./ImageResize";
import "react-quill/dist/quill.snow.css";
import Preview from "./Preview";
import ReactQuill, { Quill } from "react-quill";
import ImageUploader from "quill-image-uploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEye,
  faMedal,
  faParachuteBox,
  faQrcode,
  faSave,
  faTrash,
  faUserPlus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/createrecuit.css";
import { Video } from "./quill-video-resize";
import "../assets/styles/quill-video-resize.css";
import moment from "moment";
import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import BarcodeScannerComponent from "react-qr-barcode-scanner-18";
import UIfx from "uifx";
import ImgCrop from "antd-img-crop";
import { useParams, useLocation, useNavigate, NavLink } from "react-router-dom";
import beepMp3 from "../assets/beepmp3/beep-07a.mp3";
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
import TextEditorCustoms from "./TextEditorCustoms";

Quill.register("modules/imageUploader", ImageUploader);
Quill.register("modules/imageResize", ImageResize);
Quill.register({ "formats/video": Video });
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { TabPane } = Tabs;
const dateFormat = "YYYY-MM-DD HH:mm:ss";
var upLoadImages = [];
var addImage = false;

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
    [{ color: [] }, { background: [] }],

    [{ align: [] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    [{ direction: "rtl" }],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
  history: {
    delay: 1000,
    maxStack: 50,
    userOnly: false,
  },
  imageUploader: {
    upload: async (file) => {
      const token = GetCookieData(ACCESS_TOKEN);
      var fmData = new FormData();
      const config = {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: "Bearer " + token,
          accept: "*/*",
        },
      };
      fmData.append("image", file);
      try {
        const res = await axios.post(
          API_URL + "api/Newspaper/UploadImage",
          fmData,
          config
        );
        if (res.data.isSuccess) {
          addImage = true;
          var images = upLoadImages;
          images.push(res.data.dataValue);
          upLoadImages = images;
          return API_URL + res.data.dataValue;
        } else {
          if (res.data.errors[0].indexOf("(401)") >= 0) {
            LogOutClearCookie();
          }
          message.error(res.data.errors[0]);
          return null;
        }
      } catch (err) {
        if (err.toString().indexOf(401) >= 0) {
          LogOutClearCookie();
          message.error("Phiên đăng nhập đã hết hạn");
        } else {
          message.error("Mất kết nối với máy chủ");
        }
        return null;
      }
    },
  },
  imageResize: {
    displayStyles: {
      backgroundColor: "black",
      border: "none",
      color: "white",
    },
    modules: ["Resize", "DisplaySize", "Toolbar"],
  },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "color",
  "background",
  "font",
  "align",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "clean",
  "code",
  "formula",
];

// function removeImage(imagepath) {
//     const token = GetCookieData(ACCESS_TOKEN);
//     if (token !== null) {
//         const config = {
//             "Content-Type": "application/json",
//             "accept": "*/*",
//             "Authorization": 'Bearer ' + token
//         }
//         const removeImageModel = {
//             "imagePath": imagepath
//         }
//         axios.post(API_URL + 'api/Newspaper/RemoveImage', JSON.stringify(removeImageModel), { headers: config })
//             .then((response) => {
//                 if (response.data.isSuccess) {
//                 } else {
//                     if (response.data.errors[0].indexOf("(401)") >= 0) {
//                         LogOutClearCookie()
//                     }
//                     message.error(response.data.errors[0]);
//                 }
//             })
//             .catch((response) => {
//                 if (response.toString().indexOf(401) >= 0) {
//                     LogOutClearCookie()
//                     message.error("Phiên đăng nhập đã hết hạn");
//                 } else {
//                     message.error("Mất kết nối máy chủ");
//                 }
//             })
//     }
// }

export default function ActivityAdminTopic() {
  const [form] = Form.useForm();
  const [formChange] = Form.useForm();
  const [sendemailform] = Form.useForm();
  const [formChangeCertificate] = Form.useForm();
  const [formChangeMember] = Form.useForm();
  const [formAddScore] = Form.useForm();
  const [supporter] = Form.useForm();
  const [value, setValue] = useState("");
  const { Search } = Input;
  const [contentNull, setContentNull] = useState(false);
  const [isShowPreview, setIsShowPreview] = useState(false);
  const [titleIsNull, setTitleIsNull] = useState(true);
  const [idActivity, setIdActivity] = useState(null);
  const [defaultFileList, setDefaultFileList] = useState([]);
  const [defaultFileListCertificate, setDefaultFileListCertificate] = useState(
    []
  );
  const [supporterList, setSupporterList] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreading, setIsCreading] = useState(false);
  const [provinceList, setProvinceList] = useState(null);
  const [provinceId, setProvinceId] = useState(null);
  const [districtList, setDistrictList] = useState(null);
  const [districtId, setDistrictId] = useState(null);
  const [wardList, setWardList] = useState(null);
  const [wardId, setWardId] = useState(null);
  const [registerList, setRegisterList] = useState(null);
  const [leaveRegistration, setLeaveRegistration] = useState(null);
  const [checkInList, setCheckInList] = useState(null);
  const [checkInListName, setCheckInListName] = useState(null);
  const [memberEditId, setMemberEditId] = useState(null);
  const [isDateNull, setDateIsNull] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [sponsor, setSponsor] = useState(false);
  const [allowSponsor, setAllowSponsor] = useState(false);
  const [searchText, setsearchText] = useState("");
  const [searchedColumn, setsearchedColumn] = useState("");
  const [isOpenAttendance, setIsOpenAttendance] = useState(false);
  const [isViewMemberActivity, setIsViewMemberActivity] = useState(false);
  const [scanResultWebCam, setScanResultWebCam] = useState("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageSP, setPageSP] = useState(1);
  const [pageSizeSP, setPageSizeSP] = useState(10);
  const [leavePage, setLeavePage] = useState(1);
  const [leavePageSize, setLeavePageSize] = useState(10);
  const [countCheckIn, setCountCheckIn] = useState(0);
  const [isDownload, setIsDownload] = useState(false);
  const [isChange, setIsChange] = useState(false);
  const [isShowModalSend, setIsShowModalSend] = useState(false);
  const [isShowSupporter, setIsShowSupporter] = useState(false);
  const [isShowChangeMember, setIsShowChangeMember] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const searchInput = useRef(null);
  const [roleCreateActivity, setCreateActivity] = useState([1, 2, 4, 5]);
  const [roleSupport, setRoleSupport] = useState([1, 2]);
  //const [roleId, setRoleId] = useState(parseInt(cookies.get('dtu-svc-role')));
  const [isChangeCheckIn, setIsChangeCheckIn] = useState(false);
  const [isLoadingChange, setIsLoadingChange] = useState(false);
  const [checkInId, setCheckInId] = useState(null);
  const { Option } = Select;
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isShowCertificateModal, setIsShowCertificateModal] = useState(false);
  const [registing, setRegisting] = useState(false);
  const [sending, setSending] = useState(false);
  const [isShowAddScore, setIsShowAddScore] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const beep = new UIfx(beepMp3);
  const [progress, setProgress] = useState(0);
  const [certificatePath, setCertificatePath] = useState(null);
  const [certificateRootPath, setCertificateRootPath] = useState(null);
  const [timestamp, setTimestamp] = useState(Date.now());
  const location = useLocation();
  const [m_bUpLoading, setUpLoading] = useState(false);
  const [m_strContent, setContent] = useState(null);
  const [strPreQR, setStrPreQR] = useState("ma");

  let { topicId } = useParams();
  const OnChangeContent = (value) => {
    setContent(value);
  };

  function confirmDeleteRegister(registerid) {
    Modal.confirm({
      title: "Xoá bản đăng ký!",
      icon: <ExclamationCircleOutlined />,
      content:
        "Việc xoá của bạn sẽ không khôi phục lại được. Bạn có chắc chắn muốn xoá?",
      okText: "Xoá",
      cancelText: "Huỷ Bỏ",
      onOk: () => {
        deleteRegisterClick(registerid);
      },
    });
  }

  function confirmDeleteSupporter(supporterId, supporterName) {
    var content = `Bạn có muốn xoá ${supporterName} khỏi danh sách người hỗ trợ?`;
    Modal.confirm({
      title: "Xoá người hỗ trợ!",
      icon: <ExclamationCircleOutlined />,
      content: content,
      okText: "Xoá",
      cancelText: "Huỷ Bỏ",
      onOk: () => {
        deleteSupporterClick(supporterId);
      },
    });
  }

  const handleScan = (err, result) => {
    if (result) {
      setStrPreQR((prevStrPreQR) => {
        if (result.text !== prevStrPreQR) {
          checkIn(result.text);
          console.log("Lần đầu điểm danh:", result.text);
          return result.text;
        } else {
          console.log("mới điểm danh xong mà cái con ni");
          return prevStrPreQR;
        }
      });
    }
  };
  useEffect(() => {
    //console.log("Updated strPreQR:", strPreQR);
  }, [strPreQR]);

  function checkIn(studenId) {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token) {
      const config = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      var requestData = {
        x_strMemberId: studenId,
        x_strActivityId: idActivity,
      };
      axios
        .get(API_URL + "api/Activities/CheckIn", {
          headers: config,
          params: requestData,
        })
        .then((response) => {
          if (response.data.isSuccess) {
            console.log(response.data.dataValue);
            setScanResultWebCam(response.data.dataValue);
            beep.play();
          } else {
            if (response.data.errors[0].indexOf("(401)") >= 0) {
              LogOutClearCookie();
            }
            message.error(response.data.errors[0]);
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
  }

  function deleteRegisterClick(registerid) {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      if (idActivity) {
        const config = {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: "Bearer " + token,
        };
        var requestData = {
          x_strMemberId: registerid,
          x_strActivityId: idActivity,
        };
        axios
          .delete(API_URL + "api/Activities/DeleteRegistration", {
            headers: config,
            params: requestData,
          })
          .then((response) => {
            if (response.data.isSuccess) {
              message.success("Xoá thành công");
              var member = [];
              registerList.forEach((item) => {
                if (item.memberId !== registerid) {
                  member.push(item);
                }
              });
              setRegisterList(member);
            } else {
              if (response.data.errors[0].indexOf("(401)") >= 0) {
                LogOutClearCookie();
              }
              message.error(response.data.errors[0]);
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
      } else {
        message.error("Bạn chỉ được xoá hoạt động vừa tạo");
      }
    }
  }

  function deleteSupporterClick(supporterId) {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      if (topicId) {
        const config = {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: "Bearer " + token,
        };
        var requestData = {
          activityId: topicId,
          studentId: supporterId,
        };
        axios
          .get(
            API_URL + "api/ActivitiesAndEvents/RemoveMemberSupportActivity",
            { headers: config, params: requestData }
          )
          .then((response) => {
            if (response.data.isSuccess) {
              message.success("Xoá thành công");
              var member = [];
              supporterList.forEach((item) => {
                if (item.studentId !== supporterId) {
                  member.push(item);
                }
              });
              setSupporterList(member);
            } else {
              if (response.data.errors[0].indexOf("(401)") >= 0) {
                LogOutClearCookie()();
              }
              message.error(response.data.errors[0]);
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
      } else {
        message.error("Bạn chỉ được xoá hoạt động vừa tạo");
      }
    }
  }

  function confirm() {
    Modal.confirm({
      title: "Xoá bài viết!",
      icon: <ExclamationCircleOutlined />,
      content:
        "Việc xoá của bạn sẽ không khôi phục lại được. Bạn có chắc chắn muốn xoá?",
      okText: "Xoá",
      cancelText: "Huỷ Bỏ",
      onOk: () => {
        deleteClick();
      },
    });
  }

  function confirmSave() {
    Modal.confirm({
      title: "Lưu thay đổi!",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có thực sự muốn lưu các thay đổi về hoạt động không?",
      okText: "Lưu",
      cancelText: "Huỷ Bỏ",
      onOk: () => {
        saveActivity();
      },
    });
  }

  const handleOnChange = ({ fileList: newFileList }) => {
    if (
      newFileList.length !== 0 &&
      newFileList[0].name.match(/\.(jpg|jpeg|png)$/)
    ) {
      setDefaultFileList(newFileList);
    }
    if (newFileList.length == 0) {
      setPoster(null);
      setDefaultFileList([]);
    }
  };

  const handleOnChangeCertificate = ({ fileList: newFileList }) => {
    if (
      newFileList.length !== 0 &&
      newFileList[0].name.match(/\.(jpg|jpeg|png)$/)
    ) {
      if (certificatePath) {
        setDefaultFileListCertificate([
          {
            uid: "-1",
            name: certificatePath.split("/")[
              certificatePath.split("/").length - 1
            ],
            status: "done",
            url: certificatePath,
            thumbUrl: certificatePath,
          },
        ]);
      }
    }
    if (newFileList.length == 0) {
      setCertificate(null);
      setDefaultFileListCertificate([]);
    }
  };

  const onPreviewCertificate = async (file) => {
    if (certificatePath) {
      setDefaultFileListCertificate([
        {
          uid: "-1",
          name: certificatePath.split("/")[
            certificatePath.split("/").length - 1
          ],
          status: "done",
          url: certificatePath,
          thumbUrl: certificatePath,
        },
      ]);
      let src = certificatePath;
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow.document.write(image.outerHTML);
    } else {
      setCertificate(null);
    }
  };

  const onPreview = async (file) => {
    if (file) {
      let src = file.url;
      if (!src) {
        src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj);
          reader.onload = () => resolve(reader.result);
        });
      }
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow.document.write(image.outerHTML);
    } else {
      setPoster(null);
    }
  };

  async function saveActivity() {
    setIsCreading(true);
    var title = form.getFieldValue("title");
    var timeline = form.getFieldValue("timeline");
    var deadline = form.getFieldValue("deadline");
    var provinceId = form.getFieldValue("province");
    var district = form.getFieldValue("district");
    var ward = form.getFieldValue("ward");
    var street = form.getFieldValue("street");
    var type = form.getFieldValue("type");
    var sponsor2 = form.getFieldValue("sponsor");
    console.log(sponsor);
    var stopAllowSponsor2 = form.getFieldValue("stopAllowSponsor");
    var valid = true;
    if (title === undefined || title === null) {
      valid = false;
      form.setFields([
        {
          name: "title",
          errors: ["Vui lòng nhập tiêu đề!"],
        },
      ]);
    } else {
      if (title.replace(/ /g, "") === "") {
        valid = false;
        form.setFields([
          {
            name: "title",
            errors: ["Vui lòng nhập tiêu đề!"],
          },
        ]);
      }
    }

    if (value === null || value === "<p><br></p>" || value === "") {
      valid = false;
      setContentNull(true);
    }

    if (timeline === null || timeline === undefined) {
      valid = false;
      form.setFields([
        {
          name: "timeline",
          errors: ["Vui lòng nhập thời gian diễn ra!"],
        },
      ]);
    }

    if (deadline === null || deadline === undefined) {
      valid = false;
      form.setFields([
        {
          name: "deadline",
          errors: ["Vui lòng nhập hạn cuối nhận hồ sơ!"],
        },
      ]);
    }

    if (deadline < new Date()) {
      valid = false;
      form.setFields([
        {
          name: "deadline",
          errors: [
            "Hạn cuối nhận hồ sơ không được nhỏ hơn thời gian hiện tại!",
          ],
        },
      ]);
    }

    if (provinceId === null || provinceId === undefined) {
      valid = false;
      form.setFields([
        {
          name: "province",
          errors: ["Vui lòng chọn Tỉnh/Thành phố!"],
        },
      ]);
    }

    if (district === null || district === undefined) {
      valid = false;
      form.setFields([
        {
          name: "district",
          errors: ["Vui lòng chọn Quận/Huyện!"],
        },
      ]);
    }

    if (ward === null || ward === undefined) {
      valid = false;
      form.setFields([
        {
          name: "ward",
          errors: ["Vui lòng chọn Xã/Phường!"],
        },
      ]);
    }

    if (street === null || street === undefined) {
      valid = false;
      form.setFields([
        {
          name: "street",
          errors: ["Vui lòng nhập địa chỉ cụ thể!"],
        },
      ]);
    }

    if (type === null || type === undefined) {
      type = true;
    }

    if (sponsor === null || sponsor === undefined) {
      sponsor = false;
    }

    if (stopAllowSponsor2 === null || stopAllowSponsor2 === undefined) {
      stopAllowSponsor2 = true;
    }

    if (valid) {
      const token = GetCookieData(ACCESS_TOKEN);
      if (token !== null) {
        var frdata = new FormData();
        frdata.append("title", title);
        frdata.append("content", value);
        frdata.append("poster", poster);
        frdata.append("SpecificAddress", street);
        frdata.append("provinceId", provinceId);
        frdata.append("districtId", district);
        frdata.append("wardId", ward);
        frdata.append(
          "startDate",
          moment(timeline[0].toISOString()).format("DD/MM/YYYY HH:mm")
        );
        frdata.append(
          "endDate",
          moment(timeline[1].toISOString()).format("DD/MM/YYYY HH:mm")
        );
        frdata.append(
          "registrationDeadline",
          moment(deadline.toISOString()).format("DD/MM/YYYY HH:mm")
        );
        frdata.append("isPublic", !isPublic);
        frdata.append("SponsorshipAllowed", sponsor);
        frdata.append("StopRecvSponsorship", allowSponsor);
        frdata.append("id", idActivity);
        const config = {
          headers: {
            "content-type": "multipart/form-data",
            Authorization: "Bearer " + token,
            accept: "*/*",
          },
        };
        var path = "api/Activities/UpdateActivitie";
        frdata.forEach(function (value, key) {
          console.log(key + ": " + value);
        });
        await axios
          .put(API_URL + path, frdata, config)
          .then((response) => {
            if (response.data.isSuccess) {
              message.success("Cập nhật hoạt động thành công");
              setIsShowModalSend(true);
            } else {
              if (response.data.errors[0].indexOf("(401)") >= 0) {
                LogOutClearCookie();
              }
              message.error(response.data.errors);
            }
            setIsCreading(false);
          })
          .catch((response) => {
            message.error("Mất kết nối với máy chủ");
            setIsCreading(false);
          });
      }
    }
    setIsCreading(false);
  }

  function onChangeDate(e) {
    setDateIsNull(e === null);
  }

  function onChangeCheckInDate(e) {
    setDateIsNull(e === null);
  }

  function getProvince() {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    axios
      .get(API_URL + "api/Address/GetProvinces", { headers: headers })
      .then((response) => {
        if (response.data.isSuccess) {
          setProvinceList(response.data.dataValue);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ!");
      });
  }

  function SendMail() {
    setIsSending(true);
    const isValid = true;
    const content = sendemailform.getFieldValue("mailcontent");
    const token = GetCookieData(ACCESS_TOKEN);

    if (content === undefined || content.replace(/ /g, "") === "") {
      sendemailform.setFields([
        {
          name: "mailcontent",
          errors: ["Vui lòng nhập nội dung cần thông báo"],
        },
      ]);
    }
    var errorList = form.getFieldsError();
    errorList.forEach((error) => {
      if (error.errors.length > 0) {
        isValid = false;
      }
    });
    if (idActivity && isValid) {
      const sendEmailChangeEventModel = {
        eventId: idActivity,
        emailContent: content,
      };
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      axios
        .post(
          API_URL + "api/ActivitiesAndEvents/SendEmailRegisterChangeActivity",
          JSON.stringify(sendEmailChangeEventModel),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            message.success("Gửi email thành công.");
            setIsShowModalSend(false);
            sendemailform.setFields([
              {
                name: "mailcontent",
                value: [""],
              },
            ]);
          } else {
            message.error(response.data.errors);
          }
          setIsSending(false);
        })
        .catch((response) => {
          message.error("Mất kết nối với máy chủ");
          setIsSending(false);
        });
    } else {
      setIsSending(false);
    }
  }

  const cancelModal = () => {
    setIsChangeCheckIn(false);
    setIsLoadingChange(false);
  };

  const changeCheckIn = async (valuedate) => {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const checkInModel = {
        activityId: idActivity,
        memberId: memberEditId,
        checkInId: checkInId,
        checkInTime: moment(valuedate[0].toISOString()).format(
          "DD/MM/YYYY HH:mm"
        ),
        checkOutTime: moment(valuedate[1].toISOString()).format(
          "DD/MM/YYYY HH:mm"
        ),
        appliesToAll: isCheckAll,
      };

      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      await axios
        .put(
          API_URL + "api/Activities/UpdateCheckIn",
          JSON.stringify(checkInModel),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            setIsLoadingChange(false);
            message.success("Cập nhật điểm danh thành công");
            setIsCheckAll(false);
            cancelModal();
          } else {
            if (response.data.errors[0].indexOf("(401)") >= 0) {
              LogOutClearCookie();
            }
            message.error(response.data.errors);
            setIsLoadingChange(false);
          }
        })
        .catch((response) => {
          if (response.toString().indexOf(401) >= 0) {
            LogOutClearCookie();
            message.error("Phiên đăng nhập đã hết hạn");
          } else {
            message.error("Mất kết nối máy chủ");
            setIsLoadingChange(false);
          }
        });
    }
  };

  const getDistrict = async (proviceId) => {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    await axios
      .get(
        API_URL + "api/Address/GetDistrictsByProvinceId",
        {
          params: {
            x_strProvinceId: proviceId,
          },
        },
        { headers: headers }
      )
      .then((response) => {
        if (response.data.isSuccess) {
          setDistrictList(response.data.dataValue);
        } else {
          message.error(response.data.errors[0]);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");
      });
  };

  const getWards = async (districtId) => {
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    await axios
      .get(
        API_URL + "api/Address/GetWardsByDistrictId",
        {
          params: {
            x_strDistrictId: districtId,
          },
        },
        { headers: headers }
      )
      .then((response) => {
        if (response.data.isSuccess) {
          setWardList(response.data.dataValue);
        } else {
          message.error(response.data.errors[0]);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");
      });
  };

  const handleChangeProvince = (e) => {
    form.setFieldsValue({ district: undefined });
    form.setFieldsValue({ ward: undefined });
    setProvinceId(e);
    getDistrict(e);
  };

  const handleChangeDistrict = (e) => {
    form.setFieldsValue({ ward: undefined });
    setDistrictId(e);
    getWards(e);
  };

  const handleChangeWard = (e) => {
    setWardId(e);
  };

  function disabledDate(current) {
    // Can not select days before today and today
    //return current && current < moment().endOf("day");
    // Lấy ngày và giờ hiện tại
    var now = moment();

    // Nếu current không được xác định hoặc nó nhỏ hơn ngày và giờ hiện tại
    // thì vô hiệu hóa nó
    return (
      current &&
      (current.isBefore(now, "day") || // Kiểm tra ngày trước ngày hiện tại
        (current.isSame(now, "day") &&
          (current.hour() < now.hour() || // Kiểm tra giờ trước giờ hiện tại
            (current.hour() === now.hour() &&
              current.minute() <= now.minute())))) // Cùng giờ và kiểm tra phút
    );
  }

  function deleteClick() {
    setIsCreading(true);
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      if (idActivity) {
        const config = {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: "Bearer " + token,
        };
        var requestData = {
          x_strActivityId: idActivity,
        };
        axios
          .delete(API_URL + "api/Activities/DeleteActivitie", {
            headers: config,
            params: requestData,
          })
          .then((response) => {
            if (response.data.isSuccess) {
              message.success("Xoá thành công");
              navigate(-1);
            } else {
              if (response.data.errors[0].indexOf("(401)") >= 0) {
                LogOutClearCookie();
              }
              message.error(response.data.errors[0]);
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
      } else {
        message.error("Bạn chỉ được xoá hoạt động vừa tạo");
      }
    }
  }

  const dummyRequest = ({ file, onSuccess }) => {
    if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
      onSuccess("error");
    } else {
      setTimeout(() => {
        onSuccess("ok");
        setPoster(file);
      }, 0);
    }
  };

  function onChangeTitle(e) {
    setTitleIsNull(e === null);
  }

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
            onClick={() => handleReset(clearFilters)}
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

  const openChangeCheckIn = (itemId) => {
    var chk = checkInList.find(function (item) {
      return item.id === itemId;
    });
    console.log(chk.timeToLeave);
    const timeStart = moment(chk.entryTime).add(7, "hours");
    const timeLeave = moment(chk.timeToLeave).add(7, "hours");
    formChange.setFields([
      {
        changeDate: [
          timeStart.format("HH:mm:ss DD-MM-YYYY"),
          timeLeave.format("HH:mm:ss DD-MM-YYYY"),
        ],
      },
    ]);

    setIsChangeCheckIn(true);
    setCheckInId(itemId);
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
      title: "Check In",
      dataIndex: "entryTime",
      key: "inStart",
      render: (text, record, index) => {
        if (record.isAdditionalScore) {
          return {
            children: <span>{record.reason}</span>,
            props: {
              rowSpan: 1,
            },
          };
        }
        const entryTimeadd = moment(record.entryTime);
        return <span>{entryTimeadd.format("HH:mm:ss DD-MM-YYYY")}</span>;
      },
    },
    {
      title: "Check Out",
      dataIndex: "timeToLeave",
      key: "outStart",
      render: (text, record) => {
        if (record.isAdditionalScore) {
          return null;
        } else {
          if (record.totalScore === 0) {
            return <span style={{ color: "red" }}>Chưa check out</span>;
          } else {
            const timeLeaveadd = moment(record.timeToLeave);
            return <span>{timeLeaveadd.format("HH:mm:ss DD-MM-YYYY")}</span>;
          }
        }
      },
    },
    {
      title: "Điểm",
      dataIndex: "score",
      key: "scores",
      width: 90,
      render: (score) => (
        <Tag color={"#f50"}>{score ? score.toFixed(2) : score}</Tag>
      ),
    },
    {
      title: "Quản Lý",
      dataIndex: "action",
      render: (text, record) => <span>{record.managerName}</span>,
    },
    {
      title: "Hành Động",
      dataIndex: "id",
      key: "id",
      render: (text, record) => (
        <Row>
          {
            //roleId
            1 < 3 ? (
              <Col style={{ padding: 2 }}>
                <Button
                  disabled={record.isAdditionalScore}
                  onClick={() => {
                    openChangeCheckIn(record.id);
                  }}
                  type={"primary"}
                  icon={<FontAwesomeIcon icon={faEdit} />}
                />
              </Col>
            ) : null
          }
          <Col style={{ padding: 2 }}>
            <Button
              type={"primary"}
              onClick={() => {
                confirmDeleteCheckIn(record.id);
              }}
              icon={<FontAwesomeIcon icon={faTrash} />}
              danger
            />
          </Col>
        </Row>
      ),
    },
  ];
  function confirmDeleteCheckIn(id) {
    Modal.confirm({
      title: "Xoá!",
      icon: <ExclamationCircleOutlined />,
      content:
        "Việc xoá của bạn sẽ không khôi phục lại được. Bạn có chắc chắn muốn xoá?",
      okText: "Xoá",
      cancelText: "Huỷ Bỏ",
      onOk: () => {
        deleteCheckIn(id);
      },
    });
  }

  const deleteCheckIn = async (id) => {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const config = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      const checkin = {
        x_strMemberId: memberEditId,
        x_strActivityId: idActivity,
        x_strCheckInId: id,
      };
      axios
        .delete(API_URL + "api/Activities/DeleteCheckIn", {
          params: checkin,
          headers: config,
        })
        .then((response) => {
          if (response.data.isSuccess) {
            message.success("Xoá điểm danh thành công");
            var checkListRemove = [];
            checkInList.forEach((item) => {
              if (item.id !== id) {
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

  const onChangeCheckIn = () => {
    var valuedate = formChange.getFieldValue("changeDate");
    if (valuedate !== null && valuedate !== undefined) {
      formChange.setFields([
        {
          name: "changeDate",
          errors: [],
        },
      ]);
      changeCheckIn(valuedate);
    } else {
      formChange.setFields([
        {
          name: "changeDate",
          errors: ["Vui lòng chọn ngày tháng!"],
        },
      ]);
    }
  };

  function onChangeCheckBox(e) {
    setIsCheckAll(e.target.checked);
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
      title: "Ngày ĐK",
      dataIndex: "createDate",
      key: "createDate",
      width: 140,
      render: (createDate) => (
        <span>{moment(createDate).format("HH:mm:ss DD-MM-YYYY")}</span>
      ),
    },
    {
      title: "MSSV",
      dataIndex: "studentId",
      key: "studentId",
      ...getColumnSearchProps("studentId"),
    },
    {
      title: "Họ",
      dataIndex: "firstName",
      key: "firstName",
      ...getColumnSearchProps("firstName"),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Tên",
      dataIndex: "lastName",
      key: "lastName",
      ...getColumnSearchProps("lastName"),
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      ...getColumnSearchProps("phoneNumber"),
    },
    {
      title: "Khoa",
      dataIndex: "faculty.id",
      key: "faculty.facultyName",
      ...getColumnSearchProps("faculty.facultyName"),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      ...getColumnSearchProps("className"),
    },
    {
      title: "Loại",
      dataIndex: "isMember",
      key: "isMember",
      render: (isMember) => (
        <Tag color={isMember ? "success" : "error"}>
          {isMember ? "Thành viên" : "CTV"}
        </Tag>
      ),
    },
    {
      title: "Tham Gia",
      dataIndex: "activity",
      render: (text, record) => (
        <Tag color={record.evtCheckList.length === 0 ? "#f50" : "#108ee9"}>
          {record.evtCheckList.length ? "Có" : "Chưa"}
        </Tag>
      ),
    },
    {
      title: "Điểm",
      dataIndex: "totalScore",
      key: "scores",
      width: 90,
      render: (totalScore) => (
        <Tag color={Math.round(totalScore) === 0 ? "#f50" : "#108ee9"}>
          {totalScore ? totalScore.toFixed(2) : totalScore}
        </Tag>
      ),
    },
    {
      title: "Hành Động",
      dataIndex: "action",
      render: (text, record) => (
        <Row>
          <Col style={{ padding: 2 }}>
            <Button
              type={"primary"}
              title="Chi tiết"
              onClick={() => {
                setIsViewMemberActivity(true);
                setCheckInList(record.evtCheckList);
                setCheckInListName(`${record.firstName} ${record.lastName}`);
                setMemberEditId(record.memberId);
              }}
              icon={<FontAwesomeIcon icon={faEye} />}
            />
          </Col>
          {
            //roleId
            6 < 7 ? (
              <Col style={{ padding: 2 }}>
                <Button
                  title="Mở Facebook"
                  onClick={() => window.open(record.facebookPath, "_blank")}
                  type={"primary"}
                  icon={<i className="fab fa-facebook-f"></i>}
                />
              </Col>
            ) : null
          }
          {
            //roleoid
            !record.isMember ? (
              <Col style={{ padding: 2 }}>
                <Button
                  onClick={() => {
                    openModalChangeMemberInfo(record);
                  }}
                  type={"primary"}
                  icon={<FontAwesomeIcon icon={faEdit} />}
                />
              </Col>
            ) : null
          }
          {
            <Col style={{ padding: 2 }}>
              <Button
                onClick={() => {
                  openModalAddScore(record);
                }}
                type={"primary"}
                icon={<FontAwesomeIcon icon={faPlus} />}
              />
            </Col>
          }
          {
            //roleId
            6 < 7 ? (
              <Col style={{ padding: 2 }}>
                <Button
                  onClick={() => {
                    confirmDeleteRegister(record.memberId);
                  }}
                  type={"primary"}
                  title="Xoá"
                  icon={<FontAwesomeIcon icon={faTrash} />}
                  danger
                />
              </Col>
            ) : null
          }
        </Row>
      ),
    },
  ];

  function openModalChangeMemberInfo(member) {
    if (member) {
      setMemberId(member.id);
      formChangeMember.setFieldsValue({
        firstname: member.firstName,
        lastname: member.lastName,
        phonenumber: member.phoneNumber,
        email: member.email,
        studentid: member.studentId,
        classname: member.className,
      });
      setIsShowChangeMember(true);
    }
  }

  function openModalAddScore(objMember) {
    if (objMember) {
      setCurrentMember(objMember);
      setIsShowAddScore(true);
    }
  }

  const addScore = async () => {
    if (currentMember) {
      var score = formAddScore.getFieldValue("score");
      var reason = formAddScore.getFieldValue("reason");

      if (score && reason) {
        const token = GetCookieData(ACCESS_TOKEN);
        if (token !== null) {
          const headers = {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: "Bearer " + token,
          };

          const sendCertificateModel = {
            eventId: idActivity,
            memberId: currentMember.memberId,
            reason: reason,
            additionalScore: score,
          };
          console.log(JSON.stringify(sendCertificateModel));
          await axios
            .post(
              API_URL + "api/Activities/AddScore",
              JSON.stringify(sendCertificateModel),
              { headers }
            )
            .then((response) => {
              if (response.data.isSuccess) {
                setIsShowAddScore(false);
                message.success("Thêm điểm cộng thành công.");
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
      } else {
        message.error("Dữ liệu nhập điểm không hợp lệ.");
      }
    }
  };

  const supporterColumns = [
    {
      title: "STT",
      dataIndex: "no1",
      key: "no1",
      width: 60,
      render: (value, item, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Ngày ĐK",
      dataIndex: "createDate",
      key: "createDate",
      width: 140,
      render: (createDate) => (
        <span>{moment(createDate).format("HH:mm:ss DD-MM-YYYY")}</span>
      ),
    },
    {
      title: "MSSV",
      dataIndex: "studentId",
      key: "studentId",
      ...getColumnSearchProps("studentId"),
    },
    {
      title: "Họ & tên",
      dataIndex: "memberFullName",
      key: "memberFullName",
      ...getColumnSearchProps("memberFullName"),
      sorter: (a, b) => a.memberFullName.localeCompare(b.memberFullName),
    },
    {
      title: "Người thêm",
      dataIndex: "adderName",
      key: "adderName",
      ...getColumnSearchProps("adderName"),
      sorter: (a, b) => a.adderName.localeCompare(b.adderName),
    },
    {
      title: "Hành Động",
      dataIndex: "action",
      width: 100,
      render: (text, record) => (
        <Row>
          <Col style={{ padding: 2 }}>
            <Button
              onClick={() => {
                confirmDeleteSupporter(record.studentId, record.memberFullName);
              }}
              type={"primary"}
              title="Xoá"
              icon={<FontAwesomeIcon icon={faTrash} />}
              danger
            />
          </Col>
        </Row>
      ),
    },
  ];

  const leaveColumns = [
    {
      title: "STT",
      dataIndex: "no1",
      key: "no1",
      width: 50,
      render: (value, item, index) =>
        (leavePage - 1) * leavePageSize + index + 1,
    },
    {
      title: "Ngày ĐK",
      dataIndex: "createDate",
      key: "createDate",
      width: 200,
      render: (createDate) => (
        <span>{moment(createDate).format("HH:mm:ss DD-MM-YYYY")}</span>
      ),
    },
    {
      title: "MSSV",
      dataIndex: "studentId",
      key: "studentId",
      width: 140,
      ...getColumnSearchProps("studentId"),
    },
    {
      title: "Họ",
      dataIndex: "firstName",
      key: "memberFirstName",
      width: 160,
      ...getColumnSearchProps("firstName"),
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: "Tên",
      dataIndex: "lastName",
      key: "memberLastName",
      width: 50,
      ...getColumnSearchProps("lastName"),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    // {
    //     title: "SĐT",
    //     dataIndex: "phoneNumber",
    //     key: "phoneNumber",
    //     ...getColumnSearchProps('phoneNumber'),
    // },
    {
      title: "Lý Do",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Facebook",
      dataIndex: "action",
      render: (text, record) => (
        <Button
          title="Mở Facebook"
          onClick={() => window.open(record.facebookPath, "_blank")}
          type={"primary"}
          icon={<i className="fab fa-facebook-f"></i>}
        />
      ),
    },
  ];

  function pagination(page, pageSize) {
    setPage(page);
    setPageSize(pageSize);
  }

  function paginationSP(page, pageSize) {
    setPageSP(page);
    setPageSizeSP(pageSize);
  }

  function leavePagination(page, pageSize) {
    setLeavePage(page);
    setLeavePageSize(pageSize);
  }

  const getListLeave = async (x_strActId) => {
    setLoading(true);
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
      .get(API_URL + "api/Activities/GetListMemberLeaveActivity", {
        params: requestData,
        headers: config,
      })
      .then((response) => {
        if (response.data.isSuccess) {
          console.log(response.data.dataValue);
          setLeaveRegistration(response.data.dataValue);
        } else {
          if (response.data.errors[0].indexOf("(401)") >= 0) {
            LogOutClearCookie();
          }
          setLoading(false);
          message.error(response.data.errors);
        }
        setLoading(false);
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");
        setLoading(false);
      });
  };

  const getListRegis = async (x_strActId) => {
    setLoading(true);
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
      .get(API_URL + "api/Activities/GetListMemberInActivity", {
        params: requestData,
        headers: config,
      })
      .then((response) => {
        if (response.data.isSuccess) {
          console.log(response.data.dataValue);
          setRegisterList(response.data.dataValue);
        } else {
          if (response.data.errors[0].indexOf("(401)") >= 0) {
            LogOutClearCookie();
          }
          setLoading(false);
          message.error(response.data.errors);
        }
        setLoading(false);
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ1");
        setLoading(false);
      });
  };

  const getActivity = async (x_strActId) => {
    setLoading(true);
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
          // var checkIn = 0;
          // response.data.dataValue.registration.forEach(item => {
          //     if (item.listCheckIn.length !== 0) {
          //         checkIn += 1;
          //     }
          // });
          // const timeNow = moment(new Date());
          // setCountCheckIn(checkIn);
          setIdActivity(response.data.dataValue.id);
          setValue(response.data.dataValue.content);
          getDistrict(response.data.dataValue.address.province.provinceId);
          getWards(response.data.dataValue.address.district.districtId);
          setDefaultFileList([
            {
              uid: "-1",
              name: response.data.dataValue.posterPath.split("/")[
                response.data.dataValue.posterPath.split("/").length - 1
              ],
              status: "done",
              url: API_URL + response.data.dataValue.posterPath,
              thumbUrl: API_URL + response.data.dataValue.posterPath,
            },
          ]);
          const start = moment
            .utc(response.data.dataValue.startDate, "YYYY-MM-DD HH:mm:ss")
            .local()
            .format("YYYY-MM-DD HH:mm:ss");
          const ed = moment
            .utc(response.data.dataValue.endDate, "YYYY-MM-DD HH:mm:ss")
            .local()
            .format("YYYY-MM-DD HH:mm:ss");
          const deadline = moment
            .utc(
              response.data.dataValue.registrationDeadline,
              "YYYY-MM-DD HH:mm:ss"
            )
            .local()
            .format("YYYY-MM-DD HH:mm");
          console.log(deadline);
          form.setFieldsValue({
            title: response.data.dataValue.title,
            //deadline: moment(dead,"YYYY-MM-DD HH:mm"),
            deadline: moment(deadline, "YYYY-MM-DD HH:mm"),
            timeline: [
              moment(start, "YYYY-MM-DD HH:mm"),
              moment(ed, "YYYY-MM-DD HH:mm"),
            ],
            province: response.data.dataValue.address.province.provinceId,
            district: response.data.dataValue.address.district.districtId,
            ward: response.data.dataValue.address.ward.wardId,
            street: response.data.dataValue.address.specificAddress,
          });
          setWardId(response.data.dataValue.address.ward.wardId);
          setDistrictId(response.data.dataValue.address.district.districtId);
          setProvinceId(response.data.dataValue.address.province.provinceId);
          setIsPublic(!response.data.dataValue.isPublic);
          setSponsor(response.data.dataValue.sponsorshipAllowed);
          setAllowSponsor(response.data.dataValue.stopRecvSponsorship);
          setLoading(false);
        } else {
          if (response.data.errors[0].indexOf("(401)") >= 0) {
            LogOutClearCookie();
          }
          setLoading(false);
          message.error(response.data.errors);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ2");
        setLoading(false);
      });
  };

  const addSupporter = () => {
    const studentId = supporter.getFieldValue("studentIdSP");
    const token = GetCookieData(ACCESS_TOKEN);
    var valid = true;
    if (studentId === undefined || studentId === null) {
      valid = false;
      supporter.setFields([
        {
          name: "studentIdSP",
          errors: ["Vui lòng nhập MSSV!"],
        },
      ]);
    } else {
      if (studentId.replace(/ /g, "") === "") {
        valid = false;
        supporter.setFields([
          {
            name: "studentIdSP",
            errors: ["Vui lòng nhập MSSV!"],
          },
        ]);
      }
    }
    if (valid && token) {
      const config = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      var requestData = {
        activityId: topicId,
        studentId: studentId,
      };
      axios
        .get(API_URL + "api/ActivitiesAndEvents/AddMemberSupportActivity", {
          params: requestData,
          headers: config,
        })
        .then((response) => {
          if (response.data.isSuccess) {
            message.success("Thêm người hỗ trợ thành công");
            var listSp = [];
            listSp.push(response.data.dataValue);
            supporterList.forEach((item) => {
              listSp.push(item);
            });
            setSupporterList(listSp);
          } else {
            if (response.data.errors[0].indexOf("(401)") >= 0) {
              LogOutClearCookie()();
            }
            message.error(response.data.errors);
          }
        })
        .catch((response) => {
          message.error("Mất kết nối với máy chủ");
        });
    }
  };

  const onSearchCheckIn = (value) => {
    checkIn(value);
  };

  function onChangeMember() {
    setRegisting(true);
    const token = GetCookieData(ACCESS_TOKEN);
    var firstname = formChangeMember.getFieldValue("firstname");
    var lastname = formChangeMember.getFieldValue("lastname");
    var phonenumber = formChangeMember.getFieldValue("phonenumber");
    var email = formChangeMember.getFieldValue("email");
    var classname = formChangeMember.getFieldValue("classname");
    var studentid = formChangeMember.getFieldValue("studentid");
    var isValid = true;
    if (firstname === undefined || firstname.replace(/ /g, "") === "") {
      formChangeMember.setFields([
        {
          name: "firstname",
          errors: ["Vui lòng nhập họ và tên đệm"],
        },
      ]);
    }

    if (lastname === undefined || lastname.replace(/ /g, "") === "") {
      formChangeMember.setFields([
        {
          name: "lastname",
          errors: ["Vui lòng nhập tên"],
        },
      ]);
    }

    if (classname === undefined || classname.replace(/ /g, "") === "") {
      formChangeMember.setFields([
        {
          name: "classname",
          errors: ["Vui lòng nhập lớp"],
        },
      ]);
    }

    if (studentid === undefined || studentid.replace(/ /g, "") === "") {
      formChangeMember.setFields([
        {
          name: "studentid",
          errors: ["Vui lòng nhập mã sinh viên"],
        },
      ]);
    }

    if (phonenumber === undefined || phonenumber.replace(/ /g, "") === "") {
      formChangeMember.setFields([
        {
          name: "phonenumber",
          errors: ["Vui lòng nhập số điện thoại"],
        },
      ]);
    }

    if (email === undefined || email.replace(/ /g, "") === "") {
      formChangeMember.setFields([
        {
          name: "email",
          errors: ["Vui lòng nhập email"],
        },
      ]);
    }

    var errorList = form.getFieldsError();
    errorList.forEach((error) => {
      if (error.errors.length > 0) {
        isValid = false;
      }
    });
    if (token && isValid && memberId) {
      const communityRegistrationInfoModel = {
        id: memberId,
        lastName: lastname,
        firstName: firstname,
        phoneNumber: phonenumber,
        email: email,
        className: classname,
        studentId: studentid,
      };
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      axios
        .post(
          API_URL + "api/ActivitiesAndEvents/ChangeCommunityRegistration",
          JSON.stringify(communityRegistrationInfoModel),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            message.success("Chỉnh sửa thông tin thành công.");
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

  const uploadImage = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    const token = GetCookieData(ACCESS_TOKEN);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        Authorization: "Bearer " + token,
        accept: "*/*",
      },
      onUploadProgress: (event) => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        setProgress(percent);
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000);
        }
        onProgress({ percent: (event.loaded / event.total) * 100 });
      },
    };
    var location = formChangeCertificate.getFieldValue("locationY");
    var fontsize = formChangeCertificate.getFieldValue("fontsize");

    var locationY = 0;
    var nfontsize = 0;
    try {
      if (fontsize === undefined || fontsize === null || fontsize === NaN) {
        nfontsize = 52;
      } else {
        nfontsize = parseInt(fontsize);
      }
    } catch {
      nfontsize = 52;
    }

    try {
      if (location === undefined || location === null || location === NaN) {
        locationY = 520;
      } else {
        locationY = parseInt(location);
      }
    } catch {
      locationY = 520;
    }
    var requestData = {};
    // fmData.append('certificate', file);
    // fmData.append('activityId', idActivity);
    // fmData.append('loacation_Y', locationY);
    // fmData.append('fontSize', nfontsize);
    try {
      const res = await axios.post(
        API_URL + "api/Activities/UpdateSetupCertificate",
        config
      );

      onSuccess("Ok");
      if (res.data.isSuccess) {
        setDefaultFileListCertificate([]);
        setDefaultFileListCertificate([
          {
            uid: "-1",
            name: res.data.message.split("/")[
              res.data.message.split("/").length - 1
            ],
            status: "done",
            url: API_URL + res.data.message,
            thumbUrl: API_URL + res.data.message,
          },
        ]);
        setCertificatePath(API_URL + res.data.message);
        setCertificateRootPath(res.data.dataValue);
      } else {
        if (res.data.errors[0].indexOf("(401)") >= 0) {
          LogOutClearCookie();
        }
        message.error(res.data.errors);
      }
    } catch (err) {
      if (err.toString().indexOf(401) >= 0) {
        LogOutClearCookie();
        message.error("Phiên đăng nhập đã hết hạn");
      } else {
        message.error("Mất kết nối với máy chủ!!");
        onError({ err });
      }
    }
  };

  const deleteFile = async () => {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const config = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      const checkin = {
        x_sFilePath: certificateRootPath,
        x_sActivityId: topicId,
      };
      axios
        .get(API_URL + "api/ActivitiesAndEvents/RemoveCertificate", {
          params: checkin,
          headers: config,
        })
        .then((response) => {
          if (response.data.isSuccess) {
            setDefaultFileListCertificate([]);
            setCertificatePath(null);
            setCertificateRootPath(null);
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

  const onChangeLocationOrSize = async () => {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      var location = formChangeCertificate.getFieldValue("locationY");
      var fontsize = formChangeCertificate.getFieldValue("fontsize");

      var locationY = 0;
      var nfontsize = 0;
      try {
        if (fontsize === undefined || fontsize === null || fontsize === NaN) {
          nfontsize = 52;
        } else {
          nfontsize = parseInt(fontsize);
        }
      } catch {
        nfontsize = 52;
      }

      try {
        if (location === undefined || location === null || location === NaN) {
          locationY = 520;
        } else {
          locationY = parseInt(location);
        }
      } catch {
        locationY = 520;
      }
      const sendCertificateModel = {
        CertificateImage: certificateRootPath,
        activityId: topicId,
        loacation_Y: locationY,
        fontSize: nfontsize,
      };
      await axios
        .post(
          API_URL + "/api/Activities/UploadCertificate",
          JSON.stringify(sendCertificateModel),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            setTimestamp(Date.now());
            setCertificatePath(
              `${API_URL + response.data.message}&${Date.now()}`
            );
            setCertificateRootPath(response.data.dataValue);
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

  const onSendMail = async () => {
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
      var location = formChangeCertificate.getFieldValue("locationY");
      var fontsize = formChangeCertificate.getFieldValue("fontsize");

      var locationY = 0;
      var nfontsize = 0;
      try {
        if (fontsize === undefined || fontsize === null || fontsize === NaN) {
          nfontsize = 52;
        } else {
          nfontsize = parseInt(fontsize);
        }
      } catch {
        nfontsize = 52;
      }

      try {
        if (location === undefined || location === null || location === NaN) {
          locationY = 520;
        } else {
          locationY = parseInt(location);
        }
      } catch {
        locationY = 520;
      }
      const sendCertificateModel = {
        imagePath: certificateRootPath,
        activityId: topicId,
        loacation_Y: locationY,
        fontSize: nfontsize,
      };
      await axios
        .post(
          API_URL + "api/ActivitiesAndEvents/SendCertificate",
          JSON.stringify(sendCertificateModel),
          { headers }
        )
        .then((response) => {
          if (response.data.isSuccess) {
            setTimestamp("");
            setCertificatePath("");
            setCertificateRootPath("");
            message.success("Gửi giấy chứng nhận thành công!");
          } else {
            if (response.data.errors[0].indexOf("(401)") >= 0) {
              LogOutClearCookie();
            }
            message.error(response.data.errors);
          }
          setSending(false);
        })
        .catch((response) => {
          if (response.toString().indexOf(401) >= 0) {
            LogOutClearCookie();
            message.error("Phiên đăng nhập đã hết hạn");
          } else {
            message.error("Mất kết nối máy chủ");
          }
          setSending(false);
        });
    }
    setSending(false);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const strAcId = searchParams.get("activityId");
    setIdActivity(strAcId);
    getActivity(strAcId);
    getListLeave(strAcId);
    getListRegis(strAcId);
    getProvince();
  }, []);

  // return (
  //     <div>
  //         {
  //             loading ?
  //                 <Skeleton />
  //                 :
  //                 <div>
  //                     {
  //                         defaultFileList ?
  //                             <div style={{ minHeight: "61vh" }}>
  //                                 <Modal
  //                                     title={checkInListName}
  //                                     centered
  //                                     visible={isViewMemberActivity}
  //                                     onCancel={() => setIsViewMemberActivity(false)}
  //                                     footer={[
  //                                         <Button type='primary' onClick={() => setIsViewMemberActivity(false)}>Đóng</Button>
  //                                     ]}
  //                                     width={1000}
  //                                 >
  //                                     <Table
  //                                         columns={listCheckInCol}
  //                                         dataSource={checkInList}
  //                                         pagination={{ hideOnSinglePage: true }}
  //                                         scroll={{ y: 1000, x: 800 }} />
  //                                 </Modal>
  //                                 <Modal title="Quét Qr-Code"
  //                                     style={{ top: 20 }}
  //                                     visible={isOpenAttendance}
  //                                     onCancel={() => setIsOpenAttendance(false)}
  //                                     footer={[
  //                                         <Button type='primary' onClick={() => window.location.reload()}>Hoàn Tất</Button>
  //                                     ]}
  //                                 >
  //                                     <BarcodeScannerComponent
  //                                         delay={500}
  //                                         onUpdate={handleScan}

  //                                     />
  //                                     {
  //                                         scanResultWebCam ?
  //                                             <Tag color="#108ee9" style={{ fontSize: 14 }}>{scanResultWebCam.fullName}</Tag>
  //                                             : null
  //                                     }
  //                                     <Search style={{ marginTop: 15 }} placeholder="Nhập mã sinh viên" onSearch={(value) => onSearchCheckIn(value)} enterButton="Điểm Danh" />
  //                                 </Modal>
  //                                 <Form form={form}>
  //                                     <Row span={24}>
  //                                         <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                             <Form.Item
  //                                                 name="title"
  //                                                 label="Tiêu đề:"
  //                                                 disabled={isCreading}
  //                                                 rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
  //                                             >
  //                                                 <Input maxLength={250} placeholder="Tiêu đề" onChange={(e) => { onChangeTitle(e) }} />
  //                                             </Form.Item>
  //                                         </Col>

  //                                         <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
  //                                             <Form.Item
  //                                                 name="timeline"
  //                                                 label="Thời gian:"
  //                                                 disabled={isCreading}
  //                                                 rules={[{ required: true, message: 'Vui lòng nhập thời gian tuyển!' }]}
  //                                             >
  //                                                 <RangePicker
  //                                                     showTime={{ format: 'HH:mm' }}
  //                                                     format={dateFormat}
  //                                                     disabledDate={disabledDate}
  //                                                     onChange={(e) => {
  //                                                         onChangeDate(e);
  //                                                     }}
  //                                                 />
  //                                             </Form.Item>
  //                                         </Col>
  //                                     </Row>
  //                                     <Row>
  //                                         <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                             <Form.Item
  //                                                 name="deadline"
  //                                                 label="Hạn cuối nhận hồ sơ:"
  //                                                 disabled={isCreading}
  //                                                 rules={[{ required: true, message: 'Vui lòng nhập hạn cuối nhận hồ sơ!' }]}
  //                                             >
  //                                                 <DatePicker
  //                                                     showTime={{ format: 'HH:mm:ss' }}
  //                                                     format={dateFormat}
  //                                                     disabledDate={disabledDate}
  //                                                     onChange={(e) => { onChangeDate(e) }}
  //                                                 />
  //                                             </Form.Item>
  //                                         </Col>
  //                                         <Col span={24} className={"col-md-5"} xs={24} xl={24}>
  //                                             <Form.Item
  //                                                 name="poster"
  //                                                 label="Poster:"
  //                                                 disabled={isCreading}
  //                                                 rules={[{ required: true, message: 'Vui lòng tải lên ảnh!' }]}
  //                                             >
  //                                                 <ImgCrop aspect={16 / 9} cropperProps={"posterCrop"}
  //                                                     modalTitle="Cắt ảnh"
  //                                                     modalOk={"Lưu"}
  //                                                     modalCancel={"Huỷ"}>
  //                                                     <Upload
  //                                                         accept="image/*"
  //                                                         onChange={handleOnChange}
  //                                                         onPreview={onPreview}
  //                                                         customRequest={dummyRequest}
  //                                                         defaultFileList={defaultFileList}
  //                                                         className="upload-list-inline"
  //                                                         listType="picture"
  //                                                         maxCount={1}
  //                                                     >
  //                                                         {
  //                                                             defaultFileList.length < 1 && '+ Tải lên'
  //                                                         }
  //                                                     </Upload>
  //                                                 </ImgCrop>
  //                                             </Form.Item>
  //                                         </Col>
  //                                     </Row>
  //                                     <Row>
  //                                         <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                             <Form.Item
  //                                                 name="province"
  //                                                 label="Tỉnh/Thành phố:"
  //                                                 rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
  //                                             >
  //                                                 <Select
  //                                                     showSearch
  //                                                     disabled={isCreading}
  //                                                     className="container text-left"
  //                                                     placeholder="Chọn Tỉnh/Thành phố"
  //                                                     optionFilterProp="children"
  //                                                     filterOption={
  //                                                         (input, option) =>
  //                                                             RemoveVietnameseAccents(option.children).toLowerCase().indexOf(RemoveVietnameseAccents(input).toLowerCase()) >= 0
  //                                                     }
  //                                                     filterSort={
  //                                                         (optionA, optionB) =>
  //                                                             optionA.value.toLowerCase().localeCompare(optionB.value.toLowerCase())
  //                                                     }
  //                                                     value={provinceId}
  //                                                     onChange={handleChangeProvince}
  //                                                 >
  //                                                     {provinceList != null ? provinceList.map((province) => (
  //                                                         <option value={province.provinceId} >{province.provinceName}</option>
  //                                                     )) : <Option value="chon">Chọn Tỉnh/Thành phố</Option>}
  //                                                 </Select>
  //                                             </Form.Item>
  //                                         </Col>
  //                                         <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
  //                                             <Form.Item
  //                                                 name="district"
  //                                                 label="Quận/Huyện:"
  //                                                 rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
  //                                             >
  //                                                 <Select
  //                                                     disabled={isCreading}
  //                                                     showSearch
  //                                                     className="container text-left"
  //                                                     placeholder="Chọn quận/huyện"
  //                                                     optionFilterProp="children"
  //                                                     filterOption={
  //                                                         (input, option) =>
  //                                                             RemoveVietnameseAccents(option.children).toLowerCase().indexOf(RemoveVietnameseAccents(input).toLowerCase()) >= 0
  //                                                     }
  //                                                     filterSort={
  //                                                         (optionA, optionB) =>
  //                                                             optionA.value.toLowerCase().localeCompare(optionB.value.toLowerCase())
  //                                                     }
  //                                                     defaultValue={districtId}
  //                                                     onChange={handleChangeDistrict}
  //                                                 >
  //                                                     {districtList != null ?
  //                                                         districtList.map((district) => (
  //                                                             <option value={district.districtId} >{district.districtName}</option>
  //                                                         )) : <Option value="chon">Chọn Quận/Huyện</Option>}
  //                                                 </Select>
  //                                             </Form.Item>
  //                                         </Col>
  //                                     </Row>
  //                                     <Row>
  //                                         <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                             <Form.Item
  //                                                 name="ward"
  //                                                 label="Xã/Phường:"
  //                                                 rules={[{ required: true, message: 'Vui lòng chọn Xã/Phường!' }]}
  //                                             >
  //                                                 <Select
  //                                                     showSearch
  //                                                     disabled={isCreading}
  //                                                     className="container text-left"
  //                                                     placeholder="Chọn Xã/Phường"
  //                                                     optionFilterProp="children"
  //                                                     filterOption={
  //                                                         (input, option) =>
  //                                                             RemoveVietnameseAccents(option.children).toLowerCase().indexOf(RemoveVietnameseAccents(input).toLowerCase()) >= 0
  //                                                     }
  //                                                     filterSort={
  //                                                         (optionA, optionB) =>
  //                                                             optionA.value.toLowerCase().localeCompare(optionB.value.toLowerCase())
  //                                                     }
  //                                                     defaultValue={wardId}
  //                                                     onChange={handleChangeWard}
  //                                                 >
  //                                                     {wardList != null ?
  //                                                         wardList.map((ward) => (
  //                                                             <option value={ward.wardId} >{ward.wardName}</option>
  //                                                         )) : <Option value="chon">Chọn Xã/Phường</Option>}
  //                                                 </Select>
  //                                             </Form.Item>
  //                                         </Col>
  //                                         <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
  //                                             <Form.Item
  //                                                 name="street"
  //                                                 rules={[{ required: true, message: 'Vui lòng nhập Đường!' }]}
  //                                                 label="Số nhà:"
  //                                             >
  //                                                 <Input disabled={isCreading} rows={2} placeholder="Nhập số nhà" maxLength={40} />
  //                                             </Form.Item>
  //                                         </Col>
  //                                     </Row>
  //                                     <Row justify="start">
  //                                         <Col span={8} className={"col-md-5"} xs={24} xl={8}>
  //                                             <Form.Item
  //                                                 name="type"
  //                                                 label="Loại:"
  //                                                 rules={[{ required: true, message: 'Vui lòng chọn loại hoạt động!' }]}
  //                                                 disabled={isCreading}
  //                                             >
  //                                                 <Switch
  //                                                     defaultChecked={isPublic}
  //                                                     title='Hoạt động nội bộ'
  //                                                     style={{ float: "left" }}
  //                                                     onChange={(e) => { setIsPublic(e) }}
  //                                                     checkedChildren={"Hoạt động nội bộ"}
  //                                                     unCheckedChildren={"Hoạt động công khai"} />
  //                                             </Form.Item>
  //                                         </Col>
  //                                         <Col span={8} className={"col-md-5"} xs={24} xl={8}>
  //                                             <Form.Item
  //                                                 name="sponsor"
  //                                                 label="Quyên góp:"
  //                                                 rules={[{ required: true, message: 'Vui lòng chọn có nhận quyên góp không!' }]}
  //                                                 disabled={isCreading}
  //                                             >
  //                                                 <Switch
  //                                                     defaultChecked={sponsor}
  //                                                     title='Nhận quyên góp'
  //                                                     style={{ float: "left" }}
  //                                                     onChange={(e) => { setSponsor(e) }}
  //                                                     checkedChildren={"Nhận quyên góp"}
  //                                                     unCheckedChildren={"Không nhận quyên góp"} />
  //                                             </Form.Item>
  //                                         </Col>
  //                                         <Col span={8} className={"col-md-5"} xs={24} xl={8}>
  //                                             <Form.Item
  //                                                 name="stopAllowSponsor"
  //                                                 label="Dừng nhận quyên góp:"
  //                                                 rules={[{ required: true, message: 'Vui lòng chọn dừng nhận quyên góp chưa!' }]}
  //                                                 disabled={isCreading}
  //                                             >
  //                                                 <Switch
  //                                                     defaultChecked={allowSponsor}
  //                                                     title='Dừng nhận quyên góp'
  //                                                     style={{ float: "left" }}
  //                                                     onChange={(e) => { setAllowSponsor(e) }}
  //                                                     checkedChildren={"Dừng nhận quyên góp"}
  //                                                     unCheckedChildren={"Tiếp tục"} />
  //                                             </Form.Item>
  //                                         </Col>
  //                                     </Row>
  //                                 </Form>
  //                                 <Row>

  //                                     <Col span={24} xs={24} xl={24}>
  //                                         <Row>
  //                                             <Col span={3} xs={24} xl={3} style={{ textAlign: "left" }}>
  //                                                 Nội dung:
  //                                             </Col>
  //                                             <Col span={18} xs={24} xl={18}>
  //                                                 <Form.Item name="strContent" style={{ textAlign: "left" }}>
  //                                                     <TextEditorCustoms
  //                                                         x_bReadOnly={m_bUpLoading}
  //                                                         x_strValue={m_strContent}
  //                                                         x_evtOnChange={OnChangeContent}
  //                                                     />
  //                                                 </Form.Item>
  //                                             </Col>
  //                                         </Row>
  //                                     </Col>
  //                                 </Row>
  //                                 {
  //                                     roleCreateActivity.includes(1) ?
  //                                         <Button
  //                                             style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
  //                                             disabled={value === "<p><br></p>" || value === ""}
  //                                             onClick={() => { setIsShowPreview(!isShowPreview) }}
  //                                             icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faEye} />}
  //                                             type="primary">Xem Trước
  //                                         </Button>
  //                                         : null
  //                                 }
  //                                 {
  //                                     roleCreateActivity.includes(1) ?
  //                                         <Button
  //                                             style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
  //                                             icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faSave} />}
  //                                             onClick={() => { confirmSave() }}
  //                                             loading={loading}
  //                                             disabled={isChange}
  //                                             type="primary">Cập Nhật
  //                                         </Button>
  //                                         : null
  //                                 }
  //                                 {
  //                                     roleSupport.includes(1) ?
  //                                         <Button
  //                                             style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
  //                                             icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faParachuteBox} />}
  //                                             onClick={() => { setIsShowSupporter(true) }}
  //                                             loading={loading}
  //                                             disabled={isChange}
  //                                             type="primary">Hỗ Trợ BCN
  //                                         </Button>
  //                                         : null
  //                                 }
  //                                 {
  //                                     roleCreateActivity.includes(1) ?
  //                                         <Button
  //                                             style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
  //                                             icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faMedal} />}
  //                                             onClick={() => { setIsShowCertificateModal(true) }}
  //                                             type="primary">Gửi Chứng Nhận
  //                                         </Button>
  //                                         : null
  //                                 }
  //                                 {
  //                                     roleCreateActivity.includes(1) ?
  //                                         <Button
  //                                             style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
  //                                             icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faTrash} />}
  //                                             danger
  //                                             onClick={() => { confirm() }}
  //                                             loading={loading}
  //                                             disabled={isChange}
  //                                             type="primary">Xoá
  //                                         </Button>
  //                                         : null
  //                                 }
  //                                 <Button
  //                                     style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
  //                                     icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faQrcode} />}
  //                                     type="primary" onClick={() => setIsOpenAttendance(true)}>Điểm Danh
  //                                 </Button>
  //                                 {
  //                                     isShowPreview ?
  //                                         <div>
  //                                             <hr />
  //                                             <Preview value={value} />
  //                                         </div>
  //                                         : null
  //                                 }
  //                                 <div>
  //                                     <hr />
  //                                     <Tabs defaultActiveKey="1" className="container">
  //                                         <TabPane tab="Đăng Ký Tham Gia" key="1">
  //                                             <h3>Danh sách đăng ký tham gia </h3>
  //                                             {/* //({countCheckIn}/{registerList.length}) */}
  //                                             {registerList ?
  //                                                 (<Table
  //                                                     key={registerList.id}
  //                                                     columns={columns}
  //                                                     dataSource={registerList}
  //                                                     pagination={{
  //                                                         onChange: (page, pageSize) => {
  //                                                             pagination(page, pageSize);
  //                                                         },
  //                                                         current: page,
  //                                                         pageSize: pageSize,
  //                                                         total: registerList.length
  //                                                     }}
  //                                                     scroll={{ x: 800 }} />)
  //                                                 : <Result
  //                                                     status="404"
  //                                                     title="Rỗng!"
  //                                                     subTitle="Không tìm thấy ứng viên nào." />
  //                                             }
  //                                         </TabPane>
  //                                         <TabPane tab="Xin Phép Vắng" key="2">
  //                                             <h3>Danh sách xin vắng </h3>
  //                                             {/* ({leaveRegistration.length}) */}
  //                                             {leaveRegistration ? (<Table
  //                                                 key={leaveRegistration.id}
  //                                                 columns={leaveColumns}
  //                                                 dataSource={leaveRegistration}
  //                                                 pagination={{
  //                                                     onChange: (page, pageSize) => {
  //                                                         leavePagination(page, pageSize);
  //                                                     },
  //                                                     current: leavePage,
  //                                                     pageSize: leavePageSize,
  //                                                     total: leaveRegistration.length
  //                                                 }}
  //                                                 scroll={{ x: 1000 }} />) :
  //                                                 <Result
  //                                                     status="404"
  //                                                     title="Rỗng!"
  //                                                     subTitle="Không tìm thấy ứng viên nào." />
  //                                             }
  //                                         </TabPane>
  //                                     </Tabs>
  //                                     {
  //                                         registerList || leaveRegistration ?
  //                                             <div>
  //                                                 {/* {
  //                                                     roleSupport.includes(1) ?
  //                                                         <Button
  //                                                             loading={isDownload}
  //                                                             style={{ margin: 15 }}
  //                                                             onClick={() => DownloadListJoinActivity()}
  //                                                             type='primary'>Tải Danh Danh Sách</Button>
  //                                                         : null
  //                                                 } */}
  //                                                 <Modal
  //                                                     title="Gửi thông báo"
  //                                                     visible={isShowModalSend}
  //                                                     onOk={() => SendMail()}
  //                                                     onCancel={() => setIsShowModalSend(false)}
  //                                                     footer={[
  //                                                         <Button key="back" onClick={() => setIsShowModalSend(false)} loading={isSending}>
  //                                                             Huỷ
  //                                                         </Button>,
  //                                                         <Button key="submit" type="primary" loading={isSending} onClick={() => SendMail()}>
  //                                                             Gửi
  //                                                         </Button>
  //                                                     ]}>
  //                                                     <p>Bạn vừa thay đổi thông tin của hoạt động. Có lẽ rất nhiều CTV không biết sự thay đổi này. Bạn có muốn gửi email thông báo cho họ biết về sự thay đổi này không?</p>
  //                                                     <Form form={sendemailform}>
  //                                                         <Form.Item
  //                                                             name="mailcontent"
  //                                                             label="Nội dung:"
  //                                                             disabled={isSending}
  //                                                             rules={[{ required: true, message: 'Vui lòng nhập nội dung bạn muốn gửi!' }]}
  //                                                         >
  //                                                             <TextArea rows={4} placeholder="Nhập các thay đổi bạn muốn thông báo..." />
  //                                                         </Form.Item>
  //                                                     </Form>
  //                                                 </Modal>
  //                                                 <Modal
  //                                                     title="Người hỗ trợ"
  //                                                     centered
  //                                                     visible={isShowSupporter}
  //                                                     onCancel={() => setIsShowSupporter(false)}
  //                                                     footer={[
  //                                                         <Button key="back" onClick={() => setIsShowSupporter(false)}>
  //                                                             Đóng
  //                                                         </Button>
  //                                                     ]}
  //                                                     width={1000}
  //                                                     style={{ top: 10 }}
  //                                                 >
  //                                                     <Row>
  //                                                         <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                                             <Form form={supporter}>
  //                                                                 <Form.Item
  //                                                                     name="studentIdSP"
  //                                                                     label="MSSV:"
  //                                                                     disabled={isCreading}
  //                                                                     rules={[{ required: true, message: 'Vui lòng nhập MSSV!' }]}
  //                                                                 >
  //                                                                     <Input maxLength={250} placeholder="Mã số sinh viên" />
  //                                                                 </Form.Item>
  //                                                             </Form>
  //                                                         </Col>
  //                                                         <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
  //                                                             <Button
  //                                                                 type='primary'
  //                                                                 icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faUserPlus} />}
  //                                                                 onClick={() => addSupporter()}
  //                                                                 block>Thêm</Button>
  //                                                         </Col>
  //                                                     </Row>
  //                                                     <Table
  //                                                         key={supporterList ? supporterList.id : []}
  //                                                         columns={supporterColumns}
  //                                                         dataSource={supporterList ? supporterList : []}
  //                                                         pagination={{
  //                                                             onChange: (page, pageSize) => {
  //                                                                 paginationSP(page, pageSize);
  //                                                             },
  //                                                             current: pageSP,
  //                                                             pageSize: pageSizeSP,
  //                                                             total: supporterList ? supporterList.length : 0
  //                                                         }}
  //                                                         style={{ margin: 15 }}
  //                                                         scroll={{ x: 900, y: 200 }} />
  //                                                 </Modal>
  //                                                 <Modal
  //                                                     visible={isChangeCheckIn}
  //                                                     onOk={changeCheckIn}
  //                                                     onCancel={cancelModal}
  //                                                     centered
  //                                                     title={"Cập nhật thời gian điểm danh"}
  //                                                     footer={[
  //                                                         <Button disabled={isLoadingChange} key="back" onClick={cancelModal}>
  //                                                             Quay lại
  //                                                         </Button>,
  //                                                         <Button key="submit" type="primary" loading={isLoadingChange} onClick={onChangeCheckIn}>
  //                                                             Cập nhật
  //                                                         </Button>
  //                                                     ]}>
  //                                                     <Form form={formChange}>
  //                                                         <Form.Item
  //                                                             name="changeDate"
  //                                                             rules={[
  //                                                                 {
  //                                                                     required: true,
  //                                                                     message: "Vui lòng nhập thời gian !",
  //                                                                 },
  //                                                             ]}
  //                                                             style={{ textAlign: "left" }}
  //                                                         >
  //                                                             <RangePicker
  //                                                                 showTime
  //                                                                 style={{
  //                                                                     width: "100%",
  //                                                                 }}
  //                                                             />
  //                                                         </Form.Item>
  //                                                         <Form.Item
  //                                                             name="isSetFullList"
  //                                                         >
  //                                                             <Checkbox defaultChecked={isCheckAll} onChange={(e) => onChangeCheckBox(e)}>Áp dụng thời gian ra cho toàn bộ danh sách.</Checkbox>
  //                                                         </Form.Item>
  //                                                     </Form>
  //                                                 </Modal>
  //                                                 {/* Show modal send chứng nhận */}
  //                                                 <Modal
  //                                                     visible={isShowCertificateModal}
  //                                                     onOk={() => setIsShowCertificateModal(false)}
  //                                                     onCancel={() => setIsShowCertificateModal(false)}
  //                                                     centered
  //                                                     title={"Gửi giấy chứng nhận Online"}
  //                                                     footer={[
  //                                                         <Button disabled={isLoadingChange} key="back" onClick={() => {
  //                                                             setIsShowCertificateModal(false);
  //                                                         }}
  //                                                             loading={sending}>
  //                                                             Quay lại
  //                                                         </Button>,
  //                                                         <Button key="submit" type="primary"
  //                                                             loading={sending}
  //                                                             onClick={() => {
  //                                                                 setIsShowCertificateModal(false);
  //                                                                 setSending(true);
  //                                                                 onSendMail();
  //                                                             }}>
  //                                                             Gửi
  //                                                         </Button>
  //                                                     ]}>
  //                                                     {
  //                                                         certificatePath ?
  //                                                             <div className='container'>
  //                                                                 <Image
  //                                                                     width={"100%"}
  //                                                                     key={timestamp}
  //                                                                     src={certificatePath}
  //                                                                 />
  //                                                                 <Button type='primary' onClick={() => {
  //                                                                     deleteFile();
  //                                                                 }}>Xoá ảnh</Button>
  //                                                             </div>
  //                                                             :
  //                                                             <Upload
  //                                                                 accept="image/*"
  //                                                                 onChange={handleOnChangeCertificate}
  //                                                                 onPreview={onPreviewCertificate}
  //                                                                 customRequest={uploadImage}
  //                                                                 defaultFileList={defaultFileListCertificate}
  //                                                                 className="upload-list-inline"
  //                                                                 listType="picture-card"
  //                                                                 maxCount={1}
  //                                                             >
  //                                                                 {
  //                                                                     defaultFileListCertificate.length < 1 && '+ Tải lên'
  //                                                                 }
  //                                                             </Upload>
  //                                                     }
  //                                                     <Form form={formChangeCertificate}>
  //                                                         <Row>
  //                                                             <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                                                 <Form.Item
  //                                                                     style={{ marginTop: 15 }}
  //                                                                     label="Toạ độ tên"
  //                                                                     name={"locationY"}
  //                                                                     rules={[{ required: true, message: 'Vui lòng nhập toạ độ tên!' }]}
  //                                                                 >
  //                                                                     <Input defaultValue={520} onChange={() => onChangeLocationOrSize()} type={"number"} min={0} placeholder="Toạ độ tên"></Input>
  //                                                                 </Form.Item>
  //                                                             </Col>
  //                                                             <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
  //                                                                 <Form.Item
  //                                                                     style={{ marginTop: 15 }}
  //                                                                     label="Cỡ chữ"
  //                                                                     name={"fontsize"}
  //                                                                     rules={[{ required: true, message: 'Vui lòng nhập cỡ chữ!' }]}
  //                                                                 >
  //                                                                     <Input defaultValue={52} onChange={() => onChangeLocationOrSize()} type={"number"} min={0} placeholder="Cỡ chữ"></Input>
  //                                                                 </Form.Item>
  //                                                             </Col>
  //                                                         </Row>
  //                                                     </Form>
  //                                                 </Modal>
  //                                                 {/* Show change Member */}
  //                                                 <Modal
  //                                                     visible={isShowChangeMember}
  //                                                     onOk={changeCheckIn}
  //                                                     onCancel={() => setIsShowChangeMember(false)}
  //                                                     centered
  //                                                     title={"Cập nhật thông tin thành viên"}
  //                                                     footer={[
  //                                                         <Button disabled={registing} key="back" onClick={() => setIsShowChangeMember(false)}>
  //                                                             Đóng
  //                                                         </Button>,
  //                                                         <Button key="submit" type="primary" loading={registing} onClick={() => onChangeMember()}>
  //                                                             Cập nhật
  //                                                         </Button>
  //                                                     ]}
  //                                                     width={1000}
  //                                                 >
  //                                                     <Form form={formChangeMember}>
  //                                                         <Row>
  //                                                             <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                                                 <Form.Item
  //                                                                     name="firstname"
  //                                                                     label="Họ & tên đệm:"
  //                                                                     rules={[{
  //                                                                         required: true,
  //                                                                         message: 'Vui lòng nhập họ & tên đệm!',
  //                                                                     }]}
  //                                                                 >
  //                                                                     <Input disabled={registing} placeholder="Nhập họ và tên đệm" maxLength={30} />
  //                                                                 </Form.Item>
  //                                                             </Col>
  //                                                             <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
  //                                                                 <Form.Item
  //                                                                     name="lastname"
  //                                                                     label="Tên:"
  //                                                                     rules={[{
  //                                                                         required: true,
  //                                                                         message: 'Vui lòng nhập tên!',
  //                                                                     }]}
  //                                                                 >
  //                                                                     <Input disabled={registing} placeholder="Nhập Tên" maxLength={7} />
  //                                                                 </Form.Item>
  //                                                             </Col>
  //                                                         </Row>
  //                                                         <Row>
  //                                                             <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                                                 <Form.Item
  //                                                                     name="phonenumber"
  //                                                                     label="Số điện thoại:"
  //                                                                     rules={[{
  //                                                                         required: true,
  //                                                                         message: 'Vui lòng nhập số điện thoại!',
  //                                                                     }]}
  //                                                                 >
  //                                                                     <Input disabled={registing} placeholder="Nhập số điện thoại" maxLength={15} />
  //                                                                 </Form.Item>
  //                                                             </Col>
  //                                                             <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
  //                                                                 <Form.Item
  //                                                                     name="email"
  //                                                                     label="Email:"
  //                                                                     rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: "email", message: 'Email không hợp lệ!' }]}
  //                                                                 >
  //                                                                     <Input disabled={registing} placeholder="Nhập Email" maxLength={100} />
  //                                                                 </Form.Item>
  //                                                             </Col>
  //                                                         </Row>
  //                                                         <Row>
  //                                                             <Col span={12} className={"col-md-5"} xs={24} xl={12}>
  //                                                                 <Form.Item
  //                                                                     name="studentid"
  //                                                                     label="Mã số sinh viên:"
  //                                                                     rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên!' }]}
  //                                                                 >
  //                                                                     <Input disabled={registing} placeholder="Nhập mã sinh viên" maxLength={15} />
  //                                                                 </Form.Item>
  //                                                             </Col>
  //                                                             <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
  //                                                                 {/* Mã lớp */}
  //                                                                 <Form.Item
  //                                                                     name="classname"
  //                                                                     label="Lớp:"
  //                                                                     rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}
  //                                                                 >
  //                                                                     <Input disabled={registing} placeholder="Nhập tên lớp" maxLength={15} />
  //                                                                 </Form.Item>
  //                                                             </Col>
  //                                                         </Row>
  //                                                     </Form>
  //                                                 </Modal>
  //                                                 {
  //                                                     currentMember ?
  //                                                         <Modal
  //                                                             visible={isShowAddScore}
  //                                                             onOk={addScore}
  //                                                             onCancel={() => setIsShowAddScore(false)}
  //                                                             centered
  //                                                             title={"Thêm điểm cộng"}
  //                                                             footer={[
  //                                                                 <Button disabled={registing} key="back" onClick={() => setIsShowAddScore(false)}>
  //                                                                     Đóng
  //                                                                 </Button>,
  //                                                                 <Button key="submit" type="primary" loading={registing} onClick={() => addScore()}>
  //                                                                     Cập nhật
  //                                                                 </Button>
  //                                                             ]}
  //                                                         >
  //                                                             <Form form={formAddScore}>
  //                                                                 <Row>
  //                                                                     <Col span={24} className={"col-md-5"} xs={24} xl={24}>
  //                                                                         <Form.Item
  //                                                                             name="fullname"
  //                                                                             label="Họ & tên:"
  //                                                                         >
  //                                                                             <Input disabled={true} defaultValue={currentMember.firstName + ' ' + currentMember.lastName} />
  //                                                                         </Form.Item>
  //                                                                     </Col>
  //                                                                     <Col span={24} className={"col-md-5"} xs={24} xl={24}>
  //                                                                         <Form.Item
  //                                                                             name="score"
  //                                                                             label="Điểm:"
  //                                                                             rules={[{
  //                                                                                 required: true,
  //                                                                                 message: 'Vui lòng nhập điểm!',
  //                                                                             }]}
  //                                                                         >
  //                                                                             <InputNumber disabled={registing} step={0.1} placeholder="Nhập điểm" min={0.1} max={24.0} style={{ width: '100%' }} />
  //                                                                         </Form.Item>
  //                                                                     </Col>
  //                                                                 </Row>
  //                                                                 <Row>
  //                                                                     <Col span={24} className={"col-md-5"} xs={24} xl={24}>
  //                                                                         <Form.Item
  //                                                                             name="reason"
  //                                                                             label="Lý do:"
  //                                                                             rules={[{
  //                                                                                 required: true,
  //                                                                                 message: 'Vui lòng nhập lý do!',
  //                                                                             }]}
  //                                                                         >
  //                                                                             <Input disabled={registing} placeholder="Nhập lý do" maxLength={64} />
  //                                                                         </Form.Item>
  //                                                                     </Col>
  //                                                                 </Row>
  //                                                             </Form>
  //                                                         </Modal>
  //                                                         : null
  //                                                 }

  //                                             </div>
  //                                             : null
  //                                     }
  //                                 </div>
  //                             </div>
  //                             :
  //                             <Result
  //                                 status={"500"}
  //                                 title={"Hoạt động không tồn tại!"}
  //                                 subTitle={"Không có hoạt động nào!"} />
  //                     }
  //                 </div>
  //         }
  //     </div>
  // )
  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : (
        <div>
          {defaultFileList ? (
            <div style={{ minHeight: "61vh" }}>
              <Modal
                title={checkInListName}
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
                  columns={listCheckInCol}
                  dataSource={checkInList}
                  pagination={{ hideOnSinglePage: true }}
                  scroll={{ y: 1000, x: 800 }}
                />
              </Modal>
              <Modal
                title="Quét Qr-Code"
                style={{ top: 20 }}
                visible={isOpenAttendance}
                onCancel={() => setIsOpenAttendance(false)}
                footer={[
                  <Button
                    type="primary"
                    onClick={() => window.location.reload()}
                  >
                    Hoàn Tất
                  </Button>,
                ]}
              >
                <BarcodeScannerComponent delay={500} onUpdate={handleScan} />
                {scanResultWebCam ? (
                  <Tag color="#108ee9" style={{ fontSize: 14 }}>
                    {scanResultWebCam.fullName}
                  </Tag>
                ) : null}
                <Search
                  style={{ marginTop: 15 }}
                  placeholder="Nhập mã sinh viên"
                  onSearch={(value) => onSearchCheckIn(value)}
                  enterButton="Điểm Danh"
                />
              </Modal>
              <Form form={form} style={{ marginTop: 15 }}>
                <Row span={24}>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <Form.Item
                      labelCol={{ span: 7 }}
                      labelAlign="left"
                      wrapperCol={{ span: 17 }}
                      name="title"
                      label="Tiêu đề:"
                      disabled={isCreading}
                      rules={[
                        { required: true, message: "Vui lòng nhập tiêu đề!" },
                      ]}
                    >
                      <Input
                        maxLength={250}
                        placeholder="Tiêu đề"
                        onChange={(e) => {
                          onChangeTitle(e);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                    offset={2}
                  >
                    <Form.Item
                      name="timeline"
                      label="Thời gian:"
                      labelCol={{ span: 7 }}
                      labelAlign="left"
                      disabled={isCreading}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập thời gian tuyển!",
                        },
                      ]}
                    >
                      <RangePicker
                        showTime={{ format: "HH:mm" }}
                        format={dateFormat}
                        disabledDate={disabledDate}
                        onChange={(e) => {
                          onChangeDate(e);
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <Form.Item
                      labelCol={{ span: 7 }}
                      labelAlign="left"
                      name="deadline"
                      label="Hạn cuối nhận hồ sơ:"
                      disabled={isCreading}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập hạn cuối nhận hồ sơ!",
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        showTime={{ format: "HH:mm:ss" }}
                        format={dateFormat}
                        disabledDate={disabledDate}
                        onChange={(e) => {
                          onChangeDate(e);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    span={24}
                    className={"col-md-5"}
                    xs={24}
                    xl={24}
                    offset={2}
                  >
                    <Form.Item
                      name="poster"
                      label="Poster:"
                      labelCol={{ span: 7 }}
                      labelAlign="left"
                      disabled={isCreading}
                      rules={[
                        { required: true, message: "Vui lòng tải lên ảnh!" },
                      ]}
                    >
                      <ImgCrop
                        aspect={16 / 9}
                        cropperProps={"posterCrop"}
                        modalTitle="Cắt ảnh"
                        modalOk={"Lưu"}
                        modalCancel={"Huỷ"}
                      >
                        <Upload
                          accept="image/*"
                          onChange={handleOnChange}
                          onPreview={onPreview}
                          customRequest={dummyRequest}
                          defaultFileList={defaultFileList}
                          className="upload-list-inline"
                          listType="picture"
                          maxCount={1}
                        >
                          {defaultFileList.length < 1 && "+ Tải lên"}
                        </Upload>
                      </ImgCrop>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <Form.Item
                      name="province"
                      label="Tỉnh/Thành phố:"
                      labelCol={{ span: 7 }}
                      labelAlign="left"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn Tỉnh/Thành phố!",
                        },
                      ]}
                    >
                      <Select
                        style={{ width: "100%", padding: 0 }}
                        showSearch
                        disabled={isCreading}
                        className="container text-left"
                        placeholder="Chọn Tỉnh/Thành phố"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          RemoveVietnameseAccents(option.children)
                            .toLowerCase()
                            .indexOf(
                              RemoveVietnameseAccents(input).toLowerCase()
                            ) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value
                            .toLowerCase()
                            .localeCompare(optionB.value.toLowerCase())
                        }
                        value={provinceId}
                        onChange={handleChangeProvince}
                      >
                        {provinceList != null ? (
                          provinceList.map((province) => (
                            <option value={province.provinceId}>
                              {province.provinceName}
                            </option>
                          ))
                        ) : (
                          <Option value="chon">Chọn Tỉnh/Thành phố</Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                    offset={2}
                  >
                    <Form.Item
                      name="district"
                      label="Quận/Huyện:"
                      labelCol={{ span: 7 }}
                      labelAlign="left"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn Quận/Huyện!",
                        },
                      ]}
                    >
                      <Select
                        style={{ width: "100%", padding: 0 }}
                        disabled={isCreading}
                        showSearch
                        className="container text-left"
                        placeholder="Chọn quận/huyện"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          RemoveVietnameseAccents(option.children)
                            .toLowerCase()
                            .indexOf(
                              RemoveVietnameseAccents(input).toLowerCase()
                            ) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value
                            .toLowerCase()
                            .localeCompare(optionB.value.toLowerCase())
                        }
                        defaultValue={districtId}
                        onChange={handleChangeDistrict}
                      >
                        {districtList != null ? (
                          districtList.map((district) => (
                            <option value={district.districtId}>
                              {district.districtName}
                            </option>
                          ))
                        ) : (
                          <Option value="chon">Chọn Quận/Huyện</Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <Form.Item
                      name="ward"
                      label="Xã/Phường:"
                      labelCol={{ span: 7 }}
                      labelAlign="left"
                      rules={[
                        { required: true, message: "Vui lòng chọn Xã/Phường!" },
                      ]}
                    >
                      <Select
                        style={{ width: "100%", padding: 0 }}
                        showSearch
                        disabled={isCreading}
                        className="container text-left"
                        placeholder="Chọn Xã/Phường"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          RemoveVietnameseAccents(option.children)
                            .toLowerCase()
                            .indexOf(
                              RemoveVietnameseAccents(input).toLowerCase()
                            ) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value
                            .toLowerCase()
                            .localeCompare(optionB.value.toLowerCase())
                        }
                        defaultValue={wardId}
                        onChange={handleChangeWard}
                      >
                        {wardList != null ? (
                          wardList.map((ward) => (
                            <option value={ward.wardId}>{ward.wardName}</option>
                          ))
                        ) : (
                          <Option value="chon">Chọn Xã/Phường</Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                    offset={2}
                  >
                    <Form.Item
                      name="street"
                      rules={[
                        { required: true, message: "Vui lòng nhập Đường!" },
                      ]}
                      label="Số nhà:"
                      labelCol={{ span: 7 }}
                      labelAlign="left"
                    >
                      <Input
                        disabled={isCreading}
                        rows={2}
                        placeholder="Nhập số nhà"
                        maxLength={40}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="start">
                  <Col span={7} className={"col-md-5"} xs={24} xl={7}>
                    <Form.Item
                      name="type"
                      label="Loại:"
                      labelCol={{ span: 5 }}
                      labelAlign="left"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn loại hoạt động!",
                        },
                      ]}
                      disabled={isCreading}
                    >
                      <Switch
                        defaultChecked={isPublic}
                        title="Hoạt động nội bộ"
                        style={{ float: "left" }}
                        onChange={(e) => {
                          setIsPublic(e);
                        }}
                        checkedChildren={"Hoạt động nội bộ"}
                        unCheckedChildren={"Hoạt động công khai"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7} className={"col-md-5"} xs={24} xl={7}>
                    <Form.Item
                      name="sponsor"
                      label="Quyên góp:"
                      labelCol={{ span: 6 }}
                      labelAlign="left"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn có nhận quyên góp không!",
                        },
                      ]}
                      disabled={isCreading}
                    >
                      <Switch
                        defaultChecked={sponsor}
                        title="Nhận quyên góp"
                        style={{ float: "left" }}
                        onChange={(e) => {
                          setSponsor(e);
                        }}
                        checkedChildren={"Nhận quyên góp"}
                        unCheckedChildren={"Không nhận quyên góp"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8} className={"col-md-5"} xs={24} xl={8}>
                    <Form.Item
                      name="stopAllowSponsor"
                      label="Dừng nhận quyên góp:"
                      labelCol={{ span: 10 }}
                      labelAlign="left"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn dừng nhận quyên góp chưa!",
                        },
                      ]}
                      disabled={isCreading}
                    >
                      <Switch
                        defaultChecked={allowSponsor}
                        onChange={(e) => {
                          setAllowSponsor(e);
                        }}
                        checkedChildren={"Dừng nhận quyên góp"}
                        unCheckedChildren={"Tiếp tục"}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
              <Row>
                <Col span={24} xs={24} xl={24}>
                  <Row>
                    <Col span={3} xs={24} xl={3} style={{ textAlign: "left" }}>
                      Nội dung:
                    </Col>
                    <Col span={19} xs={24} xl={19}>
                      <Form.Item
                        name="strContent"
                        style={{ textAlign: "left" }}
                      >
                        <TextEditorCustoms
                          x_bReadOnly={m_bUpLoading}
                          x_strValue={m_strContent}
                          x_evtOnChange={OnChangeContent}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {roleCreateActivity.includes(1) ? (
                    <Button
                      style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                      disabled={value === "<p><br></p>" || value === ""}
                      onClick={() => {
                        setIsShowPreview(!isShowPreview);
                      }}
                      icon={
                        <FontAwesomeIcon style={{ marginRight: 10 }} icon={faEye} />
                      }
                      type="primary"
                    >
                      Xem Trước
                    </Button>
                  ) : null}
                  {roleCreateActivity.includes(1) ? (
                    <Button
                      style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                      icon={
                        <FontAwesomeIcon
                          style={{ marginRight: 10 }}
                          icon={faSave}
                        />
                      }
                      onClick={() => {
                        confirmSave();
                      }}
                      loading={loading}
                      disabled={isChange}
                      type="primary"
                    >
                      Cập Nhật
                    </Button>
                  ) : null}
                  {roleCreateActivity.includes(1) ? (
                    <div>
                      <NavLink
                        to={
                          "/dashboard/sendcertificate/sendcertificate?activityId=" + idActivity
                        }
                        style={{ textDecoration: "none" }}
                      >
                        <Button
                          style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                          icon={
                            <FontAwesomeIcon
                              style={{ marginRight: 10 }}
                              icon={faMedal}
                            />
                          }
                          onClick={() => {
                            setIsShowCertificateModal(true);
                          }}
                          type="primary"
                        >
                          Gửi Chứng Nhận
                        </Button>
                      </NavLink>
                    </div>

                  ) : null}
                  {roleCreateActivity.includes(1) ? (
                    <Button
                      style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                      icon={
                        <FontAwesomeIcon
                          style={{ marginRight: 10 }}
                          icon={faTrash}
                        />
                      }
                      danger
                      onClick={() => {
                        confirm();
                      }}
                      loading={loading}
                      disabled={isChange}
                      type="primary"
                    >
                      Xoá
                    </Button>
                  ) : null}
                  <Button
                    style={{ marginTop: 15, marginLeft: 15, marginRight: 15 }}
                    icon={
                      <FontAwesomeIcon
                        style={{ marginRight: 10 }}
                        icon={faQrcode}
                      />
                    }
                    type="primary"
                    onClick={() => setIsOpenAttendance(true)}
                  >
                    Điểm Danh
                  </Button>
                </div>
              </div>
              {isShowPreview ? (
                <div>
                  <hr />
                  <Preview value={value} />
                </div>
              ) : null}
              <div>
                <hr />
                <Tabs defaultActiveKey="1" className="container">
                  <TabPane tab="Đăng Ký Tham Gia" key="1">
                    <h3>Danh sách đăng ký tham gia </h3>
                    {/* //({countCheckIn}/{registerList.length}) */}
                    {registerList ? (
                      <Table
                        key={registerList.id}
                        columns={columns}
                        dataSource={registerList}
                        pagination={{
                          onChange: (page, pageSize) => {
                            pagination(page, pageSize);
                          },
                          current: page,
                          pageSize: pageSize,
                          total: registerList.length,
                        }}
                        scroll={{ x: 800 }}
                      />
                    ) : (
                      <Result
                        status="404"
                        title="Rỗng!"
                        subTitle="Không tìm thấy ứng viên nào."
                      />
                    )}
                  </TabPane>
                  <TabPane tab="Xin Phép Vắng" key="2">
                    <h3>Danh sách xin vắng </h3>
                    {/* ({leaveRegistration.length}) */}
                    {leaveRegistration ? (
                      <Table
                        key={leaveRegistration.id}
                        columns={leaveColumns}
                        dataSource={leaveRegistration}
                        pagination={{
                          onChange: (page, pageSize) => {
                            leavePagination(page, pageSize);
                          },
                          current: leavePage,
                          pageSize: leavePageSize,
                          total: leaveRegistration.length,
                        }}
                        scroll={{ x: 1000 }}
                      />
                    ) : (
                      <Result
                        status="404"
                        title="Rỗng!"
                        subTitle="Không tìm thấy ứng viên nào."
                      />
                    )}
                  </TabPane>
                </Tabs>
                {registerList || leaveRegistration ? (
                  <div>
                    <Modal
                      title="Gửi thông báo"
                      visible={isShowModalSend}
                      onOk={() => SendMail()}
                      onCancel={() => setIsShowModalSend(false)}
                      footer={[
                        <Button
                          key="back"
                          onClick={() => setIsShowModalSend(false)}
                          loading={isSending}
                        >
                          Huỷ
                        </Button>,
                        <Button
                          key="submit"
                          type="primary"
                          loading={isSending}
                          onClick={() => SendMail()}
                        >
                          Gửi
                        </Button>,
                      ]}
                    >
                      <p>
                        Bạn vừa thay đổi thông tin của hoạt động. Có lẽ rất
                        nhiều CTV không biết sự thay đổi này. Bạn có muốn gửi
                        email thông báo cho họ biết về sự thay đổi này không?
                      </p>
                      <Form form={sendemailform}>
                        <Form.Item
                          name="mailcontent"
                          label="Nội dung:"
                          labelCol={{ span: 7 }}
                          labelAlign="left"
                          disabled={isSending}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập nội dung bạn muốn gửi!",
                            },
                          ]}
                        >
                          <TextArea
                            rows={4}
                            placeholder="Nhập các thay đổi bạn muốn thông báo..."
                          />
                        </Form.Item>
                      </Form>
                    </Modal>
                    <Modal
                      title="Người hỗ trợ"
                      centered
                      visible={isShowSupporter}
                      onCancel={() => setIsShowSupporter(false)}
                      footer={[
                        <Button
                          key="back"
                          onClick={() => setIsShowSupporter(false)}
                        >
                          Đóng
                        </Button>,
                      ]}
                      width={1000}
                      style={{ top: 10 }}
                    >
                      <Row>
                        <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                          <Form form={supporter}>
                            <Form.Item
                              name="studentIdSP"
                              label="MSSV:"
                              disabled={isCreading}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập MSSV!",
                                },
                              ]}
                            >
                              <Input
                                maxLength={250}
                                placeholder="Mã số sinh viên"
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        <Col
                          span={12}
                          className={"col-md-5 col-md-offset-2"}
                          xs={24}
                          xl={12}
                        >
                          <Button
                            type="primary"
                            icon={
                              <FontAwesomeIcon
                                style={{ marginRight: 10 }}
                                icon={faUserPlus}
                              />
                            }
                            onClick={() => addSupporter()}
                            block
                          >
                            Thêm
                          </Button>
                        </Col>
                      </Row>
                      <Table
                        key={supporterList ? supporterList.id : []}
                        columns={supporterColumns}
                        dataSource={supporterList ? supporterList : []}
                        pagination={{
                          onChange: (page, pageSize) => {
                            paginationSP(page, pageSize);
                          },
                          current: pageSP,
                          pageSize: pageSizeSP,
                          total: supporterList ? supporterList.length : 0,
                        }}
                        style={{ margin: 15 }}
                        scroll={{ x: 900, y: 200 }}
                      />
                    </Modal>
                    <Modal
                      visible={isChangeCheckIn}
                      onOk={changeCheckIn}
                      onCancel={cancelModal}
                      centered
                      title={"Cập nhật thời gian điểm danh"}
                      footer={[
                        <Button
                          disabled={isLoadingChange}
                          key="back"
                          onClick={cancelModal}
                        >
                          Quay lại
                        </Button>,
                        <Button
                          key="submit"
                          type="primary"
                          loading={isLoadingChange}
                          onClick={onChangeCheckIn}
                        >
                          Cập nhật
                        </Button>,
                      ]}
                    >
                      <Form form={formChange}>
                        <Form.Item
                          name="changeDate"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập thời gian !",
                            },
                          ]}
                          style={{ textAlign: "left" }}
                        >
                          <RangePicker
                            showTime
                            style={{
                              width: "100%",
                            }}
                          />
                        </Form.Item>
                        <Form.Item name="isSetFullList">
                          <Checkbox
                            defaultChecked={isCheckAll}
                            onChange={(e) => onChangeCheckBox(e)}
                          >
                            Áp dụng thời gian ra cho toàn bộ danh sách.
                          </Checkbox>
                        </Form.Item>
                      </Form>
                    </Modal>
                    {/* Show modal send chứng nhận */}
                    <Modal
                      visible={isShowCertificateModal}
                      onOk={() => setIsShowCertificateModal(false)}
                      onCancel={() => setIsShowCertificateModal(false)}
                      centered
                      title={"Gửi giấy chứng nhận Online"}
                      footer={[
                        <Button
                          disabled={isLoadingChange}
                          key="back"
                          onClick={() => {
                            setIsShowCertificateModal(false);
                          }}
                          loading={sending}
                        >
                          Quay lại
                        </Button>,
                        <Button
                          key="submit"
                          type="primary"
                          loading={sending}
                          onClick={() => {
                            setIsShowCertificateModal(false);
                            setSending(true);
                            onSendMail();
                          }}
                        >
                          Gửi
                        </Button>,
                      ]}
                    >
                      {certificatePath ? (
                        <div className="container">
                          <Image
                            width={"100%"}
                            key={timestamp}
                            src={certificatePath}
                          />
                          <Button
                            type="primary"
                            onClick={() => {
                              deleteFile();
                            }}
                          >
                            Xoá ảnh
                          </Button>
                        </div>
                      ) : (
                        <Upload
                          accept="image/*"
                          onChange={handleOnChangeCertificate}
                          onPreview={onPreviewCertificate}
                          customRequest={uploadImage}
                          defaultFileList={defaultFileListCertificate}
                          className="upload-list-inline"
                          listType="picture-card"
                          maxCount={1}
                        >
                          {defaultFileListCertificate.length < 1 && "+ Tải lên"}
                        </Upload>
                      )}
                      <Form form={formChangeCertificate}>
                        <Row>
                          <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                            <Form.Item
                              style={{ marginTop: 15 }}
                              label="Toạ độ tên"
                              name={"locationY"}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập toạ độ tên!",
                                },
                              ]}
                            >
                              <Input
                                defaultValue={520}
                                onChange={() => onChangeLocationOrSize()}
                                type={"number"}
                                min={0}
                                placeholder="Toạ độ tên"
                              ></Input>
                            </Form.Item>
                          </Col>
                          <Col
                            span={12}
                            className={"col-md-5 col-md-offset-2"}
                            xs={24}
                            xl={12}
                          >
                            <Form.Item
                              style={{ marginTop: 15 }}
                              label="Cỡ chữ"
                              name={"fontsize"}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập cỡ chữ!",
                                },
                              ]}
                            >
                              <Input
                                defaultValue={52}
                                onChange={() => onChangeLocationOrSize()}
                                type={"number"}
                                min={0}
                                placeholder="Cỡ chữ"
                              ></Input>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </Modal>
                    {/* Show change Member */}
                    <Modal
                      visible={isShowChangeMember}
                      onOk={changeCheckIn}
                      onCancel={() => setIsShowChangeMember(false)}
                      centered
                      title={"Cập nhật thông tin thành viên"}
                      footer={[
                        <Button
                          disabled={registing}
                          key="back"
                          onClick={() => setIsShowChangeMember(false)}
                        >
                          Đóng
                        </Button>,
                        <Button
                          key="submit"
                          type="primary"
                          loading={registing}
                          onClick={() => onChangeMember()}
                        >
                          Cập nhật
                        </Button>,
                      ]}
                      width={1000}
                    >
                      <Form form={formChangeMember}>
                        <Row>
                          <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                            <Form.Item
                              name="firstname"
                              label="Họ & tên đệm:"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập họ & tên đệm!",
                                },
                              ]}
                            >
                              <Input
                                disabled={registing}
                                placeholder="Nhập họ và tên đệm"
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
                              name="lastname"
                              label="Tên:"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập tên!",
                                },
                              ]}
                            >
                              <Input
                                disabled={registing}
                                placeholder="Nhập Tên"
                                maxLength={7}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                            <Form.Item
                              name="phonenumber"
                              label="Số điện thoại:"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập số điện thoại!",
                                },
                              ]}
                            >
                              <Input
                                disabled={registing}
                                placeholder="Nhập số điện thoại"
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
                              name="email"
                              label="Email:"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập email!",
                                },
                                {
                                  type: "email",
                                  message: "Email không hợp lệ!",
                                },
                              ]}
                            >
                              <Input
                                disabled={registing}
                                placeholder="Nhập Email"
                                maxLength={100}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                            <Form.Item
                              name="studentid"
                              label="Mã số sinh viên:"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập mã sinh viên!",
                                },
                              ]}
                            >
                              <Input
                                disabled={registing}
                                placeholder="Nhập mã sinh viên"
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
                            {/* Mã lớp */}
                            <Form.Item
                              name="classname"
                              label="Lớp:"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập tên lớp!",
                                },
                              ]}
                            >
                              <Input
                                disabled={registing}
                                placeholder="Nhập tên lớp"
                                maxLength={15}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </Modal>
                    {currentMember ? (
                      <Modal
                        visible={isShowAddScore}
                        onOk={addScore}
                        onCancel={() => setIsShowAddScore(false)}
                        centered
                        title={"Thêm điểm cộng"}
                        footer={[
                          <Button
                            disabled={registing}
                            key="back"
                            onClick={() => setIsShowAddScore(false)}
                          >
                            Đóng
                          </Button>,
                          <Button
                            key="submit"
                            type="primary"
                            loading={registing}
                            onClick={() => addScore()}
                          >
                            Cập nhật
                          </Button>,
                        ]}
                      >
                        <Form form={formAddScore}>
                          <Row>
                            <Col
                              span={24}
                              className={"col-md-5"}
                              xs={24}
                              xl={24}
                            >
                              <Form.Item name="fullname" label="Họ & tên:">
                                <Input
                                  disabled={true}
                                  defaultValue={
                                    currentMember.firstName +
                                    " " +
                                    currentMember.lastName
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col
                              span={24}
                              className={"col-md-5"}
                              xs={24}
                              xl={24}
                            >
                              <Form.Item
                                name="score"
                                label="Điểm:"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập điểm!",
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={registing}
                                  step={0.1}
                                  placeholder="Nhập điểm"
                                  min={0.1}
                                  max={24.0}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row>
                            <Col
                              span={24}
                              className={"col-md-5"}
                              xs={24}
                              xl={24}
                            >
                              <Form.Item
                                name="reason"
                                label="Lý do:"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập lý do!",
                                  },
                                ]}
                              >
                                <Input
                                  disabled={registing}
                                  placeholder="Nhập lý do"
                                  maxLength={64}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </Modal>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <Result
              status={"500"}
              title={"Hoạt động không tồn tại!"}
              subTitle={"Không có hoạt động nào!"}
            />
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Button,
  message,
  Row,
  Col,
  notification,
  Form,
  Card,
} from "antd";
import Cookies from "js-cookie";

import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  ACCOUNT_ID,
  CAPTCHA_TOKEN_SLINK,
  MEMBER_ID,
  SetCooikeData,
  GetCookieData,
} from "../Helper/CookieHelper";
import { API_URL } from "../Helper/TextHelper";
import {
  UserOutlined,
  LockOutlined,
  SearchOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";

const ShortLink = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginform] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

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
      return;
    }

    if (data.errorsCode === 200001) {
      openNotificationWithIcon(
        "error",
        "Thông báo hệ thống",
        "Hệ thống đang bảo trì, vui lòng quay lại sau ít phút."
      );
      // Route to SYSTEM_MAINTENANCE page
    } else {
      openNotificationWithIcon("error", "Ối dồi ôi, lỗi rồi", data.errors[0]);
    }
  };
  // Hàm gọi API tạo Captcha
  const fetchCaptcha = async () => {
    var token = GetCookieData(CAPTCHA_TOKEN_SLINK);
    if (token === null || token === undefined) {
      token = "";
    }
    const headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    var requestData = {
      token: token,
    };

    await axios
      .post(API_URL + "api/Account/GetCaptcha", JSON.stringify(requestData), {
        headers,
      })
      .then((response) => {
        if (response.data.isSuccess === true) {
          setCaptchaToken(response.data.dataValue.token);

          setCaptchaImage(response.data.dataValue.captchaPath);
          // Cookies.set('tokenCaptcha', response.data.dataValue.token, { path: '/', expires: 7 });
          SetCooikeData(CAPTCHA_TOKEN_SLINK, response.data.dataValue.token);
        } else {
          errorHelper(response.data);
        }
      })
      .catch((response) => {
        errorHelper();
      });
  };

  // Hàm gọi API tạo Shortlink
  const createShortLink = async () => {
    try {
      setLoading(true);
      var token = GetCookieData(CAPTCHA_TOKEN_SLINK);
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
      };
      var requestData = {
        url: originalUrl,
        captchaToken: token,
        captchaCode: captchaCode,
      };
      console.log(originalUrl);
      console.log(JSON.stringify(requestData));
      const response = await axios.post(
        API_URL + "api/ShortLink/CreateShortLink",
        JSON.stringify(requestData),
        { headers }
      );
      setShortLink(response.data.dataValue.keyCode);
      message.success("Short link created successfully!");
    } catch (error) {
      console.error("Error creating short link:", error);
      message.error("Failed to create short link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API kiểm tra Shortlink
  const checkShortLink = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL + "api/ShortLink/GetShortLink", {
        shortLink,
      });
      if (response.data.isSuccess) {
        message.success("Short link exists:", response.data.dataValue.keyCode);
      } else {
        createShortLink();
      }
    } catch (error) {
      console.error("Error checking short link:", error);
      message.error("Failed to check short link. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = () => {
    const linkToCopy = "http://localhost:3000/" + shortLink;
    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        message.success("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying link to clipboard:", error);
        message.error("Failed to copy link to clipboard.");
      });
  };
  useEffect(() => {
    fetchCaptcha();
    // Output: /dtusvctool/short-link
  }, []);
  return (
    <div
      style={{
        width: 400,
        marginLeft: "30%",
        marginTop: "2%",
      }}
    >
      <div>
        <Input
          placeholder="Enter URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
        />
      </div>
      <div style={{ display: "flex", marginTop: "1%", marginBottom: "1%" }}>
        <img
          style={{ width: 100, height: 32 }}
          src={API_URL + captchaImage}
          alt="Captcha"
        />
        <Input
          placeholder="Enter Captcha"
          value={captchaCode}
          onChange={(e) => setCaptchaCode(e.target.value)}
        />
      </div>

      <div>
        <Button type="primary" onClick={createShortLink} loading={loading}>
          Create/Check Shortlink
        </Button>
      </div>

      {shortLink && (
        <div style={{ display: "flex", justifycontent: "space-between" }}>
          <strong>
            Short link:{" "}
            <a
              href={" http://localhost:3000/" + shortLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:3000/{shortLink}
            </a>{" "}
          </strong>{" "}
          <Button onClick={copyToClipboard}>Copy Link</Button>
        </div>
      )}
    </div>
  );
};

export default ShortLink;

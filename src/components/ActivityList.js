import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
  Tag,
  Layout,
  Card,
  Result,
  message,
  Pagination,
  Row,
  Col,
  Button,
} from "antd";
import axios from "axios";
import "../assets/styles/memberrigister.css";
import moment from "moment";
import "../assets/styles/firstsignin.css";
import { Route, NavLink, Routes } from "react-router-dom";
import { API_URL, GetFullPath } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import { connect } from "react-redux";
import { login, logout } from "../Redux/actions/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ActivityAdminTopic from "./ActivityAdminTopic";

const TITLE = "Danh sách hoạt động";

const ActivityList = ({
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
}) => {
  const { Content, Footer, Header } = Layout;

  const [newspaperList, setNewspaperList] = useState(null);
  const [page, setPage] = useState(0);
  const [pageCout, setPageCout] = useState(1);

  const [isError500, setIsError500] = useState(true);
  const [errorMess, setErrorMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newsCount, setNewsCount] = useState(0);
  const ActivityCard = (props) => {
    return (
      <NavLink
        to={
          "/dashboard/activities-manager/activitieslist?activityId=" +
          props.dataFromParent.id
        }
        style={{ textDecoration: "none" }}
      >
        <div className="container">
          <Card
            title={props.dataFromParent.recruitName}
            bordered={true}
            style={{ cursor: "pointer", margin: 10 }}
          >
            <Row align="middle">
              <Col span={18} xs={24} xl={18}>
                <Row span={24}>
                  <Col span={24} className={"col-md-5"} xs={24} xl={24}>
                    <p>
                      <h6 style={{ textAlign: "left", fontWeight: 600 }}>
                        {props.dataFromParent.title}
                      </h6>
                    </p>
                  </Col>
                </Row>
                <Row span={24}>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <p>
                      <h6 style={{ textAlign: "left" }}>
                        Ngày diễn ra:{" "}
                        {moment(props.dataFromParent.startDate).format(
                          "HH:mm:ss DD-MM-YYYY"
                        )}
                      </h6>
                    </p>
                  </Col>
                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                  >
                    <p>
                      <h6 style={{ textAlign: "left" }}>
                        Ngày kết thúc:
                        {moment(props.dataFromParent.endDate).format(
                          "HH:mm:ss DD-MM-YYYY"
                        )}
                      </h6>
                    </p>
                  </Col>
                </Row>
                <Row span={24}>
                  <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                    <p>
                      <h6 style={{ textAlign: "left" }}>
                        Hạn đăng ký:{" "}
                        {moment(
                          props.dataFromParent.registrationDealine
                        ).format("HH:mm:ss DD-MM-YYYY")}
                      </h6>
                    </p>
                  </Col>
                  <Col
                    span={12}
                    className={"col-md-5 col-md-offset-2"}
                    xs={24}
                    xl={12}
                  >
                    <h6 style={{ textAlign: "left" }}>
                      Loại hoạt động:{" "}
                      <Tag
                        color={
                          props.dataFromParent.isPublic ? "#87d068" : "#f50"
                        }
                      >
                        {props.dataFromParent.isPublic ? "Công khai" : "Nội bộ"}
                      </Tag>
                    </h6>
                  </Col>
                </Row>
                <Row span={24}>
                  <Col span={24} className={"col-md-5"} xs={24} xl={24}>
                    <h6 style={{ textAlign: "left" }}>
                      Người tạo:{" "}
                      <Tag color={"#87d068"}>
                        {props.dataFromParent.createrName}
                      </Tag>
                    </h6>
                  </Col>
                </Row>
              </Col>
              <Col span={6} xs={24} xl={6}>
                <img
                  src={API_URL + props.dataFromParent.posterPath}
                  style={{ maxHeight: 100, textAlign: "center" }}
                />
              </Col>
            </Row>
          </Card>
        </div>
      </NavLink>
    );
  };

  const getActivity = async (pageInput) => {
    setLoading(true);
    const token = GetCookieData(ACCESS_TOKEN);
    const config = {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: "Bearer " + token,
    };
    var requestData = {
      x_nPageIndex: pageInput,
      x_nPageSize: 20,
    };
    await axios
      .get(API_URL + "api/Activities/GetListActivities", {
        params: requestData,
        headers: config,
      })
      .then((response) => {
        if (response.data.isSuccess) {
          var totalNews = parseInt(response.data.dataCount);
          setNewsCount(totalNews);
          var totalPage = Math.ceil(totalNews / 20);
          setPageCout(totalPage);
          setNewspaperList(response.data.dataValue);
        } else {
          setIsError500(true);
          setErrorMess(response.data.errors);
        }
        setLoading(false);
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");
        setLoading(false);
        setIsError500(false);
        setErrorMess("Mất kết nối với máy chủ");
      });
  };

  const onChangePage = (page) => {
    setPage(page - 1);
    getActivity(page - 1);
  };

  useEffect(() => {
    getActivity(page);
  }, []);

  function AllActivity() {
    return (
      <div>
        {loading ? (
          <div>
            <Card loading={loading} />
            <Card loading={loading} />
            <Card loading={loading} />
          </div>
        ) : (
          <div>
            {permission.permissions.includes(2007) ? (
              <Row>
                <Col span={24} xs={24} xl={24}>
                  <NavLink
                    to={"/dashboard/activities-manager/create-activity"}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      style={{ float: "right" }}
                      type={"primary"}
                      icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                      Tạo Mới
                    </Button>
                  </NavLink>
                </Col>
              </Row>
            ) : null}
            {newspaperList ? (
              newspaperList.map((item) => (
                <ActivityCard dataFromParent={item} />
              ))
            ) : (
              <Result
                status="404"
                title="Không tìm thấy dữ liệu"
                subTitle="Hiện tại không có hoạt động nào!"
              />
            )}
          </div>
        )}
        <Pagination
          style={{ marginTop: 15 }}
          total={newsCount}
          showTotal={(total, range) => `${range[0]}->${range[1]} / ${total}`}
          defaultPageSize={20}
          defaultCurrent={page}
          onChange={onChangePage}
          showSizeChanger={false}
        />
      </div>
    );
  }

  return (
    <div className="container card-body" style={{ background: "#fff" }}>
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <Layout style={{ minHeight: "85vh" }}>
        <Content>
          <Layout style={{ background: "#fff" }}>
            <Content>
              <div style={{ minHeight: "70vh" }}>
                <Routes>
                  {/* <Route path={`/activitieslist?`} element={ <ActivityAdminTopic />}/> */}
                  <Route path={"/"} element={<AllActivity />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Content>
      </Layout>
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

export default connect(mapStateToProps, mapDispatchToProps)(ActivityList);

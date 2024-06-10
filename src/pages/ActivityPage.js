import { Helmet } from "react-helmet";
import React, { useEffect, useState } from "react";
import { message, Layout, Row, Col, Card, Skeleton, Result, Tag } from "antd";
import axios from "axios";
import moment from "moment";
import "../assets/styles/newspaper.css";
import { API_URL, GetFullPath } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import { Route, NavLink, Routes } from "react-router-dom";
import ActivityTopic from "../components/ActivityTopic";

function Activity() {
  const TITLE = "Hoạt động";

  const { Footer } = Layout;
  const [loading, setLoading] = useState(false);
  const [activityEnded, setActivityEnded] = useState(null);
  const [activityInProgress, setActivityInProgress] = useState(null);
  const [data, setData] = useState(null);
  const [isError500, setIsError500] = useState(true);
  const [errorMess, setErrorMess] = useState(null);

  const GetListActivitiesAndEvent = async () => {
    setLoading(true);
    const token = GetCookieData(ACCESS_TOKEN);
    var config = null;
    if (token !== null && token !== undefined) {
      config = {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: "Bearer " + token,
      };
    } else {
      config = {
        "Content-Type": "application/json",
        accept: "*/*",
      };
    }
    var requestData = {
      x_nPageIndex: 0,
      x_nPageSize: 20,
    };
    await axios
      .get(API_URL + "api/Activities/GetListActivities", {
        params: requestData,
        headers: config,
      })
      .then((response) => {
        console.log(response.data);
        if (response.data.isSuccess) {
          setData(response.data.dataValue);
          //console.log(response.data);
          var actiEnd = [];
          var actiProgress = [];
          response.data.dataValue.forEach((item) => {
            if (!item.isRegistered) {
              if (moment(item.endDate).add(7, "hours") > new Date()) {
                actiProgress.push(item);
              } else {
                actiEnd.push(item);
              }
            } else {
              actiProgress.push(item);
            }
          });
          if (actiEnd.length > 0) {
            actiEnd = actiEnd
              .sort((a, b) => {
                return (
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime()
                );
              })
              .reverse();
            setActivityEnded(actiEnd);
          }
          if (actiProgress.length > 0) {
            setActivityInProgress(actiProgress);
          }
          setLoading(false);
        } else {
          // console.log(response.data.responseData);
          setLoading(false);
          setIsError500(true);
          setErrorMess(response.data.errors);
          message.error(response.data.errors);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");
        setLoading(false);
        setIsError500(false);
        setErrorMess("Mất kết nối với máy chủ");
      });
  };

  function AllNews() {
    return (
      <div>
        <div>
          {activityInProgress !== null && activityInProgress.length > 0 ? (
            <div>
              <h5
                style={{
                  textAlign: "left",
                  marginTop: 20,
                  marginLeft: 20,
                  fontWeight: 600,
                }}
              >
                Hoạt động đang diễn ra
              </h5>
              <hr />
              {activityInProgress.map((item) => {
                return (
                  <NavLink
                    style={{ textDecoration: "none" }}
                    to={"/activities/activity?activityid=" + item.id}
                  >
                    <Card
                      className="hotnews"
                      style={{ margin: 10, width: "100%" }}
                    >
                      <Row align="middle">
                        <Col span={8} xs={8} xl={8}>
                          <img src={API_URL + item.posterPath} />
                        </Col>
                        <Col span={16} xs={16} xl={16}>
                          <p
                            style={{
                              textAlign: "left",
                              marginLeft: 10,
                              fontWeight: 600,
                              maxHeight: 20,
                              overflow: "hidden",
                            }}
                          >
                            {item.title}
                          </p>
                          <p style={{ textAlign: "left", marginLeft: 10 }}>
                            <Tag
                              color={
                                moment(data.registrationDeadline).add(
                                  7,
                                  "hours"
                                ) > new Date()
                                  ? "#108ee9"
                                  : "#f50"
                              }
                            >
                              {moment(data.registrationDeadline).add(
                                7,
                                "hours"
                              ) > new Date()
                                ? "Có thể đăng ký"
                                : "Hết hạn đăng ký"}
                            </Tag>
                            {!item.isPublic ? (
                              <Tag color={"#f50"}>Nội bộ</Tag>
                            ) : null}
                          </p>
                          <p style={{ textAlign: "left", marginLeft: 10 }}>
                            Diễn ra từ:{" "}
                            {moment(item.startDate).format(
                              "HH:mm:ss DD-MM-YYYY"
                            )}
                          </p>
                          <p style={{ textAlign: "left", marginLeft: 10 }}>
                            Đến:{" "}
                            {moment(item.endDate).format("HH:mm:ss DD-MM-YYYY")}
                          </p>
                          <p style={{ textAlign: "left", marginLeft: 10 }}>
                            Hạn cuối đăng ký:{" "}
                            {moment(item.registrationDeadline).format(
                              "HH:mm:ss DD-MM-YYYY"
                            )}
                          </p>
                          <p style={{ textAlign: "left", marginLeft: 10 }}>
                            Địa điểm:{" "}
                            {item.address.specificAddress +
                              ", " +
                              item.address.ward.wardName +
                              ", " +
                              item.address.district.districtName +
                              ", " +
                              item.address.province.provinceName}
                          </p>
                        </Col>
                      </Row>
                    </Card>
                  </NavLink>
                );
              })}
            </div>
          ) : null}
        </div>
        <div>
          {activityEnded !== null && activityEnded.length > 0 ? (
            <div style={{ marginBottom: 10, width: "100%" }}>
              <h5
                style={{
                  textAlign: "left",
                  marginTop: 20,
                  marginLeft: 20,
                  fontWeight: 600,
                }}
              >
                Các hoạt động khác
              </h5>
              <hr />
              {activityEnded.map((item) => {
                return (
                  <NavLink
                    to={"/activities/activity?activityid=" + item.id}
                    style={{ textDecoration: "none" }}
                  >
                    <Card
                      title={item.recruitName}
                      bordered={true}
                      style={{ cursor: "pointer", margin: 10 }}
                    >
                      <Row align="middle">
                        <Col span={16} xs={24} xl={16}>
                          <Row span={24}>
                            <Col
                              span={24}
                              className={"col-md-5"}
                              xs={24}
                              xl={24}
                            >
                              <p>
                                <h6
                                  style={{ textAlign: "left", fontWeight: 600 }}
                                >
                                  {item.title}
                                </h6>
                              </p>
                            </Col>
                          </Row>
                          <Row span={24} style={{ display: "flex" }}>
                            <Col
                              span={12}
                              className={"col-md-5"}
                              xs={24}
                              xl={12}
                            >
                              <p>
                                <h6
                                  style={{
                                    textAlign: "left",
                                    color: "red",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    marginRight: "50px",
                                  }}
                                >
                                  Ngày diễn ra:{" "}
                                  {moment(item.startDate).format(
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
                                <h6
                                  style={{
                                    textAlign: "left",
                                    color: "red",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    marginLeft: 50,
                                  }}
                                >
                                  Ngày kết thúc:
                                  {moment(item.endDate).format(
                                    "HH:mm:ss DD-MM-YYYY"
                                  )}
                                </h6>
                              </p>
                            </Col>
                          </Row>
                          <Row span={24}>
                            <Col
                              span={12}
                              className={"col-md-5"}
                              xs={24}
                              xl={12}
                            >
                              <p>
                                <h6
                                  style={{
                                    textAlign: "left",
                                    color: "red",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Hạn đăng ký:{" "}
                                  {moment(item.registrationDeadline).format(
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
                              <h6
                                style={{
                                  textAlign: "left",
                                  marginLeft: 50,
                                  display: "flex",
                                }}
                              >
                                <p>Loại hoạt động: </p>
                                <Tag
                                  style={{ height: 20 }}
                                  color={item.isPublic ? "#87d068" : "#f50"}
                                >
                                  {item.isPublic ? "Công khai" : "Nội bộ"}
                                </Tag>
                              </h6>
                            </Col>
                          </Row>
                        </Col>
                        <Col span={6} xs={24} xl={6}>
                          <img
                            src={API_URL + item.posterPath}
                            style={{ maxHeight: 100, textAlign: "center" }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </NavLink>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  useEffect(() => {
    GetListActivitiesAndEvent();
  }, []);
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <div>
        {loading ? (
          <Skeleton active />
        ) : (
          <div>
            {data !== null ? (
              <Layout>
                <div className="d-flex justify-content-center">
                  <div className="recruitform">
                    <div
                      className="container card"
                      style={{ minHeight: "42vh" }}
                    >
                      <Routes>
                        <Route
                          path={`/activity?*`}
                          element={<ActivityTopic />}
                        />
                        <Route path={"/"} element={<AllNews />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </Layout>
            ) : (
              <Result
                status={!isError500 ? "500" : "404"}
                title={errorMess}
                subTitle={
                  isError500
                    ? "Không có hoạt động nào!"
                    : "Hãy kiểm tra lại kết nối internet của bạn rồi thử lại !"
                }
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
export default Activity;

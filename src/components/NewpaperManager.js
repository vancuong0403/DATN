import { Helmet } from "react-helmet";
import { Tag, Layout, Card, message, Pagination, Row, Col,Button } from "antd";
import axios from "axios";
import "../assets/styles/memberrigister.css";
import "../assets/styles/firstsignin.css";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Routes,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../Helper/TextHelper";
import moment from "moment";
import NewspaperTopic from "./NewspaperTopic";
import { connect } from 'react-redux';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash, faPlus, faLockOpen
} from "@fortawesome/free-solid-svg-icons";
import CreateNewspaper from "./CreateNewspaper";

const NewspaperManager =({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isBroken, isToggled })=> {
  const { Content } = Layout;
  const [newspaperList, setNewspaperList] = useState(null);
  const [page, setPage] = useState(0);
  const [pageCout, setPageCout] = useState(1);
  const [isError500, setIsError500] = useState(true);
  const [errorMess, setErrorMess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newsCount, setNewsCount] = useState(0);
  const RecruitCard = (props) => {
    return (
      <NavLink
        to={
          "/dashboard/newspaper-manager/newspaper?newspapers=" +
          props.dataFromParent.id
        }
        style={{ textDecoration: "none", background: "#fff" }}
      >
        <div className="container">
          <Card
            title={props.dataFromParent.recruitName}
            bordered={true}
            style={{ cursor: "pointer", margin: 10, textDecoration: "none" }}
          >
            <Row align="middle">
              <Col span={18} xs={24} xl={18}>
                <Row>
                  <Col span={24} xs={24} xl={24}>
                    <p>
                      <h6 style={{ textAlign: "left", fontWeight: 600 }}>
                        {props.dataFromParent.title}
                      </h6>
                    </p>
                  </Col>
                  <Col span={24} xs={24} xl={24}>
                    <p>
                      <h6 style={{ textAlign: "left" }}>
                        Ngày đăng:{" "}
                        {/* <Moment
                          style={{ color: "red", fontWeight: 600 }}
                          date={props.dataFromParent.createDate}
                          format="HH:mm:ss DD-MM-YYYY"
                        /> */}{" "}
                        {moment(props.dataFromParent.createDate).format(
                          "DD/MM/yyyy HH:mm"
                        )}
                      </h6>
                    </p>
                  </Col>
                  <Col span={8} xs={24} xl={8}>
                    <h6 style={{ textAlign: "left" }}>
                      Người đăng:{" "}
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

  const getNewspaper = async () => {
    setLoading(true);
    const config = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    var requestData = {
      x_nPageIndex: page,
      x_nPageSize: 20,
    };
    await axios
      .get(API_URL + "api/Newspaper/GetNewspaperList", {
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
          setLoading(false);
        } else {
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

  const onChangePage = (page) => {
    setPage(page - 1);
    getNewspaper();
  };

  useEffect(() => {
    getNewspaper();
  }, []);

  function AllRecruit() {
    return (
      <div>
        {permission.permissions.includes(6001)?
          <Row>
            <Col span={24} xs={24} xl={24}>
              <NavLink to={"/dashboard/newspaper-manager/create-newspaper"} style={{ textDecoration: "none" }}>
                <Button style={{ float: "right" }}
                  type={"primary"}
                  icon={<FontAwesomeIcon icon={faPlus} />}>
                  Tạo Mới
                </Button>
              </NavLink>
            </Col> 
          </Row>
          : null
        }
        {newspaperList ? (
          newspaperList.map((item) => <RecruitCard dataFromParent={item} />)
        ) : (
          <div>
            <Card loading={true} />
            <Card loading={true} />
            <Card loading={true} />
          </div>
        )}
        <Pagination
          style={{ marginTop: 15 }}
          total={newsCount}
          showTotal={(total, range) => `${range[0]}->${range[1]} / ${total}`}
          defaultPageSize={20}
          defaultCurrent={1}
          onChange={onChangePage}
          showSizeChanger={false}
        />
      </div>
    );
  }

  return (
    <div className="container card-body" style={{ background: "#fff" }}>
      <Helmet>
        <title>Quản Lí Tin Tức</title>
      </Helmet>
      <Layout style={{ minHeight: "85vh" }}>
        <Content>
          <Layout style={{ background: "#fff" }}>
            <Content>
              <div style={{ minHeight: "70vh" }}>
                <Routes>
                  <Route path={"/newspaper*"} element={<NewspaperTopic />} />
                  <Route path={"/create-newspaper"} element={<CreateNewspaper />} />
                  <Route path={"/"} element={<AllRecruit />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Content>
      </Layout>
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

export default connect(mapStateToProps, mapDispatchToProps)(NewspaperManager);


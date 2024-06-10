import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { API_URL } from "../Helper/TextHelper";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { Card, Col, Result, Row, Tag, Typography } from "antd";
import ApplyForMember from "../components/ApplyForMember";

function Recruitment() {
  const [data, setData] = useState(null);
  console.log("data", data);
  useEffect(() => {
    const strApiURL = `${API_URL}api/Recruitment/GetRecruitmentValid`;
    let headers = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    axios
      .get(strApiURL, {
        withCredentials: true,
        headers: headers,
        credentials: "same-origin",
      })
      .then((response) => {
        console.log("res", response);
        setData(response.data.dataValue);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <div>
      <Helmet>
        <title>Tuyển Thành Viên</title>
      </Helmet>
      {data ? (
        <div>
          <Card style={{ paddingLeft: "2%" }}>
            <div style={{ margin: 15 }}>
              <div className="newspaper">
                <h4 style={{ fontWeight: 600 }}>{data.title}</h4>
                <div class="ql-container ql-snow">
                  <Row>
                    <Col span={4} xs={0} xl={4} />
                    <Col span={6} xs={24} xl={6} style={{ textAlign: "left" }}>
                      <div>
                        <Typography
                          variant="body2"
                          style={{ fontWeight: "bold" }}
                        >
                          Ngày bắt đầu:{" "}
                          {moment(data.startTime).format("DD/MM/yyyy HH:mm")}
                        </Typography>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <Typography
                          variant="body2"
                          style={{ fontWeight: "bold" }}
                        >
                          Ngày kết thúc:{" "}
                          {moment(data.endTime).format("DD/MM/yyyy HH:mm")}
                        </Typography>
                      </div>
                    </Col>
                    <Col span={11} xs={24} xl={11}>
                      <Typography
                        variant="body2"
                        style={{ fontWeight: "bold" }}
                      >
                        Người tạo: {data.createName}
                      </Typography>
                    </Col>
                  </Row>
                  <div
                    style={{ paddingLeft: "3%" }}
                    class="ql-editor"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                  />
                </div>
              </div>
            </div>
          </Card>
          <Row>
            <Col span={4} xs={1} xl={4} />
            <Col span={16} xs={22} xl={16}>
              <ApplyForMember x_objData={data} />
            </Col>
            <Col span={4} xs={1} xl={4} />
          </Row>
        </div>
      ) : (
        <Result status={"500"} title={"Không có đợt tuyển thành viên nào!"} />
      )}
    </div>
  );
}

export default Recruitment;

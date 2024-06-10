import { Helmet } from 'react-helmet';
import React, { useEffect, useState } from 'react';
import {

  message,
  Row,
  Col,
  Card,
  notification,
  Upload,
  Skeleton,
  Tag,
  Image,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Table,
  Tabs,
  InputNumber
} from "antd";
import { Typography } from '../components/StyledTypography';
import { API_URL, GetFullPath, RemoveVietnameseAccents } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { TabPane } from 'react-bootstrap';
import SponsorPayDlg from '../components/SponsorPayDlg';
import moment from 'moment';
import { Option } from 'antd/es/mentions';

function SponsorPagePage() {
  const { Option } = Select;
  const [api, contextHolder] = notification.useNotification();
  const [m_strTabKey, setTabKey] = useState("1");
  const [m_nIsSopnsor, setIsSopnsor] = useState(false);
  const [m_bIsShowDlg, setIsShowDlg] = useState(false);
  const [m_nIsLoading, setIsLoading] = useState(false);
  const [m_lstSponsors, setSponsors] = useState(null);
  const [m_objQrData, setQrData] = useState(null);
  const [m_strEvtId, setEvtId] = useState(null);
  const [m_lstSponsorType, setSponsorType] = useState(true);
  const [m_lstSponsorEvt, setSponsorTypeEvt] = useState(false);
  const [m_lstSponsorValue, setSponsorValue] = useState(1);
  const [m_objSponsorForm] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [listAc, setActSponsorshipAllowed] = useState(null);
  const [data, setData] = useState(null);
  const [listActSp, setListActSp] = useState(null)
  console.log("listActSp", listActSp);

  const openNotificationWithIcon = (type, strTitle, strDescription) => {
    api[type]({
      message: strTitle,
      description: strDescription,
    });
  };

  const GetListSponsor = async () => {
    const headers = {
      "Content-Type": "application/json",
      "accept": "/",
    }
    const strApiURL = `${API_URL}api/Sponsor/GetSponsorWhichOutActivity`;
    await axios.get(strApiURL, { withCredentials: true, headers: headers, credentials: 'same-origin' })
      .then((response) => {
        console.log('res', response);
        if (response.data.isSuccess === false) {
          openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", response.data.errors[0]);
        }
        else {
          setSponsors(response.data.dataValue);
          console.log(response.data.dataValue);
        }
      })
      .catch((error) => {
        openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", "Mất kết nối với máy chủ!");
      });
  }

  const CreateSponsorLink = async () => {
    setIsLoading(true);
    const strSponsorName = m_objSponsorForm.getFieldValue("fullName");
    const nAmount = m_objSponsorForm.getFieldValue("amount");
    const strContent = m_objSponsorForm.getFieldValue("content");
    const headers = {
      "Content-Type": "application/json",
      "accept": "/",
    }
    const requestData = {
      "sponsorName": strSponsorName ? strSponsorName : "",
      "amount": nAmount,
      "descript": strContent,
      "activityId": m_strEvtId ? m_strEvtId : "",
      "isAnonymous": m_lstSponsorType,
      "isSponsorActivities": m_lstSponsorEvt
    };
    const strApiURL = `${API_URL}api/Sponsor/CreateSponsorLink`;
    await axios.post(strApiURL, JSON.stringify(requestData), { headers })
      .then((response) => {
        if (response.data.isSuccess === false) {
          openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", response.data.errors[0]);
        }
        else {
          console.log(response.data.dataValue);
          setQrData(response.data.dataValue);
          setIsShowDlg(true);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        openNotificationWithIcon('error', "Ối dồi ôi, lỗi rồi", "Mất kết nối với máy chủ!");
        setIsLoading(false);
      });
  }

  const OnChangeTab = (key) => {
    setTabKey(key);
    if (key === "1") {
      setSponsorTypeEvt(false);
    }
    else {
      setSponsorTypeEvt(true);
    }
  }

  const onChangeSponsorType = (e) => {
    setSponsorValue(e.target.value);
    if (e.target.value === 1) {
      setSponsorType(true);
    }
    else {
      setSponsorType(false);
    }
  }

  const OnCancelDlg = (x_bValue) => {
    setIsShowDlg(false);
    if (x_bValue === true) {
      GetListSponsor();
      if (m_strEvtId) {
        handleChangeWard(m_strEvtId);
      }
      openNotificationWithIcon('success', "Thành công", "Bạn đã ủng hộ thành công!");
    }
  }

  const columns = [
    {
      title: "STT",
      dataIndex: "no1",
      key: "no1",
      width: 50,
      render: (value, item, index) => (page - 1) * pageSize + index + 1
    },
    {
      title: "Ngày ủng hộ",
      dataIndex: "createDate",
      key: "createDate",
      render: joinDate => <span>{moment(joinDate).format('DD/MM/yyyy hh:mm:ss')}</span>
    },
    {
      title: "Người ủng hộ",
      dataIndex: "sponsorName",
      key: "sponsorName",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Nội dung",
      dataIndex: "descript",
      key: "descript",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: status => <Tag color={status === "PAID" ? "success" : "error"}>{status}</Tag>
    },
  ]

  function pagination(page, pageSize) {
    setPage(page);
    setPageSize(pageSize);
  }

  useEffect(() => {
    GetListSponsor();
    GetListActivitiesAndEvent();
  }, [])
  const GetListActivitiesAndEvent = async () => {


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
        if (response.data.isSuccess) {
          setData(response.data.dataValue);

          var sponsorshipAllowed = [];
          response.data.dataValue.forEach((item) => {
            if (item.sponsorshipAllowed) {
              sponsorshipAllowed.push(item);
            }
          });

          if (sponsorshipAllowed.length > 0) {
            setActSponsorshipAllowed(sponsorshipAllowed);
          }

        } else {

          message.error(response.data.errors);
        }
      })
      .catch((response) => {
        message.error("Mất kết nối với máy chủ");




      });
  };

  const CreateEvt = (objAction) => {
    if (objAction) {
      return (
        <div>
          <Row>
            <Col span={4} xs={4} xl={4}>
              <img style={{ height: 25 }} src={GetFullPath(objAction.posterPath)} />
            </Col>
            <Col span={20} xs={20} xl={20}>
              <strong>{
                objAction.title
              }</strong>
            </Col>
          </Row>
        </div>
      );
    }
    return null;
  }

  const handleChangeWard = async (id) => {
    setEvtId(id);
    const token = GetCookieData(ACCESS_TOKEN);
    if (token !== null) {
      const config = {
        "Content-Type": "application/json",
        "accept": "*/*",
        "Authorization": 'Bearer ' + token
      }
      const request = {
        "x_strActivityId": id
      }
      await axios.get(API_URL + 'api/Sponsor/GetSponsorByActivity', { params: request, headers: config })
        .then((response) => {
          if (response.data.isSuccess) {
            console.log(response);
            setListActSp(response.data.dataValue)
          }
        })
        .catch((response) => {
          console.log(response);
        })
    }
  }

  return (
    <div>
      {contextHolder}
      <Helmet>
        <title>Quyên Góp</title>
      </Helmet>
      <SponsorPayDlg x_bIsShowDlg={m_bIsShowDlg} x_objData={m_objQrData} x_evtOnCloseDlg={OnCancelDlg} />
      <div className="userinfo-container" style={{ marginLeft: 15, marginRight: 15, marginBottom: 15, marginTop: 15 }}>
        <Card className='dashboard-header'>
          <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
            Quyên Góp
          </Typography>
        </Card>
        <Card style={{ marginTop: 15 }}>
          <Typography variant="subtitle1" fontWeight={500} color="#0098e5">
            Tạo Quyên Góp
          </Typography>
          <Form
            form={m_objSponsorForm}
            onFinish={CreateSponsorLink}
          >
            <Card style={{ marginTop: 15 }}>
              <Row>
                <Col span={12} xs={24} xl={12} style={{ paddingRight: 10, paddingLeft: 10 }}>
                  <Row>
                    <Col span={6} xs={24} xl={6} style={{ textAlign: "left" }}>
                      Hình Thức:
                    </Col>
                    <Col span={18} xs={24} xl={18}>
                      <Form.Item
                        name="sponsorType"
                        rules={[{ required: true, message: 'Vui lòng chọn hình thức!' }]}
                        style={{ float: "left" }}
                      >
                        <Radio.Group onChange={onChangeSponsorType} value={m_lstSponsorValue} disabled={m_nIsLoading}>
                          <Radio value={1}>Ẩn danh</Radio>
                          <Radio value={2}>Công khai</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} xs={24} xl={12} style={{ paddingRight: 10, paddingLeft: 10 }}>
                  <Row>
                    <Col span={3} xs={24} xl={3} style={{ textAlign: "left" }}>
                      Họ Và Tên:
                    </Col>
                    <Col span={21} xs={24} xl={21}>
                      <Form.Item
                        name="fullName"
                        style={{ textAlign: "left" }}
                      >
                        <Input placeholder="Nhập họ và tên" maxLength={40} disabled={m_lstSponsorType || m_nIsLoading} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} xs={24} xl={12} style={{ paddingRight: 10, paddingLeft: 10 }}>
                  <Row>
                    <Col span={6} xs={24} xl={6} style={{ textAlign: "left" }}>
                      Số Tiền:
                    </Col>
                    <Col span={18} xs={24} xl={18}>
                      <Form.Item
                        name="amount"
                        rules={[{
                          required: true,
                          message: 'Vui lòng nhập số tiền!',
                        }]}
                        style={{ textAlign: "left" }}
                      >
                        <InputNumber placeholder="Nhập số tiền" min={2000} max={2000000000} style={{ width: "100%" }} disabled={m_nIsLoading} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} xs={24} xl={12} style={{ paddingRight: 10, paddingLeft: 10 }}>
                  <Row>
                    <Col span={3} xs={24} xl={3} style={{ textAlign: "left" }}>
                      Nội Dung:
                    </Col>
                    <Col span={21} xs={24} xl={21}>
                      <Form.Item
                        name="content"
                        rules={[{
                          required: true,
                          message: 'Vui lòng nhập nội dung!',
                        }]}
                        style={{ textAlign: "left" }}
                      >
                        <Input placeholder="Nhập nội dung" maxLength={256} disabled={m_nIsLoading} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row style={{ marginTop: 20 }}>
                <Col span={8} xs={0} xl={8}>
                </Col>
                <Col span={8} xs={24} xl={8}>
                  <Form.Item>
                    <Button size="large"
                      style={{ marginTop: 5 }}
                      type="primary" block htmlType="submit"
                      loading={m_nIsLoading}
                    >Tạo Mã Thanh Toán</Button>
                  </Form.Item>
                </Col>
                <Col span={8} xs={0} xl={8}>
                </Col>
              </Row>
            </Card>
          </Form>
          <Tabs activeKey={m_strTabKey} onChange={OnChangeTab} type="card" style={{ marginTop: 15 }}>
            <TabPane tab="Ủng Hộ CLB" key="1">
              <Table
                columns={columns}
                dataSource={m_lstSponsors}
                pagination={{
                  onChange: (page, pageSize) => {
                    pagination(page, pageSize);
                  },
                  current: page,
                  pageSize: pageSize,
                  total: m_lstSponsors ? m_lstSponsors.length : 0
                }}
                scroll={{ x: 400 }} />
            </TabPane>
            <TabPane tab="Ủng Hộ Hoạt Động" key="2">
              <Form>
                <Form.Item
                  name="ward"
                  label="Hoạt động:"
                  labelCol={{ span: 7 }}
                  labelAlign="left"
                  rules={[
                    { required: true, message: "Vui lòng chọn hoạt động!" },
                  ]}
                >
                  <Select
                    style={{ width: "100%", padding: 0 }}
                    showSearch

                    className="container text-left"
                    placeholder="Chọn hoạt động"
                    optionFilterProp="children"

                    onChange={handleChangeWard}
                  >
                    {listAc != null ? (
                      listAc.map((ac) => (
                        <Option value={ac.id}>{CreateEvt(ac)}</Option>
                      ))
                    ) : (
                      <Option value="chon">Chọn Hoạt Động</Option>
                    )}
                  </Select>
                </Form.Item>
              </Form>
              <Table
                columns={columns}
                dataSource={listActSp}
                pagination={{
                  onChange: (page, pageSize) => {
                    pagination(page, pageSize);
                  },
                  current: page,
                  pageSize: pageSize,
                  total: listActSp ? listActSp.length : 0
                }}
                scroll={{ x: 400 }} />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

export default SponsorPagePage;
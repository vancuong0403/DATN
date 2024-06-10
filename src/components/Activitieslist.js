import React, {useEffect, useState} from 'react';
import { Helmet } from 'react-helmet';
import {Tag, Layout, Card, Result, message, Pagination, Row, Col} from 'antd';
import axios from 'axios';
import '../assets/styles/memberrigister.css';
import moment from 'moment';
import { ACCESS_TOKEN, REFRESH_TOKEN, ACCOUNT_ID, CAPTCHA_TOKEN, MEMBER_ID, SetCooikeData, GetCookieData } from "../Helper/CookieHelper";


import '../assets/styles/firstsignin.css';
    import {
        BrowserRouter as Router,
        Switch,
        Route,
        NavLink,
        Routes,
        
    } from "react-router-dom";
import { API_URL } from '../Helper/TextHelper';
// import ActivityAdminTopic from './ActivityAdminTopic';

const TITLE = "Danh sách hoạt động";

function ActivityList(){

    const { Content, Footer, Header } = Layout;
    
    const [newspaperList, setNewspaperList] = useState(null);
    const [page, setPage] = useState(0);
    const [pageCout, setPageCout] = useState(1);
   
    const [isError500, setIsError500] = useState(true);
    const [errorMess, setErrorMess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newsCount, setNewsCount] = useState(0);
    const ActivityCard = (props) =>{
        return(
            <NavLink to={"/activitieslist/" + props.dataFromParent.id}>
                <div className="container">
                    <Card title={props.dataFromParent.recruitName} bordered={true} style={{cursor: "pointer", margin: 10}}>
                        <Row align="middle">
                            <Col span={18} xs={24} xl={18}>
                                <Row span={24}>
                                    <Col span={24} className={"col-md-5"} xs={24} xl={24}>
                                        <p>
                                            <h6 style={{textAlign: "left", fontWeight: 600}}>{props.dataFromParent.title}</h6>
                                        </p>
                                    </Col>
                                </Row>
                                <Row span={24}>
                                    <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                        <p>
                                            <h6 style={{textAlign: "left"}}>Ngày diễn ra: {moment(props.dataFromParent.startDate).format('DD/MM/yyyy HH:mm')}</h6>
                                        </p>
                                    </Col>
                                    <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                        <p>
                                            <h6 style={{textAlign: "left"}}>Ngày kết thúc: {moment(props.dataFromParent.endDate).format('DD/MM/yyyy HH:mm')}</h6>
                                        </p>
                                    </Col>
                                </Row>
                                <Row span={24}>
                                    <Col span={12} className={"col-md-5"} xs={24} xl={12}>
                                        <p>
                                            <h6 style={{textAlign: "left"}}>Hạn đăng ký: {moment(props.dataFromParent.registrationDeadline).format('DD/MM/yyyy HH:mm')}</h6>
                                        </p>
                                    </Col>
                                    <Col span={12} className={"col-md-5 col-md-offset-2"} xs={24} xl={12}>
                                        <h6 style={{textAlign: "left"}}>Loại hoạt động: <Tag color={props.dataFromParent.isPublic?"#87d068":"#f50"}>{props.dataFromParent.isPublic?"Công khai":"Nội bộ"}</Tag></h6>
                                    </Col>
                                </Row>
                                <Row span={24}>
                                    <Col span={24} className={"col-md-5"} xs={24} xl={24}>
                                        <h6 style={{textAlign: "left"}}>Người tạo: <Tag color={"#87d068"}>{props.dataFromParent.createrName}</Tag></h6>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={6} xs={24} xl={6}>
                                <img src={API_URL + props.dataFromParent.posterPath} style={{maxHeight: 100, textAlign: "center"}}/>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </NavLink>
        );
    }

    const getActivity = async(pageInput) =>{
        setLoading(true);
        var token = GetCookieData(ACCESS_TOKEN);

        const config = {
            "Content-Type": "application/json",
            "accept": "*/*",
           
        }
        var requestData = {
            x_nPageIndex: 0,
            x_nPageSize: 20
        };
        await axios.get(API_URL+'api/Activities/GetListActivities', {params: requestData, headers: config})
        .then((response) =>{
            console.log(response.data);
            if(response.data.isSuccess){
                var totalNews = parseInt(response.data.dataCount);
                setNewsCount(totalNews);
                var totalPage = Math.ceil(totalNews/20);
                setPageCout(totalPage);
                setNewspaperList(response.data.dataValue);
                console.log("oke",newspaperList);
            }else{
                setIsError500(true);
                setErrorMess(response.data.errors);
            }
            setLoading(false);
        })
        .catch((response)=>{
            message.error("Mất kết nối với máy chủ");
            setLoading(false);
            setIsError500(false);
            setErrorMess("Mất kết nối với máy chủ");
        })
    }

    const onChangePage = page =>{
        setPage(page - 1);
        getActivity(page - 1);
    }

    useEffect(() => {
        getActivity(page);
    }, []);

    function AllActivity(){
        return(
            <div>
                {
                    loading?
                    <div>
                        <Card loading={loading}/>
                        <Card loading={loading}/>
                        <Card loading={loading}/>
                    </div>
                    :
                    <div>
                        {
                            newspaperList?
                            newspaperList.map((item) => <ActivityCard dataFromParent={item}/>)
                            :
                            <Result
                                status="404"
                                title="Không tìm thấy dữ liệu"
                                subTitle="Hiện tại không có hoạt động nào!"
                            />
                        }
                    </div>
                }
                <Pagination 
                    style={{marginTop: 15}}
                    total={newsCount} 
                    showTotal={(total, range) => `${range[0]}->${range[1]} / ${total}`}
                    defaultPageSize={20}
                    defaultCurrent={page}
                    onChange={onChangePage}
                    showSizeChanger={false}
                />
            </div>
        )
    }

    return(
        <div className="container card-body" style={{ background: "#fff"}}>
            
                <Helmet>
                    <title>{ TITLE }</title>
                </Helmet>   
                <Layout style={{minHeight: "85vh"}}>
                    <Header style={{background:"#fff"}}>
                        <p className={"activetitle"}>{ TITLE }</p>
                    </Header>
                    <Content>
                        <Layout style={{background: "#fff"}}>
                            <Content>
                            <div style={{minHeight: "70vh"}}>
                                <Routes>
                                    <Route path="/" element={<AllActivity/>} />
                                </Routes>
                                    {/* <Route path={`${match.path}/:topicId`}>
                                        <ActivityAdminTopic/>
                                    </Route> */}
                                    
                                        
                                    
                               
                            </div>
                            </Content>
                        </Layout>
                    </Content>
                    {/* <Footer style={{minWidth: "100%",  background: "#fff", textAlign: 'center', maxHeight: 10 }}>©2021 CLB Sinh Viên Tình Nguyện - ĐH Duy Tân</Footer> */}
                </Layout>
            
        </div>
    )
}
export default ActivityList;
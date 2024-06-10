import { Helmet } from 'react-helmet';
import React, {useEffect, useState} from 'react';
import { message, Layout, Row, Col, Card, Skeleton, Result } from 'antd';
import axios from 'axios';
import Moment from 'react-moment';
import Sliderbar from './Sliderbar';
import './css/newspaper.css';
    import {
        BrowserRouter as Router,
        Switch,
        Route,
        NavLink,
        useRouteMatch
    } from "react-router-dom";
import NewsTopic from './NewsTopic';
import ChatFacebook from './ChatFacebook';

function Newspaper(){
    const TITLE = "Tin Tức";
    const serverAPIIp = 'https://localhost:7169/'; 
    //const serverAPIIp = 'https://api.dtusvc.com/'; 
    const { Footer } = Layout;
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [firstNews, setFirstNews] = useState(null);
    const [hostNews, setHotNews] = useState(null);
    const [nomalNews, setNomalNews] = useState([]);
    const [data, setData] = useState(null);
    const [pageCout, setPageCout] = useState(1);
    let match = useRouteMatch();
    const [isError500, setIsError500] = useState(true);
    const [errorMess, setErrorMess] = useState(null);
    
    const getNewspaper = async() =>{
        setLoading(true);
        const config = {
            "Content-Type": "application/json",
            "accept": "*/*"
        }
        var requestData = {
            x_nPageIndex: page,
            x_nPageSize: 20
        };
        await axios.get(serverAPIIp + 'api/Newspaper/GetNewspaperList', {params: requestData, headers: config})
        .then((response) =>{
            console.log(response.data);
            if(response.data.isSuccess){
                var totalNews = parseInt(response.data.dataCount);
                var totalPage = Math.ceil(totalNews/20);
                setPageCout(totalPage);
                setData(response.data.dataValue);
                if(page === 0){
                    var newsCout = response.data.dataValue.length;
                    setFirstNews(response.data.dataValue[0]);
                    var hotnews = [];
                    var nomal = [];
                    if(newsCout > 3){
                        for(var i = 1; i < 4; i++){
                            hotnews.push(response.data.dataValue[i]);
                        }
                        setHotNews(hotnews);
                        for(var i = 4; i < newsCout; i++){
                            nomal.push(response.data.dataValue[i]);
                        }
                        setNomalNews(nomal);
                    }else{
                        for(var i = 1; i < newsCout; i++){
                            hotnews.push(response.data.dataValue[i]);
                            setHotNews(hotnews);
                        }
                    }
                    
                }else{
                    setNomalNews(response.data.dataValue);
                }
                setLoading(false);
            }else{
                setLoading(false);
                setIsError500(true);
                setErrorMess(response.data.errors);
                message.error(response.data.errors);
            }
        })
        .catch((response)=>{
            message.error("Mất kết nối với máy chủ");
            setLoading(false);
            setIsError500(false);
            setErrorMess("Mất kết nối với máy chủ");
        })
    }

    function AllNews(){
        return(
            <div>
                <h5 style={{textAlign:"left", marginTop: 20, marginLeft: 20,fontWeight: 600}}>Tin mới nhất</h5>
                <hr/>
                {
                    firstNews?
                    <NavLink to={"/newspaper/" + firstNews.id}>
                        <Row align="middle">
                            <Col span={12} xs={24} xl={12}>
                                <Card className="firstnews" >
                                    <img src={serverAPIIp + firstNews.posterPath}/>
                                    <h4 style={{textAlign:"left", marginTop: 10,fontWeight: 600}}>{firstNews.title}</h4>
                                    <h6 style={{textAlign:"left"}}>{"Ngày: "}<Moment date={firstNews.createDate} format="HH:mm:ss DD-MM-YYYY"/></h6>
                                    <div class="ql-container ql-snow" style={{maxHeight: 60, overflow: "hidden", border: "white"}}>
                                        <div style={{minHeight: "0vh"}} class="ql-editor" dangerouslySetInnerHTML={{ __html: firstNews.content }} />
                                    </div>
                                    <p style={{textAlign:"left", marginLeft: 10, marginBottom: 0}}>{"Người đăng: "}{firstNews.createrName}</p>
                                </Card>
                            </Col>
                            <Col span={12} xs={24} xl={12}>
                                <Row align="middle">
                                    <Col span={24} xs={24} xl={24}>
                                    {
                                        hostNews.map(item =>{
                                            return(
                                                <NavLink to={"/newspaper/" + item.id}>
                                                    <Card className='hotnews' style={{marginLeft: 10}}>
                                                        <Row align="middle">
                                                            <Col span={8} xs={8} xl={8}>
                                                                <img src={serverAPIIp + item.posterPath}/>
                                                            </Col>
                                                            <Col span={16} xs={16} xl={16}>
                                                                <p style={{textAlign:"left", marginLeft: 10, fontWeight: 600, maxHeight: 20, overflow: "hidden"}}>{item.title}</p>
                                                                <p style={{textAlign:"left", marginLeft: 10}}>{"Ngày: "}<Moment date={item.createDate} format="HH:mm:ss DD-MM-YYYY"/></p>
                                                                <p style={{textAlign:"left", marginLeft: 10, marginBottom: 0}}>{"Người đăng: "}{item.createrName}</p>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                </NavLink>
                                            );
                                        })
                                    }
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </NavLink>
                :null
                }
                {
                    nomalNews.length > 0?
                    <div style={{marginBottom: 10}}>
                        <h5 style={{textAlign:"left", marginTop: 20, marginLeft: 20,fontWeight: 600}}>Có thể bạn quan tâm</h5>
                        <hr/>
                        {
                            nomalNews.map(item =>{
                                return(
                                    <NavLink to={"/newspaper/" + item.id}>
                                        <Card className='hotnews' style={{margin: 10}}>
                                            <Row align="middle">
                                                <Col span={8} xs={8} xl={8}>
                                                    <img src={serverAPIIp + item.posterPath}/>
                                                </Col>
                                                <Col span={16} xs={16} xl={16}>
                                                    <p style={{textAlign:"left", marginLeft: 10, fontWeight: 600, maxHeight: 20, overflow: "hidden"}}>{item.title}</p>
                                                    <p style={{textAlign:"left", marginLeft: 10}}>{"Ngày: "}<Moment date={item.createDate} format="HH:mm:ss DD-MM-YYYY"/></p>
                                                    <div class="ql-container ql-snow" style={{maxHeight: 60, overflow: "hidden", border: "white"}}>
                                                        <div class="ql-editor" style={{overflow: "hidden"}} dangerouslySetInnerHTML={{ __html: item.content }} />
                                                    </div>
                                                    <p style={{textAlign:"left", marginLeft: 10, marginBottom: 0, marginTop: 10}}>{"Người đăng: "}{item.createrName}</p>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </NavLink>
                                );
                            })
                        }
                    </div>
                : <Result
                    status={isError500? "500" : "404"}
                    title={errorMess}
                    subTitle={isError500 
                    ? "Không tìm thấy dữ liệu rồi!\nNếu có bất kỳ thắc mắc nào hãy liên hệ cho BCN CLB để được giải đáp nhé!"
                    : "Hãy kiểm tra lại kết nối internet của bạn rồi thử lại !"}
                />
                
                }
            </div>
        );
    }

    useEffect(() => {
        getNewspaper();
    }, []);
    return(
        <>
            <Helmet>
                <title>{ TITLE }</title>
            </Helmet>
            <div>
                {
                    loading?
                    <Skeleton active/>
                    :
                    <div>
                        <Router>
                            <Layout>
                                <Sliderbar/>
                                <div className="d-flex justify-content-center">
                                    <div className="recruitform">
                                        <div className="container card">
                                            <Switch>
                                                    {/* <Route path={`${match.path}/newspaper/:topicId`}>
                                                        <NewsTopic/>
                                                    </Route> */}
                                                <Route path={`${match.path}/:newspaperId`}>
                                                    <NewsTopic/>
                                                </Route>
                                                <Route path={match.path}>
                                                    <AllNews/>
                                                </Route>
                                            </Switch>
                                            <ChatFacebook/>
                                        </div>
                                    </div>
                                </div>
                                <Footer style={{ textAlign: 'center', margin: '0 0 15px', maxHeight: 10 }}>©CLB Sinh Viên Tình Nguyện - ĐH Duy Tân</Footer>
                            </Layout>
                        </Router>
                    </div>
                }
            </div>
        </>
    )
}
export default Newspaper;
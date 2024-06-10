import {
    BrowserRouter as Router,
    useParams,
    useLocation
} from "react-router-dom";
import { Helmet } from 'react-helmet';
import React, {useEffect, useState, useRef}  from 'react';
import axios from 'axios';
import '../assets/styles/newspaper.css';
// import moment from 'moment';
import { Table, message, Layout, Row, Col, Card, Form, Button, Modal, Skeleton, Result, Space, Tag } from 'antd';
import moment from 'moment';
import { API_URL, GetFullPath } from "../Helper/TextHelper";

function NewsTopic(){
    let { newspaperId } = useParams();
    const [loading, setLoading] = useState(false);
    const [loadingAll, setLoadingAll] = useState(false);
    const [data, setData] = useState(null);
    const [isError500, setIsError500] = useState(true);
    const [errorMess, setErrorMess] = useState(null);
    const location = useLocation();
    const [m_strId, setId] = useState(null);
    const [newspaperList, setNewspaperList] = useState(null);

    const getNewspaper = async(x_strNewId) =>{
        setLoading(true);
        const config = {
            "Content-Type": "application/json",
            "accept": "*/*"
        }
        var requestData = {
            x_strNewspaperId: x_strNewId,
        };
        const strApiURL = `${API_URL}api/Newspaper/GetNewspaperById`;
        await axios.get(strApiURL,  { withCredentials: true, headers: config, params: requestData, credentials: 'same-origin' })
        .then((response) =>{
            if(response.data.isSuccess){
                console.log("ok");
                setData(response.data.dataValue);
                setLoading(false);
            }else{
                setLoading(false);
                message.error(response.data.errors);
                setIsError500(true);
                setErrorMess(response.data.errors);
            }
        })
        .catch((response)=>{
            message.error("Mất kết nối với máy chủ");
            setLoading(false);
            setIsError500(false);
            setErrorMess("Mất kết nối với máy chủ");
        })
    }

    useEffect(() => {
        console.log("load");
        const searchParams = new URLSearchParams(location.search);
        const strNewId = searchParams.get('newspaperid');
        setId(strNewId);
        console.log(strNewId);
        getNewspaper(strNewId);
    }, []);

    return(
        <div style={{margin: 15}}>
            {
                loading?
                <Skeleton active/>
                :
                <div style={{marginTop: 10}}>
                    {
                        data?
                        <div className="newspaper">
                            <h4 style={{fontWeight: 600}}>{data.title}</h4>
                            <img src={API_URL + data.posterPath}/>
                            <div class="ql-container ql-snow" style={{border: "white"}}>
                                <div style={{minHeight: "0vh"}} class="ql-editor" dangerouslySetInnerHTML={{ __html: data.content }} />
                            </div>
                            <p style={{textAlign:"left", marginLeft: 10}}>{"Theo: " + `${data.createrName}`}</p>
                            <p style={{textAlign:"left", marginLeft: 10}}>{"Ngày: "}{moment(data.createDate).format('HH:mm:ss DD-MM-YYYY')}</p>
                            {/* <div>
                                {
                                    loadingAll?
                                    <Skeleton active/>
                                    :
                                    <div>
                                    {
                                        newspaperList?
                                        <div>
                                            <hr/>
                                            <h5 style={{textAlign:"left", marginTop: 20, marginLeft: 20,fontWeight: 600}}>Xem thêm</h5>
                                            <hr/>
                                            {
                                                newspaperList.map(item =>{
                                                    return(
                                                        <div onClick={()=>{window.location.href= `${match.path.replace(":newspaperId", "")}${item.id}`;}}>
                                                            <Card className='hotnews' style={{margin: 10}}>
                                                                <Row align="middle">
                                                                    <Col span={8} xs={8} xl={8}>
                                                                        <img src={API_URL + item.posterPath}/>
                                                                    </Col>
                                                                    <Col span={16} xs={16} xl={16}>
                                                                        <p style={{textAlign:"left", marginLeft: 10, fontWeight: 600,}}>{item.title}</p>
                                                                        <p style={{textAlign:"left", marginLeft: 10}}>{"Ngày: "}<Moment date={item.createDate} format="HH:mm:ss DD-MM-YYYY"/></p>
                                                                        <p style={{textAlign:"left", marginLeft: 10, marginBottom: 0, marginTop: 10}}>{"Người đăng: "}{item.createrName}</p>
                                                                    </Col>
                                                                </Row>
                                                            </Card>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                        : null
                                    }
                                </div>
                                }
                            </div> */}
                        </div>
                        :
                        <Result
                            status={isError500? "500" : "404"}
                            title={errorMess}
                            subTitle={isError500 
                            ? "Không tìm thấy dữ liệu rồi!\nNếu có bất kỳ thắc mắc nào hãy liên hệ cho BCN CLB để được giải đáp nhé!"
                            : "Hãy kiểm tra lại kết nối internet của bạn rồi thử lại !"}
                        />
                    }
                </div>
            }
        </div>
    );
}
export default NewsTopic;
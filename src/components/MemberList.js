import { Helmet } from 'react-helmet';
import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Tabs
} from "antd";
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import { Typography } from './StyledTypography';
import MemberListExist from './MemberListExist';
import MemberOutList from './MemberOutList';
import MemberStatistics from './MemberStatistics';

const MemberList = ({ isLogin, fullName, avatarPath, permission, viewtoken, isdefaultpasswd, logout, login, isMyInfo, isBroken }) => {
    const { TabPane } = Tabs;
    const [page, setPage] = useState(<MemberListExist isBroken={isBroken} />);
    const [keyTab, setkeyTab] = useState("/memberactivity/");


    function onChangeTabs(key) {
        if (key === "/memberactivity/") {
            setkeyTab("/memberactivity/");
            setPage(<MemberListExist isBroken={isBroken} />);
        }
        if (key === "/memberout/") {
            setkeyTab("/memberout/");
            setPage(<MemberOutList isBroken={isBroken} />);
        }
        if (key === "/statistics/") {
            setkeyTab("/statistics/");
            setPage(<MemberStatistics isBroken={isBroken}/>);
        }
    }

    return (
        <div>
            <Helmet>
                <title>Danh Sách Thành Viên</title>
            </Helmet>
            <div className={'userinfo-main'} style={{ marginLeft: isBroken ? -30 : 15, marginRight: 15, marginBottom: 15, marginTop: 15 }}>
                <div className={'userinfo-container'}>
                    <Card className='dashboard-header'>
                        <Typography variant="subtitle1" fontWeight={700} color="#0098e5">
                            Danh Sách Thành Viên
                        </Typography>
                    </Card>

                    <Row style={{ marginTop: 15, marginBottom: 15, height: "100%" }}>
                        <Col span={24} xs={24} xl={24}>
                            <Card style={{ marginTop: 15, maxWidth: "88vw" }}>
                                <Tabs onChange={onChangeTabs} activeKey={keyTab} type="card">
                                    <TabPane tab="Thành Viên Hiện Tại" key="/memberactivity/">
                                        {
                                            page
                                        }
                                    </TabPane>
                                    <TabPane tab="Thành Viên Đã Rời" key="/memberout/">
                                        {
                                            page
                                        }
                                    </TabPane>
                                    <TabPane tab="Số Liệu Thống Kê" key="/statistics/">
                                        {
                                            page
                                        }
                                    </TabPane>
                                </Tabs>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(MemberList);
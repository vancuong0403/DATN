import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
    Image,
    Row,
    Col,
    notification,
    Input,
    Button,
    Space,
    Table,
    Modal,
    Card,
    Tag,
    Result,
    Skeleton
} from "antd";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload, faEye, faChartBar, faTrash
} from "@fortawesome/free-solid-svg-icons";
import { API_URL, GetFullPath, RemoveVietnameseAccents } from "../Helper/TextHelper";
import { ACCESS_TOKEN, GetCookieData } from "../Helper/CookieHelper";
import axios from 'axios';
import { login, logout } from '../Redux/actions/actions'; // Import các action creators
// Redux Imports
import { connect } from 'react-redux';
import { Typography } from './StyledTypography';
import moment from 'moment-timezone';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';

const ViewMemberRegistInfoDlg = ({ x_bIsShow, x_objMemberInfo, x_evtOnCancel }) => {
    const CancelModal = () => {
        if (x_evtOnCancel) {
            x_evtOnCancel();
        }
    }

    const GetFullName = () => {
        const strFullName = `${x_objMemberInfo.firstName} ${x_objMemberInfo.lastName}`;
        return strFullName;
    }
    return (
        <div>
            <Modal
                title="Thông tin"
                open={x_bIsShow}
                onCancel={CancelModal}
                width={1000}>
                {
                    x_objMemberInfo ?
                        <Row>
                            <Col span={24} xs={24} xl={24}>
                                <Typography variant="body1" fontWeight={600} color="#0098e5">
                                    {GetFullName()}
                                </Typography>
                            </Col>
                            <Col span={24} xs={24} xl={24}>

                            </Col>
                        </Row>
                        :
                        <Skeleton />
                }
            </Modal>
        </div>
    );
}

export default ViewMemberRegistInfoDlg;

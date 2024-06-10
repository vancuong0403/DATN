import React, { useState, useEffect, } from 'react';
import {
  useLocation
} from "react-router-dom";
import { Table, Spin, Alert, Typography, Result } from 'antd';
import axios from 'axios';
import { API_URL } from '../Helper/TextHelper';

const { Title } = Typography;

const ExampleTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [id, setid] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const strAcId = searchParams.get('activitysponsorid');
    console.log("ad", strAcId);
    setid(strAcId)
    fetchData(strAcId);
  }, []);

  const fetchData = async (strAcId) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        accept: "*/*",
      };

      var requestData = {
        x_strActivityId: strAcId,
      }
      
        if(strAcId) {
          axios
            .get(API_URL + "api/Sponsor/GetSponsorByActivity", {
              params: requestData,
              headers: headers,
            })
            .then((response) => {
              console.log("cL", response);
              if (response.data.isSuccess) {
                const formattedData = response.data.dataValue.filter(item => item.status === 'PAID').map((item, index) => ({
                  key: item.id,
                  stt: index + 1,
                  name: item.sponsorName === '' ? 'Ẩn Danh' : item.sponsorName,
                  amount: new Intl.NumberFormat().format(item.amount),
                  notes: item.descript || '', // Assuming 'notes' is the key for notes in the API response
                }));
                setData(formattedData);
                setLoading(false);
                calculateTotalAmount(formattedData);
              } else {
                console.log(response.data.errors);
              }
            })
            .catch(() => {
              console.log("Mất kết nối với máy chủ");
            });
        }else{
          axios
        .get(API_URL + "api/Sponsor/GetSponsorWhichOutActivity", {
            headers: headers,
          })
            .then((response) => {
              console.log("cc", response);
              if (response.data.isSuccess) {
                const formattedData = response.data.dataValue.filter(item => item.status === 'PAID').map((item, index) => ({
                  key: item.id,
                  stt: index + 1,
                  name: item.sponsorName === '' ? 'Ẩn Danh' : item.sponsorName,
                  amount: new Intl.NumberFormat().format(item.amount),
                  notes: item.descript || '', // Assuming 'notes' is the key for notes in the API response
                }));
                setData(formattedData);
                setLoading(false);
                calculateTotalAmount(formattedData);
              } else {
                console.log(response.data.errors);
              }
            })
            .catch(() => {
              console.log("Mất kết nối với máy chủ");
            });
        }

      } catch (error) {
        console.error("Error:", error);
      }
    };

    const calculateTotalAmount = (data) => {
      const total = data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
      setTotalAmount(total);
    };


    const columns = [

      {
        title: 'STT',
        dataIndex: 'stt',
        key: 'stt',
      },
      {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số tiền (VNĐ)',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Ghi chú',
        dataIndex: 'notes',
        key: 'notes',
      },
    ];

    if (loading) {
      return <Result
        status={404}
        title={"Hoạt Động Này Chưa Có Tài Trợ"}
        subTitle={"Quay lại sau bạn nhé!"
        }
      />;
    }

    if (error) {
      return <Alert message="Error" description="Failed to fetch data." type="error" />;
    }

    return (
      <div>
        <Title level={4}>Những tổ chức, cá nhân tài trợ gần đây</Title>
        <Table
          dataSource={data}
          columns={columns}
          footer={() => (
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
              Tổng số tiền quyên góp: {new Intl.NumberFormat().format(totalAmount)}.000 VNĐ
            </div>
          )}
        />
      </div>
    );
  };

  export default ExampleTable;

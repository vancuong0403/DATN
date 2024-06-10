import React, { useEffect, useState } from 'react';
import { API_URL } from '../Helper/TextHelper';
import axios from 'axios';
import { message,Typography } from 'antd';
import { ACCESS_TOKEN, GetCookieData } from '../Helper/CookieHelper';
function Bankcard() {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [username, setUsername] = useState('');
    const { Title } = Typography;
    const handleSubmit = () => {
        const data = {
            clientId: cardNumber,
            apiKey: expiryDate,
            checksumKey: cvv
        }
        const token = GetCookieData(ACCESS_TOKEN);

        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            'Authorization': 'Bearer ' + token,
        }
        axios.post(API_URL + 'api/Sponsor/SettingSponsorAccount', JSON.stringify(data), { headers })
            .then((response) => {
                if (response.data.isSuccess) {
                    message.success("THÀNH CÔNG");

                } else {
                    message.error(response.data.errors);
                }

            })
            .catch((response) => {
                message.error("Mất kết nối với máy chủ");

            });
    };
    
    useEffect(() =>    {
        const token = GetCookieData(ACCESS_TOKEN);
        const headers = {
            "Content-Type": "application/json",
            "accept": "*/*",
            'Authorization': 'Bearer ' + token,
        };
    
        axios.get(API_URL + 'api/Sponsor/GetSponsorAccountSetting', { headers })
            .then((response) => {
                console.log("Response:", response.data.dataValue.updatePerson);
                setUsername(response.data.dataValue.updatePerson)
            })
            .catch((error) => { 
                message.error("Mất kết nối với máy chủcc");
            });
    }, []);
    
    const containerStyle = {
        float: 'left',
        display: 'flex',
        flexDirection: 'column',
        width: '800px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        marginRight: '10px', 
    };
    

    const inputContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: '15px',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    };

    const labelStyle = {
        marginBottom: '5px',
        fontWeight: 'bold',
    };

    const buttonStyle = {
        padding: '10px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#007BFF',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
    };

    return (
        <div>
            <div style={{fontWeight: 'bold', marginBottom: '20px', marginTop: '20px'}}>
            <Title level={4}>Quản lý thẻ ngân hàng</Title>
            </div>
            
   <div style={containerStyle}>
            <div style={inputContainerStyle}>
                <label htmlFor="cardNumber" style={labelStyle}>ClientId:</label>
                <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={inputContainerStyle}>
                <label htmlFor="expiryDate" style={labelStyle}>ApiKey:</label>
                <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={inputStyle}
                />
            </div>
            <div style={inputContainerStyle}>
                <label htmlFor="cvv" style={labelStyle}>ChecksumKey:</label>
                <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    style={inputStyle}
                />
            </div>
            <button type="button" onClick={handleSubmit} style={buttonStyle}>Submit</button>
            
        </div>
        <div style={{...containerStyle, float: 'right', border: '1px solid white', padding: '10px', width: '770px'}}>
    <p style={{fontWeight: 'bold', fontSize:'18px'}}>Tài khoản đang được sử dụng: {username}</p>
    {/* Các phần còn lại của component */}
</div>

        </div>
     
        
    );
}

export default Bankcard;

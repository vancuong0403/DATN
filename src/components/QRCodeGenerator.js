import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { Input, Button, Card, Row, Col } from 'antd';

const QRCodeGenerator = () => {
  const [inputValue, setInputValue] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleGenerateQR = () => {
    setShowQR(true);
    
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]} justify="center">
        <Col span={12}>
          <Input
            placeholder="Nhập dữ liệu"
            value={inputValue}
            onChange={handleInputChange}
            style={{ marginBottom: '10px' }}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center">
        <Col span={12}>
          <Button type="primary" onClick={handleGenerateQR} block>
            Hiển thị QR
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center">
        <Col span={12}>
          {showQR && (
            <Card title="Mã QR" style={{ width: '100%', marginTop: '20px' }}>
              <QRCode value={inputValue} />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default QRCodeGenerator;

import Lottie from 'lottie-react';
import animationData from '../assets/images/Lottie_Animation.json';
import welcomeAnimationData from '../assets/images/Welcome_Animation.json';
import environmentalSanitation from '../assets/images/EnvironmentalSanitation.json';
import supportPeopleInDifficulty from '../assets/images/SupportPeopleInDifficulty.json';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
    Row,
    Col,
    Card
} from "antd";
import '../assets/styles/homepage.css';

function HomePage() {
    const variantslefttoright = {
        initial: { x: -100 },
        animate: { x: 0 }
    };
    const variantsrighttoleft = {
        initial: { x: 100 },
        animate: { x: 0 }
    };
    return (
        <div className='homepage-background'>
            <Helmet>
                <title>Trang Chủ</title>
            </Helmet>
            <Row>
                <Col span={10} xs={24} xl={10}>
                    <div className="lottie-container">
                        <Lottie animationData={animationData} />
                    </div>
                </Col>
                <Col span={14} xs={24} xl={14}>
                    <Card className="homepagecard shadown" style={{ overflow: 'auto' }}>
                        <p className='textheader'>Welcome to DTUSVC</p>
                        <br />
                        <br />
                        <motion.div
                            variants={variantslefttoright}
                            initial="initial"
                            animate="animate"
                            transition={{ duration: 1 }}
                        >
                            <div className='contentleft'>
                                <Row>
                                    <Col span={14} xs={24} xl={14}>
                                        <p className='textcontent'>Chào mừng bạn đến với CLB Sinh viên Tình nguyện ĐH Duy Tân. Với phương châm:
                                            <span className='textcontent-bold-blue'>KẾT NỐI TRÁI TIM CÙNG NHAU SẺ CHIA</span>
                                            , chúng tôi luôn muốn có bạn đồng hành để cùng giúp đỡ mọi người.</p>
                                    </Col>
                                    <Col span={10} xs={24} xl={10}>
                                        <div className="content-lottie">
                                            <Lottie animationData={welcomeAnimationData} />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={variantsrighttoleft}
                            initial="initial"
                            animate="animate"
                            transition={{ duration: 1 }}
                        >
                            <div className='contentleft'>
                                <Row>
                                    <Col span={10} xs={24} xl={10} style={{ padding: 20, marginTop: -80 }}>
                                        <div className="content-lottie">
                                            <Lottie animationData={environmentalSanitation} />
                                        </div>
                                    </Col>
                                    <Col span={14} xs={24} xl={14} style={{ marginTop: -100 }}>
                                        <p className='textcontent'>Bảo vệ môi trường là ưu tiên hàng đầu ở Đà Nẵng và chúng tôi luôn tổ chức các hoạt động:
                                            <span className='textcontent-bold-blue'> VỆ SINH MÔI TRƯỜNG</span>
                                            , như thu gom rác, tái chế, trồng cây. Chúng tôi tin rằng việc này không chỉ là trách nhiệm cá nhân mà còn là nhiệm vụ của toàn xã hội, để xây dựng một môi trường sống xanh, sạch và bền vững cho tương lai.</p>
                                    </Col>
                                </Row>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={variantslefttoright}
                            initial="initial"
                            animate="animate"
                            transition={{ duration: 1 }}
                        >
                            <div className='contentleft'>
                                <Row>
                                    <Col span={14} xs={24} xl={14} style={{ marginTop: -100 }}>
                                        <p className='textcontent'>Chúng tôi không chỉ chăm sóc môi trường mà còn giúp đỡ những người khó khăn trong cộng đồng với triết lý "Lá lành đùm lá rách". Chúng tôi tổ chức các hoạt động từ thiện như:
                                            <span className='textcontent-bold-blue'> PHÁT QUÀ, PHÁT CHÁO Ở BỆNH VIỆN, GIÚP ĐỠ TRẺ EM Ở CÁC NHÀ TÌNH THƯƠNG</span>
                                            . Bằng sự chia sẻ và lòng nhân ái, chúng tôi hy vọng lan tỏa niềm vui và sự động viên đến mọi người.</p>
                                    </Col>
                                    <Col span={10} xs={24} xl={10} style={{ padding: 20, marginTop: 50 }}>
                                        <div className="content-lottie">
                                            <Lottie animationData={supportPeopleInDifficulty} />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </motion.div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default HomePage;
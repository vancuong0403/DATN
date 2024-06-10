import { Helmet } from 'react-helmet';
import SidebarMenu from '../components/SidebarMenu.js';
import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import ShortLink from './ShortLink.js';
import QRCodeGenerator from '../components/QRCodeGenerator.js';

function ToolPage() {
    const [broken, setBroken] = useState(false);
    return (
        <div >
            <Helmet>
                <title>Công Cụ</title>
            </Helmet>
            <div className='SidebarMenu-Main'>
                <div>
                    <SidebarMenu
                        isDashBoard={false}
                        onBreakPoint={setBroken}
                        className={broken === false ? "card h-100" : ""}
                    />
                </div>
                <div className="Routes">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dtusvctool/short-link" />} />
                        <Route path="/short-link" element={<ShortLink/> } />
                        <Route path="/create-qr-code" element={<QRCodeGenerator/> } />
                    </Routes>
                </div>
            </div>
        </div>
    )
}

export default ToolPage;
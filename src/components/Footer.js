import '../assets/styles/footer.css';

export default function Footer() {
    return (
        <div class="footer-basic">
            <footer>
                <div class="social">
                    <a href="https://www.facebook.com/CLBTinhNguyenSinhVienDuyTan" target="_blank">
                        <img class="icon" src="https://api.dtusvc.com/NewsImages/ImagesMail/facebook-circular-logo.png" style={{width:40, height: 40}}/>
                    </a>
                    <a href="https://www.youtube.com/@svduytanclbtinhnguyen1056" target="_blank">
                    <img class="icon" src="https://api.dtusvc.com/NewsImages/ImagesMail/youtube.png" style={{width:40, height: 40}}/>
                    </a>
                    {/* <a href="https://dtusvc.com" target="_blank">
                    <img class="icon" src="https://api.dtusvc.com/NewsImages/ImagesMail/web.png" style={{width:40, height: 40}}/>
                    </a> */}
                </div>
                <ul class="list-inline">
                    <li class="list-inline-item"><a href="sys-information">THÔNG TIN HỆ THỐNG</a></li>
                    <li class="list-inline-item"> | </li>
                    <li class="list-inline-item"><a href="data-policy">CHÍNH SÁCH SỬ DỤNG DỮ LIỆU</a></li>
                </ul>
                <p class="copyright">Copyright © 2023 - CLB Sinh viên Tình nguyện - ĐH Duy Tân</p>
            </footer>
        </div>
    )
}
import '../assets/styles/page404style.css';
import logolb from '../assets/images/Logo-CLBTinhNguyenSVDuyTan_1.png';


function Page404(){
    return(
        <div>
        <img style={{position: 'fixed', zIndex: 99999, top: 0, left: 0}} src="https://lh3.googleusercontent.com/Nm43LAO21g0ua9Muu0BUELDCkQfCm4sOKIPlXTM3jScFEuuR2q89H4CBKx7bkbzyAvXA-MPb6bFlPXyRGnep6Y3IsBR171nGx3tkB2SD9zyw3qXlxj8iv7SHoP1t0YK-wSmIcg=w141-h143-no" />
        <img style={{position: 'fixed', zIndex: 99999, top: 0, right: 0}} src="https://lh3.googleusercontent.com/yfLzqRzZL5T5i20FJbhfXEjDjkUT3PshER0urEBiAq1Euy4NTMZBKnMsH8ni-R7ffM8a_mgua5IjbGnp4DWUXQDI_-mNaDfAkgcyFlNNa5u0kRqjaBtW077U47CWsJgNfhhk-g=w141-h143-no" />
        <img style={{position: 'fixed', zIndex: 99999, bottom: '0px', left: '0px'}} src="https://lh3.googleusercontent.com/2U90SIgXGe2W0O2NPluq66u-98JcgCpKBmRvWDcniKdybBTjqIjB0Noq0UsRdG2oOTZlvVh26T1mU9e1nY8lTuOFrSru_saC4J6K6refpHTSJiCb_SykRe2i7MbHgj8q5ESMzg=w200-h159-no" />
        <img style={{position: 'fixed', zIndex: 9999, bottom: '0px', right: '0px'}} src="https://lh3.googleusercontent.com/XH0FHlEyLBF5hzcgkDvSjKlInwSYZ5TUoBruIJoRNnXtezP4kCdi0S7_dwXhee-AbfoWL4g9osBMG32sG7u9Tc30NPOP61GpytphyxoFcZgknHoRm54BprHHO0Umd2q8PpV5Lw=w162-h167-no" />
        <div className="c">
          <div className="_404">4<img className={"logoclb"} src={logolb} />4</div>
          <hr />
          <div className="_1">TRANG BẠN ĐANG MỞ</div>
          <div className="_2">KHÔNG TỒN TẠI HOẶC BẠN KHÔNG CÓ QUYỀN TRUY CẬP</div>
          <a className="btn" href="/">VỀ TRANG CHỦ</a>
        </div>
        <div id="phaohoa">
          <canvas id="canvas">Canvas is not supported in your browser.</canvas>
        </div>
      </div>
    );
}

export default Page404;
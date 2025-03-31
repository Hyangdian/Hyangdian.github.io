import React from "react";
import './Contact.css'
import Discord from './discord_img.png'
import Hyang from './hyang.png'
import GoogleAdvertise from "../GoogleAdd/GoogleAdvertise";

function Contactpage() {
    return(
    <div className="main">
        <header className="contact-header">
            <div className="banners">
                <div className="imageset">
                    <a href="https://discord.gg/pQkUyuG"><img src={Discord} alt="discord" width="200"/></a>
                    <p>TTSKR 디스코드</p>
                </div>
                <div className="imageset">
                    <a href="https://discord.gg/xDuVFHpnWp"><img src={Hyang} alt="hyang" width="200"/></a>
                    <p>Hyang_Dian의 디스코드</p>
                </div>
            </div>
            <p>
                이 페이지는 TTSKR 유저들을 위해
                <a href="https://chzzk.naver.com/a9f828fb06e493270aef7bb8377dc651">Hyang_Dian</a>이 만들었습니다.<br/>
                에러나 건의사항의 경우, 디스코드 DM이나 Hyang_Dian 디스코드 쪽으로,<br/>
                추가하고 싶은 보드게임 내용의 경우 TTSKR 디스코드를 통해 전달해주세요.<br/>
            </p>
        </header>
        <GoogleAdvertise/>
    </div>
    )
}

export default Contactpage;
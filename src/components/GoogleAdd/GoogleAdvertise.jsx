import React, { useEffect } from "react";

const GoogleAdvertise = ({
    googleclassName = "adsbygoogle",
    client = "ca-pub-5916369882056225",
    slot = "4807770829",
    format = "auto",
    responsive = "true",
}) => {
    useEffect(() => {
        //production인 경우만 광고 요청
        //어차피 로컬에서는 광고가 표시되지 않는다
        if (process.env.NODE_ENV === "production")
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                console.log("Advertise is pushed");
            } catch (e) {
                console.error("AdvertiseError", e);
            }
    }, []);
    
    //production이 아닌 경우 대체 컴포넌트 표시
    if (process.env.NODE_ENV !== "production")
        return (
            <div
                style={{
                background: "#e9e9e9",
                color: "black",
                fontSize: "18px",
                fontWeight: "bold",
                textAlign: "center",
                padding: "16px"
                }}
            >
                광고 표시 영역
            </div>
        );
    
    //production인 경우 구글 광고 표시
    return (
        <ins
        className={googleclassName}
        style={{
            overflowX: "auto",
            overflowY: "hidden",
            display: "block",
            textAlign: "center"
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
    />
    );
};

export default GoogleAdvertise
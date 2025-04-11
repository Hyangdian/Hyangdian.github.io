import React, { useState } from "react";
import './Contact.css'
import '../search/Boardgame_search.css'
import Discord from './discord_img.png'
import Hyang from './hyang.png';
import GoogleAdvertise from "../GoogleAdd/GoogleAdvertise";
import {marked} from 'marked';
import { fetchLocalMarkdownContent } from "../../utils/ttsdb_fetcher";

function Contactpage() {
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState(null);
    const loadContent = async () => {
        try {
            const MarkdownContent = await fetchLocalMarkdownContent('how_to_use.md')

            const processedContent = MarkdownContent
                .replace(/> (.*)/g, '<div class="quote">$1</div>') // 인용문 처리
                .replace(/```(.*?)```/gs, '<pre class="code-block">$1</pre>') // 코드 블록 처리
                .replace(/`(.*?)`/g, '<span class="content-block">$1</span>'); // 내용 감싸기 처리

            const imgTags = processedContent.match(/<img src="([^"]+)"/g) || [];
            const finalContent = imgTags.reduce((acc, imgTag) => {
                const srcMatch = imgTag.match(/src="([^"]+)"/);
                if (srcMatch) {
                    const imageUrl = srcMatch[1];
                    const localImageUrl = `/database/images/${imageUrl}`;
                    return acc.replace(imgTag, imgTag.replace(imageUrl, localImageUrl));
                }
            return acc;
        }, processedContent);

            setContent(marked(finalContent));
        } catch (error) {
            console.error("컨텐츠 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    };
        loadContent();

    if (loading) return <p>로딩 중...</p>;

    return(
    <div className="main">
        <header className="contact-header">
            <div className="info">
                <div className="markdown-content" dangerouslySetInnerHTML={{__html:content}}/>
            </div>
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
        </header>
        <GoogleAdvertise/>
    </div>
    )
}

export default Contactpage;
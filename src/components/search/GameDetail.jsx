import React, { useEffect, useState } from 'react';
import { fetchLocalMarkdownContent } from '../../utils/ttsdb_fetcher';
import { marked } from 'marked';
import './Boardgame_search.css';

const GameDetail = ({ filelink, onBack }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const markdownContent = await fetchLocalMarkdownContent(filelink.split('.')[0] + '.md');
                
                // 인용문과 코드 블록을 감싸는 태그 추가
                const processedContent = markdownContent
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
    }, [filelink]);

    if (loading) return <p>로딩 중...</p>;

    return (
        <div className="game-detail">
            <button onClick={onBack} className="back-button">목록으로 돌아가기</button>
            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};

export default GameDetail;

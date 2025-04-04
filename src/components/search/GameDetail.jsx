import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLocalMarkdownContent } from '../../utils/ttsdb_fetcher';
import { marked } from 'marked';
import './Boardgame_search.css';

const GameDetail = () => {
    const { filelink } = useParams();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const markdownContent = await fetchLocalMarkdownContent(filelink.split('.')[0] + '.md');
                const imgTags = markdownContent.match(/<img src="([^"]+)"/g) || [];
                const processedContent = imgTags.reduce((acc, imgTag) => {
                    const srcMatch = imgTag.match(/src="([^"]+)"/);
                    if (srcMatch) {
                        const imageUrl = srcMatch[1];
                        const localImageUrl = `/database/images/${imageUrl}`;
                        return acc.replace(imgTag, imgTag.replace(imageUrl, localImageUrl));
                    }
                    return acc;
                }, markdownContent);

                setContent(marked(processedContent));
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
            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};

export default GameDetail;

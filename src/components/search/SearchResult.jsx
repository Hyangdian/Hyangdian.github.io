import React, { useState } from 'react';

function SearchResult({ file, loadContent }) {
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (!content) {
            setIsLoading(true);
            const loadedContent = await loadContent(file);
            setContent(loadedContent);
            setIsLoading(false);
        }
    };

    return (
        <div className="search-result">
            <h3 onClick={handleClick}>{file.title}</h3>
            <div className="tags">
                {file.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                ))}
            </div>
            {isLoading && <div>로딩 중...</div>}
            {content && (
                <div 
                    className="content"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )}
        </div>
    );
}

export default SearchResult; 
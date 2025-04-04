import React from 'react';

function SearchResult({ file }) {
    const handleClick = () => {
        // 새 탭에서 GameDetail 열기
        window.open(`/search/${file.filelink}`, '_blank');
    };

    return (
        <div className="search-result" onClick={handleClick} style={{ cursor: 'pointer' }}>
            <h3>{file.name}</h3>
            <div className="tags">
                {file.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                ))}
            </div>
        </div>
    );
}

export default SearchResult; 
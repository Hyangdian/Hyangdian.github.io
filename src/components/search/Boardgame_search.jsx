import React, { useState, useEffect } from "react";
import { fetchGitHubContent, listFiles } from '../../utils/github';
import { parseMetadata } from '../../utils/parser';
import { marked } from 'marked';
import './Boardgame_search.css';

function BoardgameSearch() {
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [playerCount, setPlayerCount] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContent, setSelectedContent] = useState(null);
    const [allTags, setAllTags] = useState(new Set());  // 모든 태그 목록
    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 20;
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tempSelectedTags, setTempSelectedTags] = useState([]);  // 모달에서 임시로 선택된 태그들

    // 초기 데이터 로딩 시 태그 목록도 수집
    useEffect(() => {
        async function loadFiles() {
            try {
                const fileList = await listFiles();
                const validFiles = await Promise.all(
                    fileList
                        .filter(file => file.name.endsWith('.md'))
                        .map(async (file) => {
                            const content = await fetchGitHubContent(file.name);
                            const metadata = parseMetadata(content);
                            
                            // // 로그 출력
                            // console.log(`File: ${file.name}`);
                            // console.log(`Response Content: ${content}`);
                            // console.log(`Parsed Metadata:`, metadata);

                            return {
                                name: file.name,
                                ...metadata,
                            };
                        })
                );
                
                setFiles(validFiles);
                setSearchResults(validFiles);
                
                // 모든 태그 수집
                const tags = new Set();
                validFiles.forEach(file => {
                    file.tags?.forEach(tag => tags.add(tag));
                });
                setAllTags(tags);
                
                setLoading(false);
            } catch (error) {
                console.error("파일 로딩 실패:", error);
                setLoading(false);
            }
        }
        loadFiles();
    }, []);

    // 인원수가 범위에 포함되는지 확인하는 함수
    const isPlayerCountInRange = (range, count) => {
        if (!range || !count) return true;
        const [min, max] = range.split('-').map(Number);
        const playerNum = Number(count);
        return playerNum >= min && playerNum <= max;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const results = files.filter(file => {
            // 게임 이름 검색
            const nameMatch = file.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            // 선택된 태그와 일치
            const tagMatch = selectedTags.length === 0 || 
                selectedTags.every(tag => file.tags?.includes(tag));
            
            // 인원수 필터 (메타데이터의 players 사용)
            const playerMatch = isPlayerCountInRange(file.players, playerCount);
            
            return nameMatch && tagMatch && playerMatch;
        });
        setSearchResults(results);
    };

    const handleGameClick = async (file) => {
        try {
            const content = await fetchGitHubContent(file.name);
            // console.log('받아온 컨텐츠:', content); // 디버깅용

            // 메타데이터와 컨텐츠 분리
            const metadata = parseMetadata(content);
            const contentWithoutMeta = metadata.content;

            // console.log('메타데이터 제거된 컨텐츠:', contentWithoutMeta); // 디버깅용

            // 이미지 경로 수정
            const processedContent = contentWithoutMeta.replace(
                /!\[([^\]]*)\]\(([^)]+)\)/g,
                (match, alt, path) => {
                    if (!path.startsWith('http')) {
                        const fullPath = getImageUrl(path)
                        // `https://raw.githubusercontent.com/Hyangdian/TTSKRDB/master/@content/${path}`;
                        return `![${alt}](${fullPath})`;
                    }
                    return match;
                }
            );

            setSelectedContent({
                title: metadata.title,
                content: marked(processedContent)
            });

            // console.log('변환된 HTML:', marked(processedContent)); // 디버깅용
        } catch (error) {
            console.error("컨텐츠 로딩 실패:", error);
        }
    };

    const getImageUrl = (imagePath) => {
        // GitHub raw content URL 생성
        return `https://raw.githubusercontent.com/Hyangdian/TTSKRDB/master/@content/${imagePath}`;
    };
    
    // 현재 페이지의 게임들만 가져오기
    const getCurrentGames = () => {
        const indexOfLastGame = currentPage * gamesPerPage;
        const indexOfFirstGame = indexOfLastGame - gamesPerPage;
        return searchResults.slice(indexOfFirstGame, indexOfLastGame);
    };

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0); // 페이지 상단으로 스크롤
    };

    // 태그 모달 열기
    const openTagModal = () => {
        setTempSelectedTags([...selectedTags]);  // 현재 선택된 태그들로 초기화
        setIsTagModalOpen(true);
    };

    // 태그 모달에서 확인 버튼 클릭
    const handleTagConfirm = () => {
        setSelectedTags(tempSelectedTags);
        setIsTagModalOpen(false);
    };

    // 태그 모달에서 리셋 버튼 클릭
    const handleTagReset = () => {
        setTempSelectedTags([]);
    };

    // 태그 모달에서 태그 토글
    const handleTempTagToggle = (tag) => {
        setTempSelectedTags(prev => 
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <div className="boardgame-search">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-container">
                    <div className="search-group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="게임 이름 검색"
                            className="search-input"
                        />
                    </div>
                    
                    <div className="search-group">
                        <button 
                            type="button" 
                            className="tag-button"
                            onClick={openTagModal}
                        >
                            적용된 태그: {selectedTags.length}개
                        </button>
                    </div>

                    <div className="search-group">
                        <input
                            type="number"
                            value={playerCount}
                            onChange={(e) => setPlayerCount(e.target.value)}
                            placeholder="인원 수"
                            min="1"
                            className="player-input"
                        />
                    </div>

                    <div className="search-group">
                        <button type="submit" className="search-button">검색</button>
                    </div>
                </div>
            </form>

            {selectedContent ? (
                <div className="markdown-content-container">
                    <button 
                        className="back-button"
                        onClick={() => setSelectedContent(null)}
                    >
                        목록으로 돌아가기
                    </button>
                    <div 
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: selectedContent.content }}
                    />
                </div>
            ) : (
                <div className="search-results-container">
                    {loading ? (
                        <p>로딩 중...</p>
                    ) : getCurrentGames().length > 0 ? (
                        <>
                            <div className="games-grid">
                                {getCurrentGames().map((file) => (
                                    <div 
                                        key={file.name} 
                                        className="game-card"
                                        onClick={() => handleGameClick(file)}
                                    >
                                        {file.thumbnail && (
                                            <div className="thumbnail">
                                                <img 
                                                    src={getImageUrl(file.thumbnail)} 
                                                    alt={file.title}
                                                />
                                            </div>
                                        )}
                                        <h3>{file.title}</h3>
                                        <div className="tags">
                                            {file.tags.map((tag, index) => (
                                                <span key={index} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                        <p className="date">{file.date}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="pagination">
                                {Array.from({ length: Math.ceil(searchResults.length / gamesPerPage) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="no-results">검색 결과가 없습니다.</p>
                    )}
                </div>
            )}

            {/* 태그 선택 모달 */}
            {isTagModalOpen && (
                <div className="modal-overlay">
                    <div className="tag-modal">
                        <h3>태그 선택</h3>
                        <div className="tag-list">
                            {Array.from(allTags).map(tag => (
                                <label key={tag} className="tag-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={tempSelectedTags.includes(tag)}
                                        onChange={() => handleTempTagToggle(tag)}
                                    />
                                    <span>{tag}</span>
                                </label>
                            ))}
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleTagReset}>초기화</button>
                            <button onClick={() => setIsTagModalOpen(false)}>취소</button>
                            <button onClick={handleTagConfirm} className="confirm-button">
                                확인 ({tempSelectedTags.length}개 선택)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BoardgameSearch;
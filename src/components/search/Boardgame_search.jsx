import React, { useState, useEffect } from "react";
import { listFiles } from '../../utils/ttsdb_fetcher';
import './Boardgame_search.css';
import GoogleAdvertise from "../GoogleAdd/GoogleAdvertise";
import { useLocation, Routes, Route } from 'react-router-dom';
import GameDetail from './GameDetail';

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
    const [loadingContent] = useState(false); // 로딩 상태 추가
    const location = useLocation();

    // 초기 데이터 로딩 시 태그 목록도 수집
    useEffect(() => {
        async function loadFiles() {
            try {
                const fileList = await listFiles();
                const validFiles = fileList.map(file => ({
                    name: file.name,
                    filelink: file.filelink,
                    tags: file.tags.split(',').map(tag => tag.replace(/"/g, '').trim()), // 태그 배열로 변환
                    players: file.players.split(',').map(Number), // 플레이어 수 배열로 변환
                    thumbnail: file.thumbnail
                }));
                
                setFiles(validFiles);
                setSearchResults(validFiles);
                
                // 모든 태그 수집
                const tags = new Set();
                validFiles.forEach(file => {
                    file.tags.forEach(tag => tags.add(tag));
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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchTermFromUrl = params.get('searchTerm') || '';
        const selectedTagsFromUrl = params.get('selectedTags') ? params.get('selectedTags').split(',') : [];
        const playerCountFromUrl = params.get('playerCount') || '';
        const currentPageFromUrl = params.get('currentPage') ? parseInt(params.get('currentPage')) : 1;

        setSearchTerm(searchTermFromUrl);
        setSelectedTags(selectedTagsFromUrl);
        setPlayerCount(playerCountFromUrl);
        setCurrentPage(currentPageFromUrl);
    }, [location.search]);

    const handleSearch = (e) => {
        e.preventDefault();
        const results = files.filter(file => {
            // 게임 이름 검색
            const nameMatch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // 선택된 태그와 일치
            const tagMatch = selectedTags.length === 0 || 
                selectedTags.every(tag => file.tags?.includes(tag));
            
            // 인원수 필터 (배열의 길이로 체크)
            const playerCountArray = file.players; // players가 배열로 제공됨
            const playerMatch = playerCount === "" || playerCountArray.includes(Number(playerCount)); // 수정된 부분
            
            return nameMatch && tagMatch && playerMatch;
        });
        setSearchResults(results);
    };
    
    const handleGameClick = (file) => {
        setSelectedContent(file); // 선택한 게임 정보를 상태에 저장
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

    const handleSearchExecution = (searchTerm, selectedTags, playerCount, currentPage) => {
        setSearchTerm(searchTerm);
        setSelectedTags(selectedTags);
        setPlayerCount(playerCount);
        setCurrentPage(currentPage);
        handleSearch(); // 검색 실행
    };

    const handleBack = () => {
        setSelectedContent(null); // 선택된 게임 정보 초기화
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

            {loadingContent ? (
                <p>로딩 중...</p>
            ) : selectedContent ? (
                <GameDetail filelink={selectedContent.filelink} onBack={handleBack} />
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
                                                    src={`/database/images/${file.thumbnail}`} // 로컬 썸네일 URL로 변경
                                                    alt={file.name}
                                                />
                                            </div>
                                        )}
                                        <h3>{file.name}</h3>
                                        <div className="tags">
                                            {file.tags.map((tag, index) => (
                                                <span key={index} className="tag">{tag}</span>
                                            ))}
                                        </div>
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
                            <div className="advertisement-wrapper">
                                <GoogleAdvertise/>
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

            <Routes>
                <Route path="/search/:filelink" element={<GameDetail onSearch={handleSearchExecution} />} />
            </Routes>
        </div>
    );
}

export default BoardgameSearch;
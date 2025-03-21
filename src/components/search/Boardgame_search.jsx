import React, { useState, useEffect } from "react";
import { listGoogleDriveFiles, fetchGoogleDriveContent, fetchGoogleDriveImage } from '../../utils/ttsdb_fetcher';
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
    const [loadingContent, setLoadingContent] = useState(false); // 로딩 상태 추가

    // 초기 데이터 로딩 시 태그 목록도 수집
    useEffect(() => {
        async function loadFiles() {
            try {
                const fileList = await listGoogleDriveFiles();
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
    
    const handleGameClick = async (file) => {
        setLoadingContent(true); // 로딩 시작
        try {
            const content = await fetchGoogleDriveContent(file.filelink);

            // 모든 img 태그의 src를 비동기적으로 처리
            const imgTags = content.match(/<img src="([^"]+)"/g) || []; // img 태그를 찾고, 없으면 빈 배열
            const imgPromises = imgTags.map(async (imgTag) => {
                const srcMatch = imgTag.match(/src="([^"]+)"/);
                if (srcMatch) {
                    const imageUrl = srcMatch[1]; // 원래의 src 값을 가져옴
                    const imageBlob = await fetchGoogleDriveImage(imageUrl); // fetchGoogleDriveImage 호출
                    const blobUrl = URL.createObjectURL(imageBlob); // Blob URL 생성
                    return imgTag.replace(imageUrl, blobUrl); // 원래의 img 태그에서 src를 Blob URL로 변경
                }
                return imgTag; // src가 없으면 원래의 img 태그 반환
            });

            // 모든 Promise가 완료될 때까지 기다림
            const processedImages = await Promise.all(imgPromises);
            
            // processedImages를 사용하여 content의 img 태그를 모두 변경
            let processedContent = content;
            processedImages.forEach((newImgTag, index) => {
                // 각 img 태그를 올바른 위치에 맞춰서 대체
                processedContent = processedContent.replace(imgTags[index], newImgTag);
            });

            setSelectedContent({
                content: marked(processedContent), // 변경된 content 사용
            });
        } catch (error) {
            console.error("컨텐츠 로딩 실패:", error);
        } finally {
            setLoadingContent(false); // 로딩 종료
        }
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

            {loadingContent ? ( // 로딩 화면 추가
                <p>로딩 중...</p>
            ) : selectedContent ? (
                <div className="markdown-content-container">
                    <button 
                        className="back-button"
                        onClick={() => setSelectedContent(null)}
                    >
                        목록으로 돌아가기
                    </button>
                    {selectedContent.imageUrl && ( // Blob URL이 있을 경우 이미지 출력
                        <img src={selectedContent.imageUrl} alt="게임 이미지" />
                    )}
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
                                                    src={file.thumbnail}
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
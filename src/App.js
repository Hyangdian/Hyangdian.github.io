import React, { useState } from 'react';
import logo from './tts_logo.jpg';
import './App.css';
import Navbar from './components/navbar/Nav_bar';
import BoardgameSearch from './components/search/Boardgame_search';
import Contactpage from './components/contact/Contact';
import GoogleAdvertise from './components/GoogleAdd/GoogleAdvertise';

function App() {
  const [currentPage, setCurrentPage] = useState('main');

  const renderPage = () => {
    switch (currentPage) {
      case 'search':
        return <BoardgameSearch />;
      case 'contact':
        return <Contactpage />;
      default:
        return (
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              테이블탑 시뮬레이터 한국 커뮤니티를 위한 데이터베이스
            </p>
            <p>
              이 사이트는, TTSKR 유저들 및 테이블탑 시뮬레이터를 시작하려는 유저들을 위해<br />
              테이블탑 시뮬레이터에서 한국어로 즐길 수 있는 게임들을 정리해 둔 공간입니다.<br />
            </p>
            <div style={{ width: '100%' }}>
              <GoogleAdvertise />
            </div>
          </header>
        );
    }
  };

  return (
    <div className="App">
      <Navbar setCurrentPage={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;

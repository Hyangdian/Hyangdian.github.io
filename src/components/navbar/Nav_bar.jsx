import './Nav_bar.css';
import React from 'react';

function Navbar({ setCurrentPage }) {
    return (
        <div className='navbar_background'>
            <div className='identity'>
                <button className="Title" onClick={() => setCurrentPage('main')}>TTSKR DATABASE</button>
            </div>
            <div className='nav_options'>
                <button className="navbar_menu" onClick={() => setCurrentPage('main')}>Main</button>
                <button className="navbar_menu" onClick={() => setCurrentPage('search')}>Search</button>
                <button className="navbar_menu" onClick={() => setCurrentPage('contact')}>How to Use</button>
            </div>
        </div>
    );
};

export default Navbar;
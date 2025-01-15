import './Nav_bar.css';
import { Link } from 'react-router-dom';
import React from 'react'

function Navbar() {
    return (
        <div className='navbar_background'>
            <div className='identity'>
                <Link className="Title" to={'/'}>TTSKR DATABASE</Link>
            </div>
            <div className='nav_options'>
                <Link className="navbar_menu" to={'/'}>Main</Link>
                <Link className="navbar_menu" to={'/search'}>Search</Link>
                <Link className="navbar_menu" to={'/contact'}>Contact</Link>
            </div>
        </div>
    );
};

export default Navbar
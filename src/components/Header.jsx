import React from 'react';
import Nav from './Nav.jsx';
import {useLocation} from 'react-router-dom';

function Header () {
    const location = useLocation();

    const getHeaderClassName = () => {
        if (location.pathname.startsWith('/profile')) {
            return "page-header";
        }
        return "page-header page-header--index";
    }

    return (
        <header className={getHeaderClassName()}>
            <div className="page-header__container">
                <a className="page-header__logo-link" href="#">
                    <img className="page-header__logo-image" width="167" height="19" src='/img/icons/text-logo-mobile.svg'/>
                </a>
                <button className="page-header__toggle-button" type="button">
                    <span className="visually-hidden">
                        Открыть меню.
                    </span>
                </button>
            </div>
            <Nav/>
        </header>
    );
}

export default Header;

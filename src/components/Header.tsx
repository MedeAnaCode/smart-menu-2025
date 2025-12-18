import React from 'react';
import Nav from './Nav';
import {useLocation} from 'react-router-dom';
import classNames from "classnames";

function Header () {
    const location = useLocation();

    const getHeaderClassName = (): string => {
        return classNames("page-header", {
            "page-header--index": !location.pathname.startsWith('/profile')
        });
    };

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

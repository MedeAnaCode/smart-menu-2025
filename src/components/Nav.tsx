import React from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import classNames from 'classnames';
import {useAuth} from '../auth/AuthContext';

function Nav () {
    const location = useLocation();
    const auth = useAuth();

    const getNavClassName = (): string => {
        return classNames("page-header__navigation", {
            "page-header__navigation--index": !location.pathname.startsWith('/profile')
        });
    };

    return (
        <nav className={getNavClassName()}>
            <ul className="page-header__navigation-list">
                <li className="page-header__navigation-item">
                    <NavLink className="page-header__navigation-link" to="/">
                        Главная
                    </NavLink>
                </li>
                <li className="page-header__navigation-item">
                    <NavLink className="page-header__navigation-link" to="profile/menu">
                        Моё меню
                    </NavLink>
                </li>
                <li className="page-header__navigation-item">
                    <NavLink className="page-header__navigation-link" to="profile/recipes">
                        Мои рецепты
                    </NavLink>
                </li>
            </ul>
            <ul className="page-header__navigation-user-list">
                <li className="page-header__navigation-user-item">
                    <button
                        className="page-header__navigation-user-link"
                        type="button"
                        onClick={() => void (auth.authenticated ? auth.logout() : auth.login())}
                    >
                        {auth.authenticated ? "Выйти" : "Войти"}
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Nav;

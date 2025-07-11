import React from 'react';
import {NavLink} from 'react-router-dom';
import {useLocation} from 'react-router-dom';

function Nav () {
    const location = useLocation();

    const getNavClassName = () => {
        if (location.pathname.startsWith('/profile')) {
            return "page-header__navigation";
        }
        return "page-header__navigation page-header__navigation--index";
    }

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
                    <a className="page-header__navigation-user-link" href="#">
                        Войти
                    </a>
                </li>
            </ul>
        </nav>
    );
}

export default Nav;

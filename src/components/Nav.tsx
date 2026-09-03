import {NavLink, useLocation} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
export default function Nav() {
    const home = useLocation().pathname === '/', auth = useAuth();
    return <nav className="page-header__navigation" aria-label="Основная навигация">
        <ul className="page-header__navigation-list">
            {home && <li><NavLink className="page-header__navigation-link" to="/" end>Главная</NavLink></li>}
            <li><NavLink className="page-header__navigation-link" to="/profile/recipes">Мои рецепты</NavLink></li>
            <li><NavLink className={`page-header__navigation-link${home ? ' page-header__menu-link' : ''}`} to="/profile/menu">Моё меню{home && ' ↗'}</NavLink></li>
        </ul>
        <button className="page-header__navigation-user-link" type="button" onClick={() => void (auth.authenticated ? auth.logout() : auth.login())}>{auth.authenticated ? 'Выйти' : 'Войти'}</button>
    </nav>;
}

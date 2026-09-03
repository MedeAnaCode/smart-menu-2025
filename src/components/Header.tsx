import {Link, useLocation} from 'react-router-dom';
import Nav from './Nav';
export default function Header() {
    const home = useLocation().pathname === '/';
    return <header className={`page-header${home ? ' page-header--index' : ''}`}>
        <div className="page-header__container"><Link className="page-header__logo-link" to="/" aria-label="Smart Menu — главная">
            <img className="page-header__logo-image" width="208" height="24" src="/img/icons/text-logo-mobile.svg" alt="Smart Menu" />
            {home && <span className="page-header__tagline">Твоя кухня. Твои правила.</span>}
        </Link></div><Nav />
    </header>;
}

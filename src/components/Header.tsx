import {Link} from 'react-router-dom';
import Nav from './Nav';
export default function Header() {
    return <header className="page-header">
        <div className="page-header__container"><Link className="page-header__logo-link" to="/" aria-label="Smart Menu — главная">
            <img className="page-header__logo-image" width="208" height="24" src="/img/icons/text-logo-mobile.svg" alt="Smart Menu" />
        </Link></div><Nav />
    </header>;
}

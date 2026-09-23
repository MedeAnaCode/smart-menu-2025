import {Link} from 'react-router-dom';
import Nav from './Nav';
export default function Header() {
    return <header className="page-header">
        <div className="page-header__container"><Link className="page-header__logo-link" to="/" aria-label="PlanDish — главная">
            <img className="page-header__logo-image" width="124" height="25" src="/img/plandish-logo.svg" alt="PlanDish" />
        </Link></div><Nav />
    </header>;
}

import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import classNames from "classnames";

function Footer () {
    const location = useLocation();

    const getFooterClassName = (): string => {
        return classNames("page-footer", {
            "page-footer--profile": location.pathname.startsWith('/profile')
        });
    };

    const getFooterContainerClassName = () => {
        if (location.pathname.startsWith('/profile')) {
            return "page-footer__container page-footer__container--profile container";
        }
        return "page-footer__container container";
    }

    return (
        <footer className={getFooterClassName()}>
            <div className={getFooterContainerClassName()}>
                <Link className="page-footer__logo-link" to="/" aria-label="PlanDish — главная">
    <span className="visually-hidden">
        Логотип PlanDish.
    </span>
                    <img className="page-footer__logo-image" width="124" height="25" src='/img/plandish-logo.svg' alt=""/>
                </Link>
                <ul className="page-footer__social-list social-list" aria-label="Социальные сети">
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">Telegram</a>
                    </li>
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">YouTube</a>
                    </li>
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">VK</a>
                    </li>
                </ul>
                <div className="page-footer__contacts">
                    <p className="page-footer__contacts-paragraph">
                        По всем вопросам пишите:
                    </p>
                    <a className="page-footer__contacts-email" href="mailto:medentsova.anastasia@yandex.ru">
                        medentsova.anastasia@yandex.ru
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

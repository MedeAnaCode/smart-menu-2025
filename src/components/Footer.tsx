import React from 'react';
import {useLocation} from 'react-router-dom';
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
                <a className="page-footer__logo-link" href="#">
    <span className="visually-hidden">
        Логотип Smart menu.
    </span>
                    <img className="page-footer__logo-image" width="167" height="19" src='/img/icons/text-logo-mobile.svg'/>
                </a>
                <ul className="page-footer__social-list social-list">
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">
            <span className="visually-hidden">
                Телеграм.
            </span>
                            <img className="social-list__icon" width="36" height="36" src='/img/icons/telegram.svg'/>
                        </a>
                    </li>
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">
            <span className="visually-hidden">
                Youtube.
            </span>
                            <img className="social-list__icon" width="36" height="36" src='/img/icons/youtube.svg'/>
                        </a>
                    </li>
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">
            <span className="visually-hidden">
                В контакте.
            </span>
                            <img className="social-list__icon" width="36" height="36" src='/img/icons/vk.svg'/>
                        </a>
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

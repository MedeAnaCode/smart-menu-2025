import React from 'react';
import telegram from './../img/icons/telegram.svg'
import vk from './../img/icons/vk.svg'
import youtube from './../img/icons/youtube.svg'
import logoMobile from './../img/icons/text-logo-mobile.svg'
import {useLocation} from 'react-router-dom';

function Footer () {
    const location = useLocation();

    const getFooterClassName = () => {
        if (location.pathname.startsWith('/profile')) {
            return "page-footer page-footer--profile";
        }
        return "page-footer";
    }

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
                    <img className="page-footer__logo-image" width="167" height="19" src={logoMobile}/>
                </a>
                <ul className="page-footer__social-list social-list">
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">
            <span className="visually-hidden">
                Телеграм.
            </span>
                            <img className="social-list__icon" width="36" height="36" src={telegram}/>
                        </a>
                    </li>
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">
            <span className="visually-hidden">
                Youtube.
            </span>
                            <img className="social-list__icon" width="36" height="36" src={youtube}/>
                        </a>
                    </li>
                    <li className="social-list__item">
                        <a className="social-list__link" href="#">
            <span className="visually-hidden">
                В контакте.
            </span>
                            <img className="social-list__icon" width="36" height="36" src={vk}/>
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

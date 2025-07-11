import React from 'react';
import logoImage from './../img/logo-image-tablet.svg';

function MainContainer () {
    return (
        <main className="main-container">
            <h1 className="visually-hidden">
                Главная страница "Smart menu".
            </h1>
            <section className="banner">
                <h2 className="visually-hidden">
                    Описание приложения
                </h2>
                <div className="banner__logo-wrapper">
                    <img className="banner__logo-image" src={logoImage} width="120" height="90"
                                 alt="Логотип Smart-menu"/>
                </div>
                <p className="banner__description">
                    <b className="banner__description-accent">Smart menu</b> - это незаменимый помощник в составлении твоего личного
                    меню.
                </p>
            </section>
            <div className="main-container__information container">
                <section className="help">
                    <h2 className="help__title">
                        Smart menu поможет тебе:
                    </h2>
                    <ul className="help__list">
                        <li className="help__list-item help__list-item--strong">
                            Следить за здоровьем и всегда оставаться в форме!
                        </li>
                        <li className="help__list-item help__list-item--broccoli">
                            Питаться разнообразно и полноценно.
                        </li>
                        <li className="help__list-item help__list-item--cart">
                            Собрать продуктовую корзину на неделю за секунду!
                        </li>
                    </ul>
                </section>
                <section className="registration">
                    <h2 className="registration__title">
                        Попробуй, <br className="mobile-break"/>как это удобно!
                    </h2>
                    <a className="registration__button button-dark" href="#">
                        Регистрация
                    </a>
                </section>
                <section className="about-content">
                    <h2 className="visually-hidden">
                        Что вы можете у нас найти?
                    </h2>
                    <p className="about-content__description">
                        В нашей базе более 1000 простых и вкусных рецептов*
                    </p>
                    <small className="about-content__note">
                        * - пока что это ложь
                    </small>
                </section>
            </div>
        </main>
    );
}

export default MainContainer;

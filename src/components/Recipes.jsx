import React from 'react';
import RecipeCard from './Recipes-card';
import image1 from './../img/porridge.png';
import image2 from './../img/salad.png';

function Recipes () {

    return (
        <>
            <h1 className="visually-hidden">
            Рецепты "Smart menu".
            </h1>
            <div className="recipes-container">
                <div className="recipes-container__card recipe-card">
                    <div className="recipe-card__content">
                        <img src={image1} height="140px" className="recipe-card__img"/>
                        <h2 className="recipe-card__title">Каша</h2>
                        <span className="recipe-card__option-title">Приготовление:</span>
                        <p className="recipe-card__preparing"> Пышный омлет с помидорами, перцем и луком, приправленный солью и перцем.</p>
                    </div>
                </div>
                <div className="recipes-container__card recipe-card">
                    <div className="recipe-card__content">
                        <img src={image2} height="140px" className="recipe-card__img"/>
                        <h2 className="recipe-card__title">Цезарь</h2>
                        <span className="recipe-card__option-title">Приготовление:</span>
                        <p className="recipe-card__preparing"> Освежающий салат с огурцами, помидорами, сыром Фета, маслинами, заправленный лимонным соком и оливковым маслом.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Recipes;

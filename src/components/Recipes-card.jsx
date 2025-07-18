import React from 'react';
import IngredientsList from "./Ingredients-list";

function RecipeCard ({ title, preparingText, imageUrl, ingredients }) {
    return (
        <div className="recipes-container__card recipe-card">
            <div className="recipe-card__content">
                <img src={imageUrl} alt={title} className="recipe-card__img"/>
                <h2 className="recipe-card__title">{title}</h2>
                <span className="recipe-card__option-title">Ингредиенты:</span>
                <IngredientsList ingreds={ingredients}/>
                <span className="recipe-card__option-title">Приготовление:</span>
                <p className="recipe-card__preparing">{preparingText}</p>
            </div>
        </div>
    );
}

export default RecipeCard;

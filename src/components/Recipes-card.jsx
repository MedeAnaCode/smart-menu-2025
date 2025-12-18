import React from 'react';
import IngredientsList from "./Ingredients-list";

function RecipeCard ({ title, preparingText, imageUrl, ingredients, id, servings, onEdit, onDelete }) {

    const handleEdit = () => {
        onEdit(id);
    }

    const handleDelete = () => {
        onDelete(id);
    }

    return (
        <article className="recipes-container__card recipe-card">
            <div className="recipe-card__content">
                <div className="recipe-card__img-wrapper">
                    <img src={imageUrl} alt={title} className="recipe-card__img"/>
                </div>
                <h2 className="recipe-card__title">{title}</h2>
                <span className="recipe-card__option-title">Ингредиенты:</span>
                <IngredientsList ingreds={ingredients}/>
                <span className="recipe-card__servings">Количество порций: {servings}</span>
                <span className="recipe-card__option-title">Приготовление:</span>
                <p className="recipe-card__preparing">{preparingText}</p>
            </div>
        <div className="recipe-card__button-block">
            <button
                type="button"
                className="recipe-card__button button-dark"
                onClick={handleDelete}
            >
                <span className="visually-hidden">
                    Удалить.
                </span>
                <img className="recipe-card__button-icon" width="14" height="14" src='/img/icons/delete.svg'/>
            </button>
            <button
                type="button"
                className="recipe-card__button button-dark"
                onClick={handleEdit}
            >
                <span className="visually-hidden">
                    Редактировать.
                </span>
                <img className="recipe-card__button-icon" width="14" height="14" src='/img/icons/edit.svg'/>
            </button>
        </div>
        </article>
    );
}

export default RecipeCard;

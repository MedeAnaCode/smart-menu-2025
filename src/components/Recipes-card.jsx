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
                <img src={imageUrl} alt={title} className="recipe-card__img"/>
                <h2 className="recipe-card__title">{title}</h2>
                <span className="recipe-card__option-title">Ингредиенты:</span>
                <IngredientsList ingreds={ingredients}/>
                <span className="recipe-card__option-title">Количество порций: {servings}</span>
                <span className="recipe-card__option-title">Приготовление:</span>
                <p className="recipe-card__preparing">{preparingText}</p>
            </div>

            <button
                type="button"
                className="button-dark"
                onClick={handleDelete}
            >
                Удалить
            </button>
            <button
                type="button"
                className="button-dark"
                onClick={handleEdit}
            >
                Редактировать
            </button>
        </article>
    );
}

export default RecipeCard;
//Стилизовать кнопку

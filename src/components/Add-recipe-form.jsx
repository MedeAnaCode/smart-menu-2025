import React from 'react';
import IngredientFieldset from "./Ingredient-fieldset";

function AddRecipeForm () {
    return (
        <form className="add-recipe-form" action="http://localhost:3001" method="post">
            <h3 className="add-recipe-form__title">
                Новый рецепт
            </h3>
            <label className="visually-hidden" htmlFor="name">Название.</label>
            <input className="add-recipe-form__input" type="text" placeholder="Название" id="name"/>
            <section className="add-recipe-form__section">
                <h4 className="add-recipe-form__subtitle">Ингредиенты:</h4>
                <IngredientFieldset id={1}></IngredientFieldset>
                <IngredientFieldset id={2}></IngredientFieldset>
                <IngredientFieldset id={3}></IngredientFieldset>
            </section>
            <section className="add-recipe-form__section">
                <h4 className="add-recipe-form__subtitle">Приготовление:</h4>
                <label className="visually-hidden" htmlFor="preparing"></label>
                <textarea placeholder="Здесь приготовление блюда" id="preparing">
            </textarea>
            </section>
            <div className="add-recipe-form__footer">
                <label className="add-recipe-form__label">
                    Количество порций:
                    <input className="add-recipe-form__input" type="number" min="1" max="10" step="1"/>
                </label>
                <button className="add-recipe-form__button button-dark" type="submit">
                    Создать
                </button>
            </div>
        </form>
    );
}

export default AddRecipeForm;

// - Добавить всем input/select элементам атрибут name для последующей отправки данных



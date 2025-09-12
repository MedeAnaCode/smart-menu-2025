import React from 'react';
import { useState, useEffect } from 'react';
import IngredientFieldset from "./Ingredient-fieldset";

function EditRecipeForm ({initialValues, onSaved, onCancel}) {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [description, setDescription] = useState('');
    const [servings, setServings] = useState(1);
    const [error, setError] = useState(null);

    function updateIngredient(index, field, value) {
        setIngredients(prev => {
            const newIngredients = [...prev];
            newIngredients[index] = {...newIngredients[index], [field]: value};
            return newIngredients;
        });
    }

    function deleteIngredient(indexToDelete) {
        setIngredients(prev => {
            return prev.filter((e, index) => index !== indexToDelete);
        });
    }

    useEffect(() => {
        setTitle(initialValues.title ?? '');
        setIngredients(initialValues.ingredients ?? []);
        setDescription(initialValues.description ?? '');
        setServings(initialValues.servings ?? 1);
    }, [initialValues]);

    function handleSubmit(e) {
        e.preventDefault();
        onSaved?.({
            title,
            ingredients,
            description,
            servings
        });
    }

    return (
        <form className="edit-recipe-form" onSubmit={handleSubmit}>
            <h3 className="edit-recipe-form__title">
                Редактируем рецепт
            </h3>
            <label className="visually-hidden" htmlFor="name">Название.</label>
            <input
                className="edit-recipe-form__input"
                type="text"
                placeholder="Название"
                id="name"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <section className="edit-recipe-form__section">
                <h4 className="edit-recipe-form__subtitle">Ингредиенты:</h4>
                {ingredients.map((ingredient, index) => (
                    <IngredientFieldset
                        key={index}
                        arr={ingredients}
                        index={index}
                        onChange={updateIngredient}
                        onClickDel={deleteIngredient}
                    />
                ))}
                <button
                    type="button"
                    onClick={() => setIngredients([...ingredients, {}])}
                >
                    Добавить ингредиент
                </button>
            </section>
            <section className="edit-recipe-form__section">
                <h4 className="edit-recipe-form__subtitle">Приготовление:</h4>
                <label className="visually-hidden" htmlFor="preparing"></label>
                <textarea
                    placeholder="Здесь приготовление блюда"
                    id="preparing"
                    value={description}
                    onChange={e => setDescription(e.target.value)}>
            </textarea>
            </section>
            <div className="edit-recipe-form__footer">
                <label className="edit-recipe-form__label">
                    Количество порций:
                    <input
                        className="edit-recipe-form__input"
                        type="number"
                        min="1"
                        max="10"
                        step="1"
                        value={servings}
                        onChange={e => setServings(e.target.value)}
                    />
                </label>
                <button
                    className="edit-recipe-form__button button-dark"
                    type="submit"
                    >
                    Сохранить изменения
                </button>
                <button
                    className="edit-recipe-form__button button-dark"
                    type="button"
                    onClick={onCancel}>
                    Отменить редактирование
                </button>
            </div>

            {error && <p style={{color: 'red'}}>Ошибка: {error}</p>}
        </form>
    );
}

export default EditRecipeForm;

//Нужно сделать поле для изменения изображения (по ссылке (строка адреса) или с компьютера)

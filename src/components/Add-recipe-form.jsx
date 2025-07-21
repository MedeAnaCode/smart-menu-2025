import React from 'react';
import { useState } from 'react';
import { sendData } from '../api';
import IngredientFieldset from "./Ingredient-fieldset";

function AddRecipeForm ({onSuccess}) {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [description, setDescription] = useState('');
    const [servings, setServings] = useState(1);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const recipeData = JSON.stringify({
                title,
                ingredients: ingredients.filter(i => i["name"].trim() !== ''),
                description,
                servings,
            });
            const response = await sendData('/recipes', recipeData);

            onSuccess?.(response); //чтобы передать data наверх, родительскому компоненту

            // Очистка формы
            setTitle('');
            setIngredients([]);
            setDescription('');
            setServings(1);
        } catch (err) {
            console.error('Ошибка при создании рецепта:', err);
            setError(err.message);
        }
    };

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

    return (
        <form className="add-recipe-form" onSubmit={handleSubmit}>
            <h3 className="add-recipe-form__title">
                Новый рецепт
            </h3>
            <label className="visually-hidden" htmlFor="name">Название.</label>
            <input
                className="add-recipe-form__input"
                type="text"
                placeholder="Название"
                id="name"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <section className="add-recipe-form__section">
                <h4 className="add-recipe-form__subtitle">Ингредиенты:</h4>
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
            <section className="add-recipe-form__section">
                <h4 className="add-recipe-form__subtitle">Приготовление:</h4>
                <label className="visually-hidden" htmlFor="preparing"></label>
                <textarea
                    placeholder="Здесь приготовление блюда"
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}>
            </textarea>
            </section>
            <div className="add-recipe-form__footer">
                <label className="add-recipe-form__label">
                    Количество порций:
                    <input
                        className="add-recipe-form__input"
                        type="number"
                        min="1"
                        max="10"
                        step="1"
                        value={servings}
                        onChange={e => setServings(e.target.value)}
                    />
                </label>
                <button
                    className="add-recipe-form__button button-dark"
                    type="submit">
                    Создать
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
        </form>
    );
}

export default AddRecipeForm;

//На каком-то этапе обрезается конец строки у названия ингредиента, не всегда отображается нужное количество

//Нужно добавить обработчик для ингредиентов и убрать ингредиенты по умолчанию
//Когда будет кнопка  "добавить новый ингредиент"   const addIngredient = () => setIngredients([...ingredients, '']);
//Нужно сделать поле для загрузки изображения (по ссылке (строка адреса) или с компьютера)

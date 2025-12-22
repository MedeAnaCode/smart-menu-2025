import React, {FormEvent} from 'react';
import { useState } from 'react';
import { sendData } from '../api';
import IngredientFieldset from "./Ingredient-fieldset";
import type { Recipe, Ingredient, IngredientKey, AddRecipeFormProps } from './../types/index';

function AddRecipeForm ({onSuccess}: AddRecipeFormProps) {
    const [title, setTitle] = useState<string>('');
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [description, setDescription] = useState<string>('');
    const [servings, setServings] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);

    const emptyIngredient = (): Ingredient => ({
        name: '',
        amount: '',
        um: 'г',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const recipeData: Partial<Recipe> = {
                title,
                ingredients: ingredients.filter(i => i["name"].trim() !== ''),
                description,
                servings,
            };
            const response: true | unknown = await sendData('/recipes', recipeData);
            if (response === true) {
                onSuccess();

                // Очистка формы
                setTitle('');
                setIngredients([]);
                setDescription('');
                setServings(1);
            }
        } catch (err) {
            console.error('Ошибка при создании рецепта:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Неизвестная ошибка');
            }
        }
    };

    function updateIngredient(index: number, field: IngredientKey, value: string): void {
        setIngredients(prev => {
            const newIngredients = [...prev];
            newIngredients[index] = {...newIngredients[index], [field]: value};
            return newIngredients;
        });
    }

    function deleteIngredient(indexToDelete: number): void {
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
                    onClick={() => setIngredients([...ingredients, emptyIngredient()])}
                >
                    Добавить ингредиент
                </button>
            </section>
            <section className="add-recipe-form__section">
                <h4 className="add-recipe-form__subtitle">Приготовление:</h4>
                <label className="visually-hidden" htmlFor="preparing"></label>
                <textarea
                    placeholder="Здесь приготовление блюда"
                    id="preparing"
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
                        onChange={e => setServings(Number(e.target.value) || 1)}
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

//Нужно сделать поле для загрузки изображения (по ссылке (строка адреса) или с компьютера)
//Использовать uuid для ингредиентов

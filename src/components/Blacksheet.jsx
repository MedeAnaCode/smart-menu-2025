import { useState } from 'react';
import { sendData } from '../api';

function RecipeForm({ onSuccess }) {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [servings, setServings] = useState(1);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const recipeData = JSON.stringify({
                title,
                ingredients: ingredients.filter(i => i.trim() !== ''),
                description,
                image,
                servings,
            });
            const response = await sendData('/api/recipes', recipeData);
            onSuccess?.(data); //чтобы передать data наверх, родительскому компоненту

            // Очистка формы
            setTitle('');
            setIngredients(['']);
            setDescription('');
            setImage('');
            setServings(1);
        } catch (err) {
            console.error('Ошибка при создании рецепта:', err);
            setError(err.message);
        }
    };

    const updateIngredient = (index, value) => {
        const newList = [...ingredients];
        newList[index] = value;
        setIngredients(newList);
    };

    const addIngredient = () => setIngredients([...ingredients, '']);

    return (
        <form onSubmit={handleSubmit}>
            <h2>Добавить рецепт</h2>

            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Название"
            />

            {ingredients.map((ing, idx) => (
                <input
                    key={idx}
                    value={ing}
                    onChange={e => updateIngredient(idx, e.target.value)}
                    placeholder={Ингредиент ${idx + 1}}
                />
            ))}
            <button type="button" onClick={addIngredient}>+ Ингредиент</button>

            <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Описание"
            />

            <input
                type="text"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="URL изображения"
            />

            <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(parseInt(e.target.value) || 1)}
                placeholder="Количество порций"
            />

            <button type="submit">Создать</button>

            {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
        </form>
    );
}

export default RecipeForm;

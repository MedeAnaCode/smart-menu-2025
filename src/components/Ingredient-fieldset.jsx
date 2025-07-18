import React from "react";
import { useState } from 'react';

function IngredientFieldset ({arr, index, onSuccess}) {
    const [ingredients, setIngredients] = useState([...arr]);

    function updateIngredient(index, field, value) {
        setIngredients(prev => {
            const newIngredients = [...prev];
            newIngredients[index] = { ...newIngredients[index], [field]: value };
            return newIngredients;
        });

        onSuccess?.(ingredients);
    }

    return (
        <fieldset>
            <legend>Ингредиент {index + 1}</legend>
            <input
                type="text"
                placeholder="Название"
                value={ingredients[index]["name"]}
                onChange={(e) => updateIngredient(index, "name", e.target.value)}
            />
            <input
                type="number"
                placeholder="Количество"
                value={parseInt(ingredients[index]["amount"])}
                onChange={(e) => updateIngredient(index, "amount", e.target.value)}
            />
            <select value={ingredients[index]["um"]}
                    onChange={(e) => updateIngredient(index, "um", e.target.value)}>
                <option value="г">г</option>
                <option value="мл">мл</option>
                <option value="шт">шт</option>
                <option value="ч.л.">ч.л.</option>
                <option value="ст.л.">ст.л.</option>
                <option value="по вкусу">по вкусу</option>
            </select>
        </fieldset>
    );
}

export default IngredientFieldset;

//Сделать удаление ингредиента

// - Добавить id и связанный <label htmlFor="..."> для улучшения доступности
// - Настроить минимальные и максимальные значения для input[type="number"]
// - Продумать поддержку дробных значений через step (например, step="0.1")


import React from "react";
import type { Ingredient, IngredientFieldsetProps } from './../types/index';

function IngredientFieldset ({arr, index, onChange, onClickDel}: IngredientFieldsetProps) {
    const ingredient: Ingredient = arr[index];

    return (
        <fieldset>
            <legend>Ингредиент {index + 1}</legend>
            <label
                className="visually-hidden"
                htmlFor={`name-${index}`}
            >Название.</label>
            <input
                id={`name-${index}`}
                type="text"
                placeholder="Название"
                value={ingredient["name"]}
                onChange={(e) => onChange(index, "name", e.target.value)}
            />
            <label
                className="visually-hidden"
                htmlFor={`amount-${index}`}
            >Количество.</label>
            <input
                id={`amount-${index}`}
                type="number"
                placeholder="Количество"
                value={ingredient["amount"]}
                onChange={(e) => onChange(index, "amount", e.target.value)}
            />
            <label
                className="visually-hidden"
                htmlFor={`um-${index}`}
            >Единицы измерения.</label>
            <select
                id={`um-${index}`}
                value={ingredient["um"]}
                onChange={(e) => onChange(index, "um", e.target.value)}>
                <option value="г">г</option>
                <option value="мл">мл</option>
                <option value="шт">шт</option>
                <option value="ч.л.">ч.л.</option>
                <option value="ст.л.">ст.л.</option>
                <option value="по вкусу">по вкусу</option>
            </select>
            <button type="button" onClick={() => onClickDel(index)}>
                Удалить
            </button>
        </fieldset>
    );
}

export default IngredientFieldset;

// - Настроить минимальные и максимальные значения для input[type="number"]
// - Продумать поддержку дробных значений через step (например, step="0.1")


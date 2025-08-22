import React from "react";

function IngredientFieldset ({arr, index, onChange, onClickDel}) {
    const ingredient = arr[index];

    return (
        <fieldset>
            <legend>Ингредиент {index + 1}</legend>
            <input
                type="text"
                placeholder="Название"
                value={ingredient["name"]}
                onChange={(e) => onChange(index, "name", e.target.value)}
            />
            <input
                type="number"
                placeholder="Количество"
                value={parseInt(ingredient["amount"])}
                onChange={(e) => onChange(index, "amount", e.target.value)}
            />
            <select value={ingredient["um"]}
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

//Сделать удаление ингредиента

// - Добавить id и связанный <label htmlFor="..."> для улучшения доступности
// - Настроить минимальные и максимальные значения для input[type="number"]
// - Продумать поддержку дробных значений через step (например, step="0.1")


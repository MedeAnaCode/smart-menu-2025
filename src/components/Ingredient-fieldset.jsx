import React from "react";

function IngredientFieldset ({index}) {
    return (
        <fieldset>
            <legend>Ингредиент {index}</legend>
            <input type="text" placeholder="Название"/>
            <input type="number" placeholder="Количество"/>
            <select>
                <option value="г">г</option>
                <option value="мл">мл</option>
                <option value="шт">шт</option>
                <option value="ч.л.">ч.л.</option>
                <option value="ст.л.">ст.л.</option>
            </select>
        </fieldset>
    );
}

export default IngredientFieldset;

// - Добавить всем input/select элементам атрибут name для последующей отправки данных
// - Добавить id и связанный <label htmlFor="..."> для улучшения доступности
// - Настроить минимальные и максимальные значения для input[type="number"]
// - Продумать поддержку дробных значений через step (например, step="0.1")


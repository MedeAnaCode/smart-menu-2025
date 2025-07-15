import React from 'react';
import RecipesList from './Recipes-list';
import { useEffect, useState } from "react";

function Recipes () {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // берем рецепты с API. В докере backend доступен по проксированию
        // через nginx, поэтому обращаемся к относительному пути
        fetch("/api/recipes")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setRecipes(data);
                } else {
                    console.error("Неожиданный ответ сервера", data);
                    setError(true);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Ошибка при получении рецептов:", err);
                setError(true);
                setLoading(false);
            });
    }, []); //запускается один раз при отрисовке RecipeList, используем его для запроса рецптов с сервера

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Не удалось загрузить рецепты</div>;

    return (
        <>
            <h1 className="visually-hidden">
                Рецепты "Smart menu".
            </h1>
            <RecipesList recipes={recipes}>
            </RecipesList>
        </>
    );
}

export default Recipes;

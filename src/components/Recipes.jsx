import React from 'react';
import RecipesList from './Recipes-list';
import AddRecipeForm from "./Add-recipe-form";
import { useEffect, useState } from "react";

function Recipes () {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3001/recipes")
            .then((res) => res.json())
            .then((data) => {
                setRecipes(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка при получении рецептов:", error);
                setLoading(false);
            });
    }, []); //запускается один раз при отрисовке RecipeList, используем его для запроса рецптов с сервера

    if (loading) return <div>Загрузка...</div>;

    return (
        <>
            <h1 className="visually-hidden">
                Рецепты "Smart menu".
            </h1>
            <RecipesList recipes={recipes}>
            </RecipesList>
            <AddRecipeForm>
            </AddRecipeForm>
        </>
    );
}

export default Recipes;

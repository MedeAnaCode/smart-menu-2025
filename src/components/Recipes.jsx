import React from 'react';
import RecipesList from './Recipes-list';
import AddRecipeForm from "./Add-recipe-form";
import {getData} from "../api";
import { useEffect, useState } from "react";

function Recipes () {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData('/recipes')
            .then((data) => {
                setRecipes(data);
            })
            .catch((error) => {
                console.error("Ошибка при получении рецептов:", error);
            })
            .finally( () => {
                setLoading(false);
                }
            );
    }, []); //запускается один раз при отрисовке RecipeList, используем его для запроса рецптов с сервера

    if (loading) return <div>Загрузка...</div>;

    return (
        <>
            <h1 className="visually-hidden">
                Рецепты "Smart menu".
            </h1>
            <RecipesList recipes={recipes}>
            </RecipesList>
            <AddRecipeForm onSuccess={(newRecipe) => setRecipes((prev) => [...prev, newRecipe])}>
            </AddRecipeForm>
        </>
    );
}

export default Recipes;

//Надо потестировать с разным размером изображений

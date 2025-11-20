import React from 'react';
import RecipesList from './Recipes-list';
import AddRecipeForm from "./Add-recipe-form";
import EditRecipeForm from "./Edit-recipe-form";
import {deleteData, getData, updateData} from "../api";
import { useEffect, useState } from "react";

function Recipes () {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    const startEdit = (id) => setEditingId(id);
    const cancelEdit = () => setEditingId(null);
    const refetchRecipes = () => getData('/recipes').then(setRecipes).catch(console.error);
    const deleteRecipe = async (id) => await deleteData(`/recipes/${id}`);
    const updateRecipe = async (id, params) => await updateData(`/recipes/${id}`, params);

    const recipeToEdit = recipes.find(r => r.id === editingId) || null;

    const onDelete = async (id) => {
        try {
            await deleteRecipe(id);
            console.log("Удалено:" + id);
            await refetchRecipes();
        } catch (err) {
            console.error("Ошибка удаления " + err);
        }
    };

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
            <RecipesList recipes={recipes} onEdit={startEdit} onDelete={onDelete}>
            </RecipesList>
            {
                editingId?
                    <EditRecipeForm
                    initialValues={recipeToEdit}
                    onSaved={async (patch) => {
                        await updateRecipe(editingId, patch);
                        await refetchRecipes();
                        cancelEdit();
                    }}
                    onCancel={cancelEdit}
                    >
                    </EditRecipeForm>
                    :
                    <AddRecipeForm onSuccess={(newRecipe) => {
                        refetchRecipes();
                    }}>
                    </AddRecipeForm>
            }

        </>
    );
}

export default Recipes;

//Надо потестировать с разным размером изображений

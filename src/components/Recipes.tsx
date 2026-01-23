import React from 'react';
import RecipesList from './Recipes-list';
import AddRecipeForm from "./Add-recipe-form";
import EditRecipeForm from "./Edit-recipe-form";
import {useGetRecipesQuery, useDeleteRecipeMutation, useUpdateRecipeMutation} from "../apiRtk";
import { useState } from "react";
import type { Recipe } from './../types/index';

function Recipes () {
    const {data: recipes, error, isLoading} = useGetRecipesQuery();
    const [deleteRecipe] = useDeleteRecipeMutation();
    const [updateRecipe] = useUpdateRecipeMutation();
    const [editingId, setEditingId] = useState<number|null>(null);

    const startEdit = (id: number) => setEditingId(id);
    const cancelEdit = () => setEditingId(null);
    const recipeToEdit: Recipe | null= recipes?.find(r => r.id === editingId) || null;

    const onDelete = async (id: number): Promise<void> => {
        try {
            await deleteRecipe(id).unwrap();
            console.log("Удалено:" + id);
        } catch (err) {
            console.error("Ошибка удаления " + err);
        }
    };

    return (
        <>
            <h1 className="visually-hidden">
                Рецепты "Smart menu".
            </h1>
            {error? (<div>Ошибка при получении рецептов {"status" in error ? error.status : "unknown"}</div>) :
                isLoading? (<div>Загрузка...</div>) :
                    recipes? (< RecipesList recipes={recipes} onEdit={startEdit} onDelete={onDelete}>
                    </RecipesList>) : null
            }
            {
                editingId !== null?
                    <EditRecipeForm
                    initialValues={recipeToEdit}
                    onSaved={async (patch: Partial<Recipe>) => {
                        await updateRecipe({id: editingId, patch}).unwrap();
                        cancelEdit();
                    }}
                    onCancel={cancelEdit}
                    >
                    </EditRecipeForm>
                    :
                    <AddRecipeForm onSuccess={() => {}}>
                    </AddRecipeForm>
            }

        </>
    );
}

export default Recipes;

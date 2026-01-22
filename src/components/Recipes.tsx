import React from 'react';
import RecipesList from './Recipes-list';
import AddRecipeForm from "./Add-recipe-form";
import EditRecipeForm from "./Edit-recipe-form";
import {deleteData, updateData} from "../api";
import {useGetRecipesQuery} from "../apiRtk";
import { useState } from "react";
import type { Recipe } from './../types/index';

function Recipes () {
    const {data: recipes, error, isLoading} = useGetRecipesQuery();
    // const [recipes, setRecipes] = useState<Recipe[]>([]);
    // const [loading, setLoading] = useState<boolean>(true);
    const [editingId, setEditingId] = useState<number|null>(null);

    const startEdit = (id: number) => setEditingId(id);
    const cancelEdit = () => setEditingId(null);
    // const refetchRecipes = (): Promise<void> => getData<Recipe[]>('/recipes').then(setRecipes).catch(console.error);
    const deleteRecipe = async (id: number) => await deleteData(`/recipes/${id}`);
    //пока написала Partial<Recipe>, но вообще стоит вернуться и уточнить, что там у меня отправляется на сервер
    const updateRecipe = async (id: number, params: Partial<Recipe>): Promise<true | unknown> => await updateData(`/recipes/${id}`, params);

    const recipeToEdit: Recipe | null= recipes?.find(r => r.id === editingId) || null;

    const onDelete = async (id: number): Promise<void> => {
        try {
            await deleteRecipe(id);
            console.log("Удалено:" + id);
            // await refetchRecipes();
        } catch (err) {
            console.error("Ошибка удаления " + err);
        }
    };

    // useEffect(() => {
    //     getData<Recipe[]>('/recipes')
    //         .then((data) => {
    //             setRecipes(data);
    //         })
    //         .catch((error) => {
    //             console.error("Ошибка при получении рецептов:", error);
    //         })
    //         .finally( () => {
    //             setLoading(false);
    //             }
    //         );
    // }, []); //запускается один раз при отрисовке RecipeList, используем его для запроса рецптов с сервера
    //
    // if (loading) return <div>Загрузка...</div>;

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
                editingId?
                    <EditRecipeForm
                    initialValues={recipeToEdit}
                    onSaved={async (patch: Partial<Recipe>) => {
                        await updateRecipe(editingId, patch);
                        // await refetchRecipes();
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

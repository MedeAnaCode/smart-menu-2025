import React from 'react';
import RecipesList from './Recipes-list';
import AddRecipeForm from "./Add-recipe-form";
import EditRecipeForm from "./Edit-recipe-form";
import {useGetRecipesQuery, useDeleteRecipeMutation, useUpdateRecipeMutation} from "../apiRtk";
import { useState } from "react";
import { Modal } from "./Modal";
import type { Recipe } from './../types/index';

// TODO (modal UX):
// 1) "Новый рецепт" должен сбрасывать editingId в null перед открытием,
//    иначе после редактирования может снова открыться Edit.
// 2) При закрытии модалки (Esc/overlay/крестик) стоит сбрасывать editingId в null,
//    чтобы режим всегда был предсказуемым.
// 3) onCancel/onSaved должны закрывать модалку (setOpen(false)) + reset editingId,
//    сейчас они только сбрасывают editingId.
// 4) Заголовок модалки стоит делать динамическим: edit/create.

function Recipes () {
    const {data: recipes, error, isLoading} = useGetRecipesQuery();
    const [deleteRecipe] = useDeleteRecipeMutation();
    const [updateRecipe] = useUpdateRecipeMutation();
    const [editingId, setEditingId] = useState<number|null>(null);
    const [open, setOpen] = React.useState(false);

    const startEdit = (id: number) => {
        setEditingId(id);
        setOpen(true);
    }
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
            {error ? (<div>Ошибка при получении рецептов {"status" in error ? error.status : "unknown"}</div>) :
                isLoading ? (<div>Загрузка...</div>) :
                    recipes ? (< RecipesList recipes={recipes} onEdit={startEdit} onDelete={onDelete}>
                    </RecipesList>) : null
            }
            <button type="button" onClick={() => setOpen(true)}>
                Новый рецепт
            </button>

            <Modal open={open} onOpenChange={setOpen} title="Создание рецепта">
                {
                    editingId !== null ?
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
            </Modal>
        </>
    );
}

export default Recipes;

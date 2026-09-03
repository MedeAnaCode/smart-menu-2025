import type {EditRecipeFormProps} from "../types";
import type {RecipeFormValues} from "../validation/recipe";
import RecipeForm from "./RecipeForm";

function EditRecipeForm({initialValues, onSaved, onCancel, onBusyChange}: EditRecipeFormProps) {
    if (!initialValues) return <p>Рецепт не найден.</p>;

    const values: RecipeFormValues = {
        title: initialValues.title,
        description: initialValues.description,
        category: initialValues.category,
        ingredients: initialValues.ingredients.map((ingredient) => ({
            ...ingredient,
            amount: ingredient.amount ?? "",
            um: ingredient.um ?? "",
            custom: ingredient.custom ?? !ingredient.commonIngredientId,
        })),
        preparing: initialValues.preparing,
        image: initialValues.image,
        servings: initialValues.servings,
    };

    return (
        <RecipeForm
            onBusyChange={onBusyChange}
            initialValues={values}
            submitLabel="Сохранить изменения"
            onSubmit={onSaved}
            onCancel={onCancel}
        />
    );
}

export default EditRecipeForm;

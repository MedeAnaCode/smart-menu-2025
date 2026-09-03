import {useSendRecipeMutation} from "../apiRtk";
import type {AddRecipeFormProps} from "../types";
import type {RecipeFormValues} from "../validation/recipe";
import RecipeForm from "./RecipeForm";

function AddRecipeForm({onSuccess, onBusyChange}: AddRecipeFormProps) {
    const [sendRecipe] = useSendRecipeMutation();

    const createRecipe = async (values: RecipeFormValues) => {
        await sendRecipe(values).unwrap();
        onSuccess();
    };

    return <RecipeForm submitLabel="Создать рецепт" onSubmit={createRecipe} onCancel={onSuccess} onBusyChange={onBusyChange} />;
}

export default AddRecipeForm;

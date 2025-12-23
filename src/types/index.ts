//Recipes
type Ingredient = {
    name: string,
    amount?: string,
    um?: string,
}

type Recipe = {
    title: string,
    ingredients: Ingredient[],
    description: string,
    image: string,
    servings: number,
    id: number,
}

//Recipes-list
type RecipesListProps = {
    recipes: Recipe[],
    onEdit: (id: number) => void,
    onDelete: (id: number) => Promise<void>
}

//Recipe-card
type RecipeCardProps = {
    title: string,
    preparingText: string,
    imageUrl: string,
    ingredients: Ingredient[],
    id: number,
    index: number,
    servings: number,
    onEdit: (id: number) => void,
    onDelete: (id: number) => Promise<void>
}

//api
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ApiOptions = Readonly<{
    method: HttpMethod;
    headers?: Record<string, string>;
}>;

//Ingredient-fieldset
type IngredientKey = keyof Ingredient;

type IngredientFieldsetProps = {
    arr: Ingredient[],
    index: number,
    onChange: (index: number, field: IngredientKey, value: string) => void,
    onClickDel: (indexToDelete: number) => void
}

//Add-recipe-form
type AddRecipeFormProps = {
    onSuccess: () => void
}

export type {
    Ingredient,
    IngredientKey,
    Recipe,
    HttpMethod,
    ApiOptions,
    RecipesListProps,
    RecipeCardProps,
    IngredientFieldsetProps,
    AddRecipeFormProps
};

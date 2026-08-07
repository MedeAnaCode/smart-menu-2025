type CommonIngredient = {
    id: number;
    name: string;
};

type Ingredient = {
    id?: number;
    name: string;
    amount: string;
    um: string;
    commonIngredientId?: number | null;
    custom?: boolean;
};

type Recipe = {
    title: string;
    description: string;
    category: string;
    ingredients: Ingredient[];
    preparing: string;
    image: string;
    servings: number;
    id: number;
    ownerId?: number | null;
    isPublished?: boolean;
    publishedAt?: string | null;
    author?: {
        id: number;
        name: string;
    } | null;
};

type RecipeSnapshot = Omit<Recipe, "id" | "ownerId" | "isPublished" | "publishedAt" | "author"> & {
    originalRecipeId: number;
    authorId: number | null;
    capturedAt: string;
};

type MenuRecipe = {
    id: string;
    recipeId: number;
    servings: number;
    includeInShopping: boolean;
    recipeSnapshot: RecipeSnapshot;
};

type ExtraProduct = {
    id: string;
    name: string;
    amount: string;
    um: string;
    includeInShopping: boolean;
    commonIngredientId?: number | null;
    custom?: boolean;
};

type Meal = {
    id: string;
    title: string;
    includeInShopping: boolean;
    recipes: MenuRecipe[];
    extraProducts: ExtraProduct[];
};

type MenuDay = {
    id: string;
    date: string;
    title: string;
    includeInShopping: boolean;
    meals: Meal[];
    comment?: string;
};

type WeeklyMenu = {
    id: number;
    userId: number;
    title: string;
    description: string;
    days: MenuDay[];
};

type ShoppingListItem = {
    id: string;
    name: string;
    amount: string;
    um: string;
    source: string;
    sourceType: "common" | "custom" | "extra" | "manual";
    commonIngredientId?: number | null;
    checked: boolean;
    manual: boolean;
};

type ShoppingList = {
    id?: number;
    menuId: number;
    items: ShoppingListItem[];
    manualDirty: boolean;
};

type User = {
    id: number;
    email: string;
    name: string;
    keycloakId: string;
};

type MyRecipesResponse = {
    owned: Recipe[];
    saved: Array<{savedId: number; recipeId: number; recipe: Recipe}>;
};

type RecipesListProps = {
    recipes: Recipe[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => Promise<void>;
};

type RecipeCardProps = {
    title: string;
    preparingText: string;
    imageUrl: string;
    ingredients: Ingredient[];
    id: number;
    index: number;
    servings: number;
    onEdit: (id: number) => void;
    onDelete: (id: number) => Promise<void>;
};

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ApiOptions = Readonly<{
    method: HttpMethod;
    headers?: Record<string, string>;
}>;

type IngredientKey = keyof Ingredient;

type IngredientFieldsetProps = {
    arr: Ingredient[];
    index: number;
    onChange: (index: number, field: IngredientKey, value: string) => void;
    onClickDel: (indexToDelete: number) => void;
};

type AddRecipeFormProps = {
    onSuccess: () => void;
};

type EditRecipeFormProps = {
    initialValues: Recipe | null;
    onSaved: (patch: Partial<Recipe>) => Promise<void>;
    onCancel: () => void;
};

type UpdateRecipeArg = {
    id: number;
    patch: Partial<Recipe>;
};

type RecipeCreation = Omit<Recipe, "id" | "ownerId" | "isPublished" | "publishedAt" | "author">;
type EditableFields = "title" | "description" | "category" | "ingredients" | "preparing" | "image" | "servings";

export type {
    AddRecipeFormProps,
    ApiOptions,
    CommonIngredient,
    EditableFields,
    EditRecipeFormProps,
    ExtraProduct,
    HttpMethod,
    Ingredient,
    IngredientFieldsetProps,
    IngredientKey,
    Meal,
    MenuDay,
    MenuRecipe,
    MyRecipesResponse,
    Recipe,
    RecipeCardProps,
    RecipeCreation,
    RecipeSnapshot,
    RecipesListProps,
    ShoppingList,
    ShoppingListItem,
    UpdateRecipeArg,
    User,
    WeeklyMenu,
};

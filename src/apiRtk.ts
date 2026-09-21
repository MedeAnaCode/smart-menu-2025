import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {
    CommonIngredient,
    MyRecipesResponse,
    Recipe,
    RecipeCreation,
    ShoppingList,
    UpdateRecipeArg,
    User,
    WeeklyMenu
} from "./types";
import {getAccessToken} from "./auth/keycloak";

export type RecipeImportDraft = {title:string;description:string;preparing:string;servings:number;servingsSource:"explicit"|"estimated";ingredients:Array<{name:string;amount:string;um:"г"|"кг"|"мл"|"л"|"шт"|"ч.л."|"ст.л."|"по вкусу";needsReview:boolean;warning?:string}>;warnings:string[]};

export const apiRtk = createApi({
    reducerPath: "apiRtk",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
        prepareHeaders: async (headers) => {
            const currentToken = await getAccessToken();
            if (currentToken) headers.set("authorization", `Bearer ${currentToken}`);
            return headers;
        },
    }),
    tagTypes: ["Auth", "Recipe", "Menu", "ShoppingList"],
    endpoints: (builder) => ({
        me: builder.query<{user: User}, void>({
            query: () => "/auth/me",
            providesTags: ["Auth"],
        }),
        getIngredients: builder.query<CommonIngredient[], string | void>({
            query: (query) => `/ingredients${query ? `?q=${encodeURIComponent(query)}` : ""}`,
        }),
        getRecipes: builder.query<Recipe[], string | void>({
            query: (query) => `/recipes${query ? `?q=${encodeURIComponent(query)}` : ""}`,
            providesTags: ["Recipe"],
        }),
        getMyRecipes: builder.query<MyRecipesResponse, void>({
            query: () => "/recipes/mine",
            providesTags: ["Recipe"],
        }),
        sendRecipe: builder.mutation<Recipe, RecipeCreation>({
            query: (body) => ({url: "/recipes", method: "POST", body}),
            invalidatesTags: ["Recipe"],
        }),
        importRecipe: builder.mutation<RecipeImportDraft, {text: string}>({
            query: (body) => ({url: "/recipes/import", method: "POST", body}),
        }),
        deleteRecipe: builder.mutation<void, number>({
            query: (id) => ({url: `/recipes/${id}`, method: "DELETE"}),
            invalidatesTags: ["Recipe", "Menu", "ShoppingList"],
        }),
        updateRecipe: builder.mutation<Recipe, UpdateRecipeArg>({
            query: ({id, patch}) => ({url: `/recipes/${id}`, method: "PATCH", body: patch}),
            invalidatesTags: ["Recipe"],
        }),
        publishRecipe: builder.mutation<Recipe, number>({
            query: (id) => ({url: `/recipes/${id}/publish`, method: "POST"}),
            invalidatesTags: ["Recipe"],
        }),
        unpublishRecipe: builder.mutation<Recipe, number>({
            query: (id) => ({url: `/recipes/${id}/unpublish`, method: "POST"}),
            invalidatesTags: ["Recipe"],
        }),
        saveRecipe: builder.mutation<void, number>({
            query: (id) => ({url: `/recipes/${id}/save`, method: "POST"}),
            invalidatesTags: ["Recipe"],
        }),
        unsaveRecipe: builder.mutation<void, number>({
            query: (id) => ({url: `/recipes/${id}/save`, method: "DELETE"}),
            invalidatesTags: ["Recipe"],
        }),
        cloneRecipe: builder.mutation<Recipe, number>({
            query: (id) => ({url: `/recipes/${id}/clone`, method: "POST"}),
            invalidatesTags: ["Recipe"],
        }),
        uploadRecipeImage: builder.mutation<{url: string}, FormData>({
            query: (body) => ({url: "/recipes/image", method: "POST", body}),
        }),
        getMenus: builder.query<WeeklyMenu[], void>({
            query: () => "/menus",
            providesTags: ["Menu"],
        }),
        createMenu: builder.mutation<WeeklyMenu, {title: string; description?: string}>({
            query: (body) => ({url: "/menus", method: "POST", body}),
            invalidatesTags: ["Menu"],
        }),
        updateMenu: builder.mutation<WeeklyMenu, {id: number; patch: Partial<WeeklyMenu>}>({
            query: ({id, patch}) => ({url: `/menus/${id}`, method: "PATCH", body: patch}),
            invalidatesTags: ["Menu", "ShoppingList"],
        }),
        deleteMenu: builder.mutation<void, number>({
            query: (id) => ({url: `/menus/${id}`, method: "DELETE"}),
            invalidatesTags: ["Menu", "ShoppingList"],
        }),
        addRecipeToMenu: builder.mutation<WeeklyMenu, {menuId: number; mealId: string; recipeId: number; servings: number}>({
            query: ({menuId, ...body}) => ({url: `/menus/${menuId}/recipes`, method: "POST", body}),
            invalidatesTags: ["Menu", "ShoppingList"],
        }),
        getShoppingList: builder.query<ShoppingList, number>({
            query: (menuId) => `/menus/${menuId}/shopping-list`,
            providesTags: ["ShoppingList"],
        }),
        calculateShoppingList: builder.mutation<ShoppingList, number>({
            query: (menuId) => ({url: `/menus/${menuId}/shopping-list/calculate`, method: "POST"}),
            invalidatesTags: ["ShoppingList"],
        }),
        updateShoppingList: builder.mutation<ShoppingList, {menuId: number; items: ShoppingList["items"]}>({
            query: ({menuId, items}) => ({url: `/menus/${menuId}/shopping-list`, method: "PATCH", body: {items}}),
            invalidatesTags: ["ShoppingList"],
        }),
    }),
});

export const {
    useAddRecipeToMenuMutation,
    useCalculateShoppingListMutation,
    useCloneRecipeMutation,
    useCreateMenuMutation,
    useDeleteRecipeMutation,
    useDeleteMenuMutation,
    useGetMenusQuery,
    useGetIngredientsQuery,
    useGetMyRecipesQuery,
    useGetRecipesQuery,
    useGetShoppingListQuery,
    useLazyMeQuery,
    usePublishRecipeMutation,
    useSaveRecipeMutation,
    useSendRecipeMutation,
    useUnpublishRecipeMutation,
    useImportRecipeMutation,
    useUnsaveRecipeMutation,
    useUploadRecipeImageMutation,
    useUpdateMenuMutation,
    useUpdateRecipeMutation,
    useUpdateShoppingListMutation,
} = apiRtk;

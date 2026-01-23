import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {Recipe} from './types/index';

type UpdateRecipeArg = {
    id: number;
    patch: Partial<Recipe>;
};

export const apiRtk = createApi({
    reducerPath: "apiRtk",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
    }),
    tagTypes: ["Recipe"],
    endpoints: (builder) => ({
        //recipes
        getRecipes: builder.query<Recipe[], void>({
            query: () => "/recipes",
            providesTags: ["Recipe"],
        }),
        sendRecipe: builder.mutation<Recipe, Partial<Recipe>>({
            query: (body) => ({
                url: "/recipes",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Recipe"], //после этой мутации данные с providesTags: ["Recipe"] считаются устаревшими
        }),
        deleteRecipe: builder.mutation<void, number>({
            query: (id) => ({
                url: `/recipes/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Recipe"],
        }),
        updateRecipe: builder.mutation<Recipe, UpdateRecipeArg>({
            query: ({id, patch}) => ({
                url: `/recipes/${id}`,
                method: "PATCH",
                body: patch,
            }),
            invalidatesTags: ["Recipe"],
        }),
    }),
});

export const {
    useGetRecipesQuery,
    useSendRecipeMutation,
    useDeleteRecipeMutation,
    useUpdateRecipeMutation
} = apiRtk;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {Recipe} from './types/index';

export const apiRtk = createApi({
    reducerPath: "apiRtk",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
    }),
    tagTypes: ["Recipe"],
    endpoints: (builder) => ({
        getRecipes: builder.query<Recipe[], void>({
            query: () => "/recipes",
            providesTags: ["Recipe"],
        }),
        //тут опишем другие эндпоинты
    }),
});

export const { useGetRecipesQuery } = apiRtk;

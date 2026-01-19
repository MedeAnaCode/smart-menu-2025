import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiRtk = createApi({
    reducerPath: "apiRtk",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
    }),
    endpoints: (builder) => ({
        getRecipes: builder.query<any, void>({
            query: () => "/recipes",
        }),
    }),
});

export const { useGetRecipesQuery } = apiRtk;

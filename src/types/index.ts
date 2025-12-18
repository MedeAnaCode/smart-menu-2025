//Recipes
type Ingredient = {
    name: string,
    amount: string,
    um: string,
}

type Recipe = {
    title: string,
    ingredients: Ingredient[],
    description: string,
    image: string,
    servings: number,
    id?: number,
}

//api
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ApiOptions = Readonly<{
    method: HttpMethod;
    headers?: Record<string, string>;
}>;

export type { Ingredient, Recipe, HttpMethod, ApiOptions };

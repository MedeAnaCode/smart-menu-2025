import React from 'react';
import RecipeCard from "./Recipe-card";
import type { Recipe, RecipesListProps } from './../types/index';

function RecipesList({ recipes, onEdit, onDelete }: RecipesListProps) {

    return (
        <div className="recipes-container">
            {recipes.map((recipe: Recipe, index: number) => (
                <RecipeCard
                    key={recipe.id}
                    index={index}
                    id={recipe.id}
                    imageUrl={recipe.image}
                    title={recipe.title}
                    preparingText={recipe.preparing}
                    ingredients={recipe.ingredients}
                    servings={recipe.servings}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default RecipesList;

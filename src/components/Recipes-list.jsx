import React, {useState} from 'react';
import RecipeCard from "./Recipes-card";

function RecipesList({ recipes, onEdit, onDelete }) {

    return (
        <div className="recipes-container">
            {recipes.map((recipe, index) => (
                <RecipeCard
                    key={recipe.id}
                    index={index}
                    id={recipe.id}
                    imageUrl={recipe.image}
                    title={recipe.title}
                    preparingText={recipe.description}
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

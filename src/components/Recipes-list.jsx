import React, {useState} from 'react';
import RecipeCard from "./Recipes-card";

function RecipesList({ recipes, onDelete }) {

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
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default RecipesList;

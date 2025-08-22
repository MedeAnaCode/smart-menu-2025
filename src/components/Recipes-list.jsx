import React from 'react';
import RecipeCard from "./Recipes-card";

function RecipesList({ recipes }) {
    return (
        <div className="recipes-container">
            {recipes.map((recipe, index) => (
                <RecipeCard
                    key={index}
                    index={index}
                    imageUrl={recipe.image}
                    title={recipe.title}
                    preparingText={recipe.description}
                    ingredients={recipe.ingredients}
                />
            ))}
        </div>
    );
}

export default RecipesList;

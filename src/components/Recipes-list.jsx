import React from 'react';
import RecipeCard from "./Recipes-card";

class RecipesList extends React.Component {
    render() {
        const recipes = this.props;

        return (
            <div className="recipes-list">
                return({
                recipes.map((recipe, index) => (
                    <RecipeCard
                        key={index}
                        imageUrl= {recipe.image}
                        title={recipe.title}
                        preparingText={recipe.description}
                    />
                ))}
                );
            </div>
        );
    }
}

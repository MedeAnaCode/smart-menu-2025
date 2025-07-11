import React from 'react';

function RecipeCard (props) {
    const { title, preparingText, imageUrl } = this.props;

    return (
        <div className="cards-container__card recipe-card">
            <img src={imageUrl} alt={title} className="recipe-card__img" />
            <h2 className="recipe-card__title">{title}</h2>
            <span className="recipe-card__option-title">Приготовление:</span>
            <p className="recipe-card__preparing">{preparingText}</p>
        </div>
    );
}

export default RecipeCard;

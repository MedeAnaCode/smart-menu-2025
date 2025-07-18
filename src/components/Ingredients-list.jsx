import React from 'react';

function IngredientCouple (ingred) {
    const {name, amount='', um = 'по вкусу'} = ingred;

    return (
        <>
            <dt className="recipe-card__ingredients-name">{name}</dt>
            <dd className="recipe-card__ingredients-amount">{amount + ' ' + um}</dd>
        </>
    );
}

function IngredientsList ({ingreds}) {
    return <dl className="recipe-card__ingredients">
        {ingreds.map((ingred) => (
            <IngredientCouple {...ingred}/>
        ))}
    </dl>
}

export default IngredientsList;

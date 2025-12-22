import React from 'react'
import type { Ingredient } from './../types/index';

function IngredientCouple ({name, amount = '', um = 'по вкусу'}: Ingredient) {

    return (
        <>
            <dt className="recipe-card__ingredients-name">{name}</dt>
            <dd className="recipe-card__ingredients-amount">{amount + ' ' + um}</dd>
        </>
    );
}

function IngredientsList ({ingreds}: {ingreds: Ingredient[]}) {
    return <dl className="recipe-card__ingredients">
        {ingreds.map((ingred) => (
            //мб потом пересмотреть key
            <IngredientCouple {...ingred} key={`${ingred.name}-${ingred.amount}-${ingred.um}`}/>
        ))}
    </dl>
}

export default IngredientsList;

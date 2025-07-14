import React from 'react';
import RecipesList from './Recipes-list';

const mockRecipes = [
    {
        title: 'Каша',
        description: 'Пышный омлет с помидорами, перцем и луком...',
        image: '/img/porridge.png',
        ingredients: [
            { name: 'Огурцы', amount: 2 },
            { name: 'Помидоры', amount: 3 },
            { name: 'Сыр Фета', amount: '100 г' },
            { name: 'Маслины' },
            { name: 'Лимонный сок', amount: '1 ст. ложка' },
            { name: 'Оливковое масло'}
        ],
    },
    {
        title: 'Цезарь',
        description: 'Освежающий салат с огурцами, помидорами...',
        image: '/img/salad.png',
        ingredients: [
            { name: 'Спагетти', amount: '200 г' },
            { name: 'Бекон'},
            { name: 'Яйца', amount: 2 },
            { name: 'Пармезан', amount: '50 г' },
            { name: 'Чеснок'}
        ],
    }
];


function Recipes () {
    console.log(mockRecipes);

    return (
        <>
            <h1 className="visually-hidden">
                Рецепты "Smart menu".
            </h1>
            <RecipesList recipes={mockRecipes}>
            </RecipesList>
        </>
    );
}

export default Recipes;
// import React from 'react';
// import RecipeCard from './Recipes-card';
// import image1 from './../img/porridge.png';
// import image2 from './../img/salad.png';
//
// function Recipes () {
//
//     return (
//         <section className="functional-page__content recipes-container">
//             <div className="recipes-container__card recipe-card">
//                 <div className="recipe-card__content">
//                     <img src={image1} height="140px" className="recipe-card__img"/>
//                     <h2 className="recipe-card__title">Каша</h2>
//                     <span className="recipe-card__option-title">Приготовление:</span>
//                     <p className="recipe-card__preparing"> Пышный омлет с помидорами, перцем и луком, приправленный солью и перцем.</p>
//                 </div>
//             </div>
//             <div className="recipes-container__card recipe-card">
//                 <div className="recipe-card__content">
//                     <img src={image2} height="140px" className="recipe-card__img"/>
//                     <h2 className="recipe-card__title">Цезарь</h2>
//                     <span className="recipe-card__option-title">Приготовление:</span>
//                     <p className="recipe-card__preparing"> Освежающий салат с огурцами, помидорами, сыром Фета, маслинами, заправленный лимонным соком и оливковым маслом.</p>
//                 </div>
//             </div>
//         </section>
// );
// }
//
// export default Recipes;
//

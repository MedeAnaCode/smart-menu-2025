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
            { name: 'Оливковое масло' },
        ],
    },
    {
        title: 'Цезарь',
        description: 'Освежающий салат с огурцами, помидорами...',
        image: '/img/salad.png',
        ingredients: [
            { name: 'Спагетти', amount: '200 г' },
            { name: 'Бекон' },
            { name: 'Яйца', amount: 2 },
            { name: 'Пармезан', amount: '50 г' },
            { name: 'Чеснок' },
        ],
    },
    {
        title: 'Гречка по-домашнему',
        description: 'Сытное блюдо из гречки с мясом и овощами.',
        image: '/img/porridge.png',
        ingredients: [
            { name: 'Гречка', amount: '150 г' },
            { name: 'Говядина', amount: '200 г' },
            { name: 'Морковь', amount: 1 },
            { name: 'Лук' },
            { name: 'Чеснок' },
        ],
    },
    {
        title: 'Греческий салат',
        description: 'Лёгкий салат с овощами и фетой.',
        image: '/img/salad.png',
        ingredients: [
            { name: 'Помидоры', amount: 2 },
            { name: 'Огурцы', amount: 1 },
            { name: 'Сыр Фета', amount: '100 г' },
            { name: 'Оливки' },
            { name: 'Красный лук', amount: '0.5 шт' },
        ],
    },
    {
        title: 'Овсянка с фруктами',
        description: 'Нежная овсянка с яблоками и корицей.',
        image: '/img/porridge.png',
        ingredients: [
            { name: 'Овсянка', amount: '100 г' },
            { name: 'Молоко', amount: '200 мл' },
            { name: 'Яблоко', amount: 1 },
            { name: 'Корица', amount: 'по вкусу' },
            { name: 'Мёд' },
        ],
    },
    {
        title: 'Салат с тунцом',
        description: 'Питательный салат с консервированным тунцом.',
        image: '/img/salad.png',
        ingredients: [
            { name: 'Тунец консервированный', amount: '1 банка' },
            { name: 'Кукуруза', amount: '100 г' },
            { name: 'Огурцы' },
            { name: 'Яйца', amount: 2 },
            { name: 'Майонез' },
        ],
    },
    {
        title: 'Пшённая каша с тыквой',
        description: 'Ароматная сладкая каша с тыквой.',
        image: '/img/porridge.png',
        ingredients: [
            { name: 'Пшено', amount: '100 г' },
            { name: 'Тыква', amount: '150 г' },
            { name: 'Молоко', amount: '300 мл' },
            { name: 'Сахар', amount: 'по вкусу' },
            { name: 'Сливочное масло' },
        ],
    },
    {
        title: 'Салат с киноа и овощами',
        description: 'Полезный салат с киноа, овощами и зеленью.',
        image: '/img/salad.png',
        ingredients: [
            { name: 'Киноа', amount: '80 г' },
            { name: 'Огурцы' },
            { name: 'Помидоры черри', amount: '100 г' },
            { name: 'Петрушка' },
            { name: 'Оливковое масло', amount: '2 ст. ложки' },
        ],
    },
    {
        title: 'Рис с овощами',
        description: 'Жареный рис с морковью и перцем.',
        image: '/img/porridge.png',
        ingredients: [
            { name: 'Рис', amount: '150 г' },
            { name: 'Морковь' },
            { name: 'Перец сладкий', amount: 1 },
            { name: 'Соевый соус', amount: 'по вкусу' },
            { name: 'Растительное масло' },
        ],
    },
    {
        title: 'Салат с курицей и ананасом',
        description: 'Необычный салат с копчёной курицей и ананасом.',
        image: '/img/salad.png',
        ingredients: [
            { name: 'Курица копчёная', amount: '150 г' },
            { name: 'Ананас консервированный', amount: '100 г' },
            { name: 'Сыр', amount: '50 г' },
            { name: 'Майонез' },
            { name: 'Орехи грецкие' },
        ],
    },
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

const Recipe = require("../models/recipe");
const sequelize = require("../db/sequelize");

async function seedRecipes() {

    await (async () => {
        await sequelize.sync({force: true})
    })();

    await Recipe.bulkCreate([
        {
            title: 'Салат Греческий',
            ingredients: [
                { name: 'Огурцы', amount: '2 шт' },
                { name: 'Помидоры', amount: '3 шт' },
                { name: 'Сыр Фета', amount: '100 г' },
                { name: 'Маслины', amount: 'по вкусу' },
                { name: 'Лимонный сок', amount: '1 ст.л.' },
                { name: 'Оливковое масло', amount: '2 ст.л.' }
            ],
            description: 'Освежающий салат с огурцами, помидорами, сыром Фета, маслинами, заправленный лимонным соком и оливковым маслом.',
            image: '/img/salad.png'
        },
        {
            title: 'Паста Карбонара',
            ingredients: [
                { name: 'Спагетти', amount: '200 г' },
                { name: 'Бекон', amount: '150 г' },
                { name: 'Яйца', amount: '2 шт' },
                { name: 'Пармезан', amount: '50 г' },
                { name: 'Чеснок', amount: '1 зубчик' }
            ],
            description: 'Итальянская паста с беконом, смешанная с яйцами, сыром Пармезан и чесноком.',
            image: '/img/porridge.png'
        },
        {
            title: 'Курица Терияки',
            ingredients: [
                { name: 'Куриное филе', amount: '300 г' },
                { name: 'Соус Терияки', amount: '3 ст.л.' },
                { name: 'Соевый соус', amount: '2 ст.л.' },
                { name: 'Мед', amount: '1 ч.л.' },
                { name: 'Чеснок', amount: '1 зубчик' },
                { name: 'Имбирь', amount: 'щепотка' }
            ],
            description: 'Нежное куриное мясо, маринованное в соусе Терияки, подается с рисом и овощами.',
            image: '/img/salad.png'
        },
        {
            title: 'Суп Минестроне',
            ingredients: [
                { name: 'Бульон', amount: '500 мл' },
                { name: 'Томаты', amount: '2 шт' },
                { name: 'Морковь', amount: '1 шт' },
                { name: 'Лук', amount: '1 шт' },
                { name: 'Сельдерей', amount: '1 стебель' },
                { name: 'Макароны', amount: '100 г' }
            ],
            description: 'Итальянский суп с томатами, морковью, луком, сельдереем и макаронами.',
            image: '/img/porridge.png'
        },
        {
            title: 'Тайский суп Том Ям',
            ingredients: [
                { name: 'Кокосовое молоко', amount: '200 мл' },
                { name: 'Лимонграсс', amount: '1 стебель' },
                { name: 'Листья лайма', amount: '3 листа' },
                { name: 'Креветки', amount: '100 г' },
                { name: 'Грибы', amount: '50 г' }
            ],
            description: 'Острый тайский суп на основе кокосового молока с креветками, лимонграссом, листьями лайма и грибами.',
            image: '/img/salad.png'
        },
        {
            title: 'Пельмени с говядиной',
            ingredients: [
                { name: 'Тесто для пельменей', amount: '200 г' },
                { name: 'Говядина', amount: '250 г' },
                { name: 'Лук', amount: '1 шт' },
                { name: 'Перец', amount: 'по вкусу' },
                { name: 'Соль', amount: 'по вкусу' }
            ],
            description: 'Пельмени с начинкой из говядины, лука и специй, подаются с сметаной или соусом.',
            image: '/img/porridge.png'
        },
        {
            title: 'Пицца Маргарита',
            ingredients: [
                { name: 'Тесто для пиццы', amount: '250 г' },
                { name: 'Томатный соус', amount: '100 мл' },
                { name: 'Моцарелла', amount: '150 г' },
                { name: 'Помидоры', amount: '2 шт' },
                { name: 'Базилик', amount: 'несколько листьев' }
            ],
            description: 'Классическая итальянская пицца с томатным соусом, моцареллой, помидорами и свежим базиликом.',
            image: '/img/salad.png'
        },
        {
            title: 'Омлет с овощами',
            ingredients: [
                { name: 'Яйца', amount: '3 шт' },
                { name: 'Помидоры', amount: '1 шт' },
                { name: 'Перец', amount: '1/2 шт' },
                { name: 'Лук', amount: '1/2 шт' },
                { name: 'Соль', amount: 'по вкусу' },
                { name: 'Перец', amount: 'по вкусу' }
            ],
            description: 'Пышный омлет с помидорами, перцем и луком, приправленный солью и перцем.',
            image: '/img/porridge.png'
        }
    ]);

    const recipes = await Recipe.findAll();
    recipes.forEach(recipe => {
        console.log(`${recipe.title}: ${recipe.description}`);
    });
}

module.exports = seedRecipes;


const Recipe = require("../models/recipe");
const sequelize = require("../db/sequelize");

async function seedRecipes() {
    await sequelize.sync();

    await Recipe.bulkCreate([
        {
            title: 'Салат Греческий',
            ingredients: [
                { name: 'Огурцы', amount: '2', um: 'шт' },
                { name: 'Помидоры', amount: '3', um: 'шт' },
                { name: 'Сыр Фета', amount: '100', um: 'г' },
                { name: 'Маслины', amount: '', um: 'по вкусу' },
                { name: 'Лимонный сок', amount: '1', um: 'ст.л.' },
                { name: 'Оливковое масло', amount: '2', um: 'ст.л.' }
            ],
            description: 'Освежающий салат с огурцами, помидорами, сыром Фета, маслинами, заправленный лимонным соком и оливковым маслом.',
            image: '/img/recipes/salad.png'
        },
        {
            title: 'Паста Карбонара',
            ingredients: [
                { name: 'Спагетти', amount: '200', um: 'г' },
                { name: 'Бекон', amount: '150', um: 'г' },
                { name: 'Яйца', amount: '2', um: 'шт' },
                { name: 'Пармезан', amount: '50', um: 'г' },
                { name: 'Чеснок', amount: '1', um: 'зубчик' }
            ],
            description: 'Итальянская паста с беконом, смешанная с яйцами, сыром Пармезан и чесноком.',
            image: '/img/recipes/porridge.png'
        },
        {
            title: 'Курица Терияки',
            ingredients: [
                { name: 'Куриное филе', amount: '300', um: 'г' },
                { name: 'Соус Терияки', amount: '3', um: 'ст.л.' },
                { name: 'Соевый соус', amount: '2', um: 'ст.л.' },
                { name: 'Мед', amount: '1', um: 'ч.л.' },
                { name: 'Чеснок', amount: '1', um: 'зубчик' },
                { name: 'Имбирь', amount: '', um: 'щепотка' }
            ],
            description: 'Нежное куриное мясо, маринованное в соусе Терияки, подается с рисом и овощами.',
            image: '/img/recipes/salad.png'
        },
        {
            title: 'Суп Минестроне',
            ingredients: [
                { name: 'Бульон', amount: '500', um: 'мл' },
                { name: 'Томаты', amount: '2', um: 'шт' },
                { name: 'Морковь', amount: '1', um: 'шт' },
                { name: 'Лук', amount: '1', um: 'шт' },
                { name: 'Сельдерей', amount: '1', um: 'стебель' },
                { name: 'Макароны', amount: '100', um: 'г' }
            ],
            description: 'Итальянский суп с томатами, морковью, луком, сельдереем и макаронами.',
            image: '/img/recipes/porridge.png'
        },
        {
            title: 'Тайский суп Том Ям',
            ingredients: [
                { name: 'Кокосовое молоко', amount: '200', um: 'мл' },
                { name: 'Лимонграсс', amount: '1', um: 'стебель' },
                { name: 'Листья лайма', amount: '3', um: 'листа' },
                { name: 'Креветки', amount: '100', um: 'г' },
                { name: 'Грибы', amount: '50', um: 'г' }
            ],
            description: 'Острый тайский суп на основе кокосового молока с креветками, лимонграссом, листьями лайма и грибами.',
            image: '/img/recipes/salad.png'
        },
        {
            title: 'Пельмени с говядиной',
            ingredients: [
                { name: 'Тесто для пельменей', amount: '200', um: 'г' },
                { name: 'Говядина', amount: '250', um: 'г' },
                { name: 'Лук', amount: '1', um: 'шт' },
                { name: 'Перец', amount: '', um: 'по вкусу' },
                { name: 'Соль', amount: '', um: 'по вкусу' }
            ],
            description: 'Пельмени с начинкой из говядины, лука и специй, подаются с сметаной или соусом.',
            image: '/img/recipes/porridge.png'
        },
        {
            title: 'Пицца Маргарита',
            ingredients: [
                { name: 'Тесто для пиццы', amount: '250', um: 'г' },
                { name: 'Томатный соус', amount: '100', um: 'мл' },
                { name: 'Моцарелла', amount: '150', um: 'г' },
                { name: 'Помидоры', amount: '2', um: 'шт' },
                { name: 'Базилик', amount: '', um: 'несколько листьев' }
            ],
            description: 'Классическая итальянская пицца с томатным соусом, моцареллой, помидорами и свежим базиликом.',
            image: '/img/recipes/salad.png'
        },
        {
            title: 'Омлет с овощами',
            ingredients: [
                { name: 'Яйца', amount: '3', um: 'шт' },
                { name: 'Помидоры', amount: '1', um: 'шт' },
                { name: 'Перец', amount: '0.5', um: 'шт' },
                { name: 'Лук', amount: '0.5', um: 'шт' },
                { name: 'Соль', amount: '', um: 'по вкусу' },
                { name: 'Перец', amount: '', um: 'по вкусу' }
            ],
            description: 'Пышный омлет с помидорами, перцем и луком, приправленный солью и перцем.',
            image: '/img/recipes/porridge.png'
        }
    ]);

    const recipes = await Recipe.findAll();
    recipes.forEach(recipe => {
        console.log(`${recipe.title}: ${recipe.description}`);
    });
}

module.exports = seedRecipes;

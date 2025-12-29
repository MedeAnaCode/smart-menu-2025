import Recipe from "../models/recipe";
import sequelize from "../db/sequelize";

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
            preparing: 'Освежающий салат с огурцами, помидорами, сыром Фета, маслинами, заправленный лимонным соком и оливковым маслом.',
            image: '/img/recipes/salad.png',
            servings: 2,
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
            preparing: 'Итальянская паста с беконом, смешанная с яйцами, сыром Пармезан и чесноком.',
            image: '/img/recipes/porridge.png',
            servings: 2,
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
            preparing: 'Нежное куриное мясо, маринованное в соусе Терияки, подается с рисом и овощами.',
            image: '/img/recipes/salad.png',
            servings: 2,
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
            preparing: 'Итальянский суп с томатами, морковью, луком, сельдереем и макаронами.',
            image: '/img/recipes/porridge.png',
            servings: 2,
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
            preparing: 'Острый тайский суп на основе кокосового молока с креветками, лимонграссом, листьями лайма и грибами.',
            image: '/img/recipes/salad.png',
            servings: 2,
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
            preparing: 'Пельмени с начинкой из говядины, лука и специй, подаются с сметаной или соусом.',
            image: '/img/recipes/porridge.png',
            servings: 2,
        },
        {
            title: 'Овсяная каша с черникой',
            ingredients: [
                { name: 'Овсяные хлопья долгой варки', amount: '0.75', um: 'ст.' },
                { name: 'Овсяное молоко', amount: '1.5', um: 'ст.' },
                { name: 'Черника', amount: '0.5', um: 'ст.' },
            ],
            preparing: 'Засыпать все ингредиенты в чашу мультиварки и выставить режим "молочная каша" минут на 20. Подавать с бананом.',
            image: '/img/recipes/porridge-1.jpg',
            servings: 3,
        },
        {
            title: 'Тыква с розмарином',
            ingredients: [
                { name: 'Тыква', amount: '1', um: 'шт' },
                { name: 'Розмарин сушёный', amount: '0.5', um: 'ст.л.' },
                { name: 'Оливковое масло', amount: '', um: 'по вкусу' },
                { name: 'Соль', amount: '', um: 'по вкусу' },
            ],
            preparing: 'Тыкву разрезать, вычистить семечки, порезать дольками. Полить оливковым маслом, посыпать розмарином, развномерно распределить по долькам, посолить по вкусу. Дольки выложить на смазанный оливковым маслом противень, кожурой вниз. Выпекать при температуре 200C около часа. Можно срезать корочки при желании, а можно есть прям с них, как апельсинки)',
            image: '/img/recipes/pumpkin.jpg',
            servings: 4,
        }
    ]);

    const recipes = await Recipe.findAll();
    recipes.forEach(recipe => {
        console.log(`${recipe.getDataValue("title")}: ${recipe.getDataValue("preparing")}`);
    });
}

export default seedRecipes;

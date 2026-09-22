import {Recipe, User} from "../models";
import sequelize from "../db/sequelize";
import {replaceRecipeIngredients} from "../services/recipes";

async function seedRecipes() {
    await sequelize.sync();

    const [catalogOwner] = await User.findOrCreate({
        where: {keycloakId: "smartmenu-catalog"},
        defaults: {
            keycloakId: "smartmenu-catalog",
            email: "catalog@smartmenu.local",
            name: "SmartMenu",
        },
    });

    const recipes = await Recipe.bulkCreate([
        {
            title: 'Салат Греческий',
            ingredients: [
                { name: 'Огурец', amount: '2', um: 'шт' },
                { name: 'Помидор', amount: '3', um: 'шт' },
                { name: 'Сыр Фета', amount: '100', um: 'г' },
                { name: 'Маслина', amount: '', um: 'по вкусу' },
                { name: 'Лимонный сок', amount: '1', um: 'ст.л.' },
                { name: 'Оливковое масло', amount: '2', um: 'ст.л.' }
            ],
            preparing: 'Освежающий салат с огурцами, помидорами, сыром Фета, маслинами, заправленный лимонным соком и оливковым маслом.',
            image: '/img/recipes/photo_1_2026-09-03_13-25-04.jpg',
            servings: 2,
        },
        {
            title: 'Паста Карбонара',
            ingredients: [
                { name: 'Спагетти', amount: '200', um: 'г' },
                { name: 'Бекон', amount: '150', um: 'г' },
                { name: 'Яйцо', amount: '2', um: 'шт' },
                { name: 'Пармезан', amount: '50', um: 'г' },
                { name: 'Чеснок', amount: '1', um: 'зубчик' }
            ],
            preparing: 'Итальянская паста с беконом, смешанная с яйцами, сыром Пармезан и чесноком.',
            image: '/img/recipes/photo_2_2026-09-03_13-25-14.jpg',
            servings: 2,
        },
        {
            title: 'Курица Терияки',
            ingredients: [
                { name: 'Куриное филе', amount: '300', um: 'г' },
                { name: 'Соус Терияки', amount: '3', um: 'ст.л.' },
                { name: 'Соевый соус', amount: '2', um: 'ст.л.' },
                { name: 'Мёд', amount: '1', um: 'ч.л.' },
                { name: 'Чеснок', amount: '1', um: 'зубчик' },
                { name: 'Имбирь', amount: '', um: 'щепотка' }
            ],
            preparing: 'Нежное куриное мясо, маринованное в соусе Терияки, подается с рисом и овощами.',
            image: '/img/recipes/photo_3_2026-09-03_13-25-24.jpg',
            servings: 2,
        },
        {
            title: 'Суп Минестроне',
            ingredients: [
                { name: 'Бульон', amount: '500', um: 'мл' },
                { name: 'Томат', amount: '2', um: 'шт' },
                { name: 'Морковь', amount: '1', um: 'шт' },
                { name: 'Лук', amount: '1', um: 'шт' },
                { name: 'Сельдерей', amount: '1', um: 'стебель' },
                { name: 'Макароны', amount: '100', um: 'г' }
            ],
            preparing: 'Итальянский суп с томатами, морковью, луком, сельдереем и макаронами.',
            image: '/img/recipes/photo_4_2026-09-03_13-25-04.jpg',
            servings: 2,
        },
        {
            title: 'Тайский суп Том Ям',
            ingredients: [
                { name: 'Кокосовое молоко', amount: '200', um: 'мл' },
                { name: 'Лимонграсс', amount: '1', um: 'стебель' },
                { name: 'Лист лайма', amount: '3', um: 'листа' },
                { name: 'Креветка', amount: '100', um: 'г' },
                { name: 'Гриб', amount: '50', um: 'г' }
            ],
            preparing: 'Острый тайский суп на основе кокосового молока с креветками, лимонграссом, листьями лайма и грибами.',
            image: '/img/recipes/photo_5_2026-09-03_13-25-14.jpg',
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
            image: '/img/recipes/photo_6_2026-09-03_13-25-04.jpg',
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
            image: '/img/recipes/photo_7_2026-09-03_13-25-14.jpg',
            servings: 3,
        },
        {
            title: 'Тыква с розмарином',
            ingredients: [
                { name: 'Тыква', amount: '1', um: 'шт' },
                { name: 'Сушёный розмарин', amount: '0.5', um: 'ст.л.' },
                { name: 'Оливковое масло', amount: '', um: 'по вкусу' },
                { name: 'Соль', amount: '', um: 'по вкусу' },
            ],
            preparing: 'Тыкву разрезать, вычистить семечки, порезать дольками. Полить оливковым маслом, посыпать розмарином, развномерно распределить по долькам, посолить по вкусу. Дольки выложить на смазанный оливковым маслом противень, кожурой вниз. Выпекать при температуре 200C около часа. Можно срезать корочки при желании, а можно есть прям с них, как апельсинки)',
            image: '/img/recipes/photo_8_2026-09-03_13-25-04.jpg',
            servings: 4,
        }
    ].map((recipe) => ({
        ...recipe,
        ownerId: catalogOwner.id,
        isPublished: true,
        publishedAt: new Date(),
    })), {returning: true});

    await sequelize.transaction(async (transaction) => {
        for (const recipe of recipes) {
            await replaceRecipeIngredients(
                recipe.id,
                recipe.ingredients.map((ingredient) => ({...ingredient, custom: false})),
                transaction,
            );
        }
    });

    recipes.forEach(recipe => {
        console.log(`${recipe.getDataValue("title")}: ${recipe.getDataValue("preparing")}`);
    });
}

export default seedRecipes;

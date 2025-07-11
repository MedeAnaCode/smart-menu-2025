//Надо потом перенести это в модуль sequelize
const {Sequelize, DataTypes}= require("sequelize");


async function createTable() {
    const sequelize = new Sequelize("postgres", "Nastya", "run", {
        dialect: "postgres",
        host: "127.0.0.1",
        port: "5432",
        schema: "public",
    });

    try {
        await sequelize.authenticate();
        console.log('Соединение с БД было успешно установлено');
    } catch (e) {
        console.log('Невозможно выполнить подключение к БД: ', e);
    }

    const Recipe = sequelize.define('Recipe', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        ingredients: {
            type: DataTypes.JSON,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    await (async () => {
        await sequelize.sync({force: true})
    })();

    await Recipe.bulkCreate([
        {
            title: 'Салат Греческий',
            ingredients: ['Огурцы', 'Помидоры', 'Сыр Фета', 'Маслины', 'Лимонный сок', 'Оливковое масло'],
            description: 'Освежающий салат с огурцами, помидорами, сыром Фета, маслинами, заправленный лимонным соком и оливковым маслом.',
            image: 'img/salad.png'
        },
        {
            title: 'Паста Карбонара',
            ingredients: ['Спагетти', 'Бекон', 'Яйца', 'Пармезан', 'Чеснок'],
            description: 'Итальянская паста с беконом, смешанная с яйцами, сыром Пармезан и чесноком.',
            image: 'img/porridge.png'
        },
        {
            title: 'Курица Терияки',
            ingredients: ['Куриное филе', 'Соус Терияки', 'Соевый соус', 'Мед', 'Чеснок', 'Имбирь'],
            description: 'Нежное куриное мясо, маринованное в соусе Терияки, подается с рисом и овощами.',
            image: 'img/salad.png'
        },
        {
            title: 'Суп Минестроне',
            ingredients: ['Бульон', 'Томаты', 'Морковь', 'Лук', 'Сельдерей', 'Макароны'],
            description: 'Итальянский суп с томатами, морковью, луком, сельдереем и макаронами.',
            image: 'img/porridge.png'
        },
        {
            title: 'Тайский суп Том Ям',
            ingredients: ['Кокосовое молоко', 'Лимонграсс', 'Листья лайма', 'Креветки', 'Грибы'],
            description: 'Острый тайский суп на основе кокосового молока с креветками, лимонграссом, листьями лайма и грибами.',
            image: 'img/salad.png'
        },
        {
            title: 'Пельмени с говядиной',
            ingredients: ['Тесто для пельменей', 'Говядина', 'Лук', 'Перец', 'Соль'],
            description: 'Пельмени с начинкой из говядины, лука и специй, подаются с сметаной или соусом.',
            image: 'img/porridge.png'
        },
        {
            title: 'Пицца Маргарита',
            ingredients: ['Тесто для пиццы', 'Томатный соус', 'Моцарелла', 'Помидоры', 'Базилик'],
            description: 'Классическая итальянская пицца с томатным соусом, моцареллой, помидорами и свежим базиликом.',
            image: 'img/salad.png'
        },
        {
            title: 'Омлет с овощами',
            ingredients: ['Яйца', 'Помидоры', 'Перец', 'Лук', 'Соль', 'Перец'],
            description: 'Пышный омлет с помидорами, перцем и луком, приправленный солью и перцем.',
            image: 'img/porridge.png'
        }
    ]);

    const recipes = await Recipe.findAll();
    recipes.forEach(recipe => {
        console.log(`${recipe.title}: ${recipe.description}`);
    });

    await sequelize.close();
}

createTable();


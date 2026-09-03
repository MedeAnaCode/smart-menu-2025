import {Link} from 'react-router-dom';
import {useGetMyRecipesQuery, useGetRecipesQuery} from '../apiRtk';
import {useAuth} from '../auth/AuthContext';
import RecipeImage from './RecipeImage';
export default function MainContainer() {
    const auth = useAuth();
    const {data: catalog = [], isLoading, isError} = useGetRecipesQuery();
    const {data: mine} = useGetMyRecipesQuery(undefined, {skip: !auth.authenticated});
    const collection = auth.authenticated ? [...(mine?.owned ?? []), ...(mine?.saved.map(item => item.recipe) ?? [])] : catalog;
    const cards = collection.slice(0, 3);
    return <div className="home-page">
        <section className="home-intro"><p className="eyebrow">Простые радости каждый день</p><h1>Вкусно жить. Легко планировать.</h1><p>Любимые рецепты и немного заботы о себе.</p></section>
        <section className="home-stories" aria-label="Для вдохновения">
            <Link to="/profile/recipes" className="home-story"><img src="/img/editorial/toasts.jpg" alt="Тосты с малиной и фруктами" fetchPriority="high" /><span className="home-story__tag">Неспешные завтраки</span><div className="home-story__caption"><h2>Хорошее утро<br />начинается с любимого</h2><p>Ягодные тосты и время для себя</p></div></Link>
            <Link to="/profile/recipes" className="home-story"><img src="/img/editorial/banana-cake.jpg" alt="Домашний банановый кекс" /><span className="home-story__tag">Из домашней духовки</span><div className="home-story__caption"><h2>Когда дома пахнет<br />выпечкой</h2><p>Банановый кекс к чашке чая</p></div></Link>
        </section>
        <section className="home-menu-callout"><div><h2>Что приготовим на этой неделе?</h2><p>Собери любимые блюда в меню — всё будет под рукой.</p></div><Link className="button-dark" to="/profile/menu">Собрать меню <span aria-hidden="true">→</span></Link></section>
        <div className="home-collection-layout"><section><div className="home-section-heading"><h2>{auth.authenticated ? 'Мои рецепты' : 'Рецепты'}</h2><Link to="/profile/recipes">Коллекция для вдохновения</Link></div>
            {isLoading && <p role="status">Загружаем рецепты...</p>}{isError && <p className="smartmenu-error" role="alert">Не удалось загрузить рецепты. <Link to="/profile/recipes">Открыть коллекцию</Link></p>}
            <div className="home-recipe-grid">{cards.map(recipe => <Link className="home-recipe" to="/profile/recipes" key={recipe.id}><RecipeImage src={recipe.image} alt={recipe.title} /><p className="eyebrow">{recipe.category}</p><h3>{recipe.title}</h3></Link>)}</div>
            {!isLoading && !isError && cards.length === 0 && <div className="recipe-invitation"><span className="chef-mark"><img src="/img/logo-image-mobile.svg" alt="" /></span><h3>Место для нового любимого блюда</h3><Link to="/profile/recipes">Добавить свой рецепт →</Link></div>}
        </section><aside className="home-menu-note"><p><img src="/img/cart.svg" alt="" /> Моё меню</p><h2>Маленький план.<br />Больше свободного времени.</h2><p>Выбери блюда из коллекции — здесь появится твоё меню.</p><Link to="/profile/menu">Всё начинается с одного рецепта →</Link></aside></div>
        {!auth.authenticated && <section className="home-register"><h2>Сохраняй любимое</h2><p>Рецепты, меню и списки покупок — в твоём аккаунте.</p><button className="button-dark" onClick={() => void auth.register()}>Зарегистрироваться</button></section>}
    </div>;
}

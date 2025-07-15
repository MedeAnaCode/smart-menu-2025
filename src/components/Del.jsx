// App.jsx или компонент RecipeList.jsx

import { useEffect, useState } from "react";

function RecipeList() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3001/recipes")
            .then((res) => res.json())
            .then((data) => {
                setRecipes(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка при получении рецептов:", error);
                setLoading(false);
            });
    }, []); //запускается один раз при отрисовке RecipeList, используем его для запроса рецптов с сервера

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <h1>Рецепты</h1>
            <ul>
                {recipes.map((r) => (
                    <li key={r.title}>
                        <h2>{r.title}</h2>
                        <p>{r.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RecipeList;

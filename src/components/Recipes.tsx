import React, {useState} from "react";
import AddRecipeForm from "./Add-recipe-form";
import EditRecipeForm from "./Edit-recipe-form";
import {Modal} from "./Modal";
import {
    useCloneRecipeMutation,
    useDeleteRecipeMutation,
    useGetMyRecipesQuery,
    useGetRecipesQuery,
    usePublishRecipeMutation,
    useSaveRecipeMutation,
    useUnsaveRecipeMutation,
    useUnpublishRecipeMutation,
    useUpdateRecipeMutation
} from "../apiRtk";
import type {Recipe} from "../types";
import {useAuth} from "../auth/AuthContext";

function AuthPanel() {
    const auth = useAuth();

    return (
        <section className="smartmenu-panel">
            <h2>Профиль</h2>
            {auth.authenticated ? (
                <>
                    <p>{auth.name}</p>
                    <button className="button-dark" type="button" onClick={() => void auth.logout()}>Выйти</button>
                </>
            ) : (
                <div className="smartmenu-form">
                    <button className="button-dark" type="button" onClick={() => void auth.login()}>Войти</button>
                    <button className="button-dark" type="button" onClick={() => void auth.register()}>Зарегистрироваться</button>
                </div>
            )}
        </section>
    );
}

const scaledAmount = (amount: string, selectedServings: number, baseServings: number) => {
    const numeric = Number(amount.replace(",", "."));
    if (!Number.isFinite(numeric)) return amount;
    return String(Number((numeric * selectedServings / Math.max(baseServings, 1)).toFixed(2)));
};

type RecipeTileProps = {
    recipe: Recipe;
    mode: "owned" | "saved" | "catalog";
    alreadySaved?: boolean;
    authenticated: boolean;
    onEdit?: (id: number) => void;
};

function RecipeTile({recipe, mode, alreadySaved, authenticated, onEdit}: RecipeTileProps) {
    const [servings, setServings] = useState(recipe.servings);
    const [actionError, setActionError] = useState("");
    const [deleteRecipe] = useDeleteRecipeMutation();
    const [publishRecipe] = usePublishRecipeMutation();
    const [unpublishRecipe] = useUnpublishRecipeMutation();
    const [saveRecipe] = useSaveRecipeMutation();
    const [unsaveRecipe] = useUnsaveRecipeMutation();
    const [cloneRecipe] = useCloneRecipeMutation();

    const runAction = async (action: () => Promise<unknown>) => {
        setActionError("");
        try {
            await action();
        } catch {
            setActionError("Действие не выполнено. Повторите попытку.");
        }
    };

    return (
        <article className="recipes-container__card recipe-card">
            <div className="recipe-card__content">
                <div className="recipe-card__img-wrapper"><img src={recipe.image} alt={recipe.title} className="recipe-card__img" /></div>
                <h2 className="recipe-card__title">{recipe.title}</h2>
                <p>{recipe.description}</p>
                <p className="recipe-card__meta">
                    <span>{recipe.category}</span>
                    {recipe.author && <span>Автор: {recipe.author.name}</span>}
                </p>
                <label className="recipe-card__servings">
                    Порций
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={servings}
                        onChange={(event) => setServings(Math.max(1, Number(event.target.value) || 1))}
                    />
                </label>
                <ul>{recipe.ingredients.map((item, index) => (
                    <li className={item.custom ? "recipe-card__custom-ingredient" : ""} key={`${item.name}-${index}`}>
                        {item.name} {scaledAmount(item.amount, servings, recipe.servings)} {item.um}
                        {item.custom && <small> Свой ингредиент</small>}
                    </li>
                ))}</ul>
                <p className="recipe-card__preparing">{recipe.preparing}</p>
            </div>
            <div className="recipe-card__button-block">
                {mode === "owned" && (
                    <>
                        <button className="recipe-card__button button-dark" type="button" onClick={() => onEdit?.(recipe.id)}>Ред.</button>
                        <button className="recipe-card__button button-dark" type="button" onClick={() => {
                            if (window.confirm(`Удалить рецепт «${recipe.title}»?`)) {
                                void runAction(() => deleteRecipe(recipe.id).unwrap());
                            }
                        }}>Удалить</button>
                        <button className="recipe-card__button button-dark" type="button" onClick={() => void runAction(() => (
                            recipe.isPublished ? unpublishRecipe(recipe.id).unwrap() : publishRecipe(recipe.id).unwrap()
                        ))}>
                            {recipe.isPublished ? "Снять" : "Опубликовать"}
                        </button>
                    </>
                )}
                {mode === "saved" && (
                    <>
                        <button className="recipe-card__button button-dark" type="button" onClick={() => void runAction(() => unsaveRecipe(recipe.id).unwrap())}>
                            Удалить из моих
                        </button>
                        <button className="recipe-card__button button-dark" type="button" onClick={() => void runAction(() => cloneRecipe(recipe.id).unwrap())}>
                            Создать свою копию
                        </button>
                    </>
                )}
                {mode === "catalog" && authenticated && !alreadySaved && (
                    <button className="recipe-card__button button-dark" type="button" onClick={() => void runAction(() => saveRecipe(recipe.id).unwrap())}>
                        В мои рецепты
                    </button>
                )}
                {mode === "catalog" && alreadySaved && <span className="recipe-card__saved-mark">Сохранён</span>}
                {actionError && <p className="recipe-form__error" role="alert">{actionError}</p>}
            </div>
        </article>
    );
}

function Recipes() {
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const auth = useAuth();
    const {data: catalog = [], isLoading: catalogLoading, isError: catalogError} = useGetRecipesQuery(search);
    const {data: mine, isLoading: mineLoading, isError: mineError} = useGetMyRecipesQuery(undefined, {skip: !auth.authenticated});
    const [updateRecipe] = useUpdateRecipeMutation();
    const owned = mine?.owned ?? [];
    const saved = mine?.saved.map((item) => item.recipe).filter(Boolean) ?? [];
    const ownedIds = new Set(owned.map((recipe) => recipe.id));
    const savedIds = new Set(saved.map((recipe) => recipe.id));
    const editing = owned.find((recipe) => recipe.id === editingId) ?? null;

    const closeModal = () => {
        setEditingId(null);
        setOpen(false);
    };

    return (
        <>
            <h1 className="visually-hidden">Рецепты SmartMenu</h1>
            <AuthPanel />
            {auth.authenticated && <section className="smartmenu-panel smartmenu-panel--column">
                <div className="smartmenu-panel__heading">
                    <h2>Мои рецепты</h2>
                    <button className="button-dark" type="button" onClick={() => setOpen(true)}>Новый рецепт</button>
                </div>
                {mineLoading && <p>Загружаем вашу коллекцию...</p>}
                {mineError && <p className="smartmenu-error">Не удалось загрузить коллекцию.</p>}
                {!mineLoading && owned.length === 0 && saved.length === 0 && <p>Коллекция пока пуста.</p>}
                <div className="recipes-container">
                    {owned.map((recipe) => <RecipeTile key={recipe.id} recipe={recipe} mode="owned" authenticated onEdit={(id) => {
                        setEditingId(id);
                        setOpen(true);
                    }} />)}
                    {saved.map((recipe) => <RecipeTile key={`saved-${recipe.id}`} recipe={recipe} mode="saved" authenticated />)}
                </div>
            </section>}
            <section className="smartmenu-panel">
                <div className="smartmenu-panel__heading">
                    <h2>Общий каталог</h2>
                    <label className="smartmenu-search">
                        <span className="visually-hidden">Поиск по названию</span>
                        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти рецепт" />
                    </label>
                </div>
                {catalogLoading && <p>Загрузка...</p>}
                {catalogError && <p className="smartmenu-error">Каталог временно недоступен.</p>}
                {!catalogLoading && catalog.length === 0 && <p>По вашему запросу ничего не найдено.</p>}
                <div className="recipes-container">
                    {catalog.map((recipe) => (
                        <RecipeTile
                            key={recipe.id}
                            recipe={recipe}
                            mode={ownedIds.has(recipe.id) ? "owned" : "catalog"}
                            alreadySaved={savedIds.has(recipe.id)}
                            authenticated={auth.authenticated}
                            onEdit={(id) => {
                                setEditingId(id);
                                setOpen(true);
                            }}
                        />
                    ))}
                </div>
            </section>
            <Modal open={open} onOpenChange={setOpen} title={editingId ? "Редактирование рецепта" : "Новый рецепт"}>
                {editingId ? (
                    <EditRecipeForm initialValues={editing} onSaved={async (patch) => {
                        if (editingId) await updateRecipe({id: editingId, patch}).unwrap();
                        closeModal();
                    }} onCancel={closeModal} />
                ) : <AddRecipeForm onSuccess={closeModal} />}
            </Modal>
        </>
    );
}

export default Recipes;

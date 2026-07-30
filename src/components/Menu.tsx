import {useEffect, useMemo, useState} from "react";
import {
    useAddRecipeToMenuMutation,
    useCalculateShoppingListMutation,
    useCreateMenuMutation,
    useDeleteMenuMutation,
    useGetMenusQuery,
    useGetMyRecipesQuery,
    useGetRecipesQuery,
    useGetShoppingListQuery,
    useUpdateMenuMutation,
    useUpdateShoppingListMutation
} from "../apiRtk";
import {useAuth} from "../auth/AuthContext";
import type {
    ExtraProduct,
    Meal,
    MenuDay,
    Recipe,
    ShoppingListItem,
    WeeklyMenu
} from "../types";

const firstMeal = (menu?: WeeklyMenu) => menu?.days[0]?.meals[0]?.id ?? "";

const uniqueRecipes = (...groups: Recipe[][]) => {
    const recipes = new Map<number, Recipe>();
    for (const recipe of groups.flat()) recipes.set(recipe.id, recipe);
    return [...recipes.values()];
};

type PersistDays = (updater: (days: MenuDay[]) => MenuDay[]) => Promise<void>;

function MealEditor({meal, persistDays}: {meal: Meal; persistDays: PersistDays}) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("шт");

    const updateMeal = (updater: (current: Meal) => Meal) => persistDays((days) => days.map((day) => ({
        ...day,
        meals: day.meals.map((item) => item.id === meal.id ? updater(item) : item),
    })));

    const addProduct = async () => {
        if (!name.trim()) return;
        const product: ExtraProduct = {
            id: crypto.randomUUID(),
            name: name.trim(),
            amount,
            um: unit,
            includeInShopping: true,
        };
        await updateMeal((current) => ({...current, extraProducts: [...current.extraProducts, product]}));
        setName("");
        setAmount("");
    };

    return (
        <section className="smartmenu-meal">
            <div className="smartmenu-meal__heading">
                <label>
                    <input
                        type="checkbox"
                        checked={meal.includeInShopping}
                        onChange={(event) => void updateMeal((current) => ({...current, includeInShopping: event.target.checked}))}
                    />
                    {meal.title}
                </label>
                <button
                    type="button"
                    onClick={() => void updateMeal((current) => ({...current, recipes: [], extraProducts: []}))}
                    disabled={meal.recipes.length === 0 && meal.extraProducts.length === 0}
                >
                    Очистить
                </button>
            </div>
            <div className="smartmenu-meal__items">
                {meal.recipes.map((item) => (
                    <div className="smartmenu-menu-item" key={item.id}>
                        <label title="Учитывать в списке покупок">
                            <input
                                type="checkbox"
                                checked={item.includeInShopping}
                                onChange={(event) => void updateMeal((current) => ({
                                    ...current,
                                    recipes: current.recipes.map((recipe) => recipe.id === item.id
                                        ? {...recipe, includeInShopping: event.target.checked}
                                        : recipe),
                                }))}
                            />
                            {item.recipeSnapshot.title}
                        </label>
                        <div className="smartmenu-stepper" aria-label={`Порции: ${item.recipeSnapshot.title}`}>
                            <button
                                type="button"
                                aria-label="Уменьшить число порций"
                                disabled={item.servings <= 1}
                                onClick={() => void updateMeal((current) => ({
                                    ...current,
                                    recipes: current.recipes.map((recipe) => recipe.id === item.id
                                        ? {...recipe, servings: Math.max(1, recipe.servings - 1)}
                                        : recipe),
                                }))}
                            >−</button>
                            <span>{item.servings} порц.</span>
                            <button
                                type="button"
                                aria-label="Увеличить число порций"
                                onClick={() => void updateMeal((current) => ({
                                    ...current,
                                    recipes: current.recipes.map((recipe) => recipe.id === item.id
                                        ? {...recipe, servings: Math.min(100, recipe.servings + 1)}
                                        : recipe),
                                }))}
                            >+</button>
                        </div>
                        <button
                            type="button"
                            onClick={() => void updateMeal((current) => ({
                                ...current,
                                recipes: current.recipes.filter((recipe) => recipe.id !== item.id),
                            }))}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
                {meal.extraProducts.map((item) => (
                    <div className="smartmenu-menu-item smartmenu-menu-item--extra" key={item.id}>
                        <label title="Учитывать в списке покупок">
                            <input
                                type="checkbox"
                                checked={item.includeInShopping}
                                onChange={(event) => void updateMeal((current) => ({
                                    ...current,
                                    extraProducts: current.extraProducts.map((product) => product.id === item.id
                                        ? {...product, includeInShopping: event.target.checked}
                                        : product),
                                }))}
                            />
                            {item.name} {item.amount} {item.um}
                        </label>
                        <button
                            type="button"
                            onClick={() => void updateMeal((current) => ({
                                ...current,
                                extraProducts: current.extraProducts.filter((product) => product.id !== item.id),
                            }))}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
                {meal.recipes.length === 0 && meal.extraProducts.length === 0 && <p className="smartmenu-empty">Пока пусто</p>}
            </div>
            <div className="smartmenu-inline-form">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Дополнительный продукт" />
                <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="any" placeholder="Количество" />
                <select value={unit} onChange={(event) => setUnit(event.target.value)}>
                    {["шт", "г", "кг", "мл", "л", "уп."].map((item) => <option key={item}>{item}</option>)}
                </select>
                <button type="button" onClick={() => void addProduct()} disabled={!name.trim()}>Добавить продукт</button>
            </div>
        </section>
    );
}

function DayEditor({day, persistDays}: {day: MenuDay; persistDays: PersistDays}) {
    const [mealTitle, setMealTitle] = useState("");

    const updateDay = (updater: (current: MenuDay) => MenuDay) => persistDays((days) => (
        days.map((item) => item.id === day.id ? updater(item) : item)
    ));

    const addMeal = async () => {
        if (!mealTitle.trim()) return;
        await updateDay((current) => ({
            ...current,
            meals: [...current.meals, {
                id: crypto.randomUUID(),
                title: mealTitle.trim(),
                includeInShopping: true,
                recipes: [],
                extraProducts: [],
            }],
        }));
        setMealTitle("");
    };

    return (
        <article className="smartmenu-day">
            <header className="smartmenu-day__heading">
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={day.includeInShopping}
                            onChange={(event) => void updateDay((current) => ({...current, includeInShopping: event.target.checked}))}
                        />
                        <strong>{day.title}</strong>
                    </label>
                    <time dateTime={day.date}>{new Date(`${day.date}T12:00:00`).toLocaleDateString("ru-RU", {day: "numeric", month: "short"})}</time>
                </div>
                <button
                    type="button"
                    onClick={() => void updateDay((current) => ({
                        ...current,
                        meals: current.meals.map((meal) => ({...meal, recipes: [], extraProducts: []})),
                    }))}
                >
                    Очистить день
                </button>
            </header>
            {day.meals.map((meal) => <MealEditor key={meal.id} meal={meal} persistDays={persistDays} />)}
            <div className="smartmenu-inline-form smartmenu-inline-form--meal">
                <input value={mealTitle} onChange={(event) => setMealTitle(event.target.value)} placeholder="Новый приём пищи" />
                <button type="button" onClick={() => void addMeal()} disabled={!mealTitle.trim()}>Добавить</button>
            </div>
        </article>
    );
}

function ShoppingListEditor({menuId}: {menuId: number}) {
    const {data: shoppingList, isLoading, isError} = useGetShoppingListQuery(menuId);
    const [calculate, {isLoading: calculating}] = useCalculateShoppingListMutation();
    const [updateList, {isLoading: saving}] = useUpdateShoppingListMutation();
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [localDirty, setLocalDirty] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("шт");
    const [error, setError] = useState("");

    useEffect(() => {
        setItems(shoppingList?.items ?? []);
        setLocalDirty(false);
    }, [shoppingList]);

    const changeItems = (updater: (current: ShoppingListItem[]) => ShoppingListItem[]) => {
        setItems(updater);
        setLocalDirty(true);
    };

    const save = async () => {
        setError("");
        try {
            await updateList({menuId, items}).unwrap();
            setLocalDirty(false);
        } catch {
            setError("Не удалось сохранить изменения списка.");
        }
    };

    const recalculate = async () => {
        if ((shoppingList?.manualDirty || localDirty) && !window.confirm("Ручные изменения будут удалены. Пересчитать список?")) {
            return;
        }
        setError("");
        try {
            await calculate(menuId).unwrap();
            setLocalDirty(false);
        } catch {
            setError("Не удалось рассчитать список покупок.");
        }
    };

    const addManual = () => {
        if (!name.trim()) return;
        changeItems((current) => [...current, {
            id: crypto.randomUUID(),
            name: name.trim(),
            amount,
            um: unit,
            source: "Вручную",
            sourceType: "manual",
            checked: false,
            manual: true,
        }]);
        setName("");
        setAmount("");
    };

    return (
        <section className="smartmenu-panel smartmenu-panel--column">
            <div className="smartmenu-panel__heading">
                <h2>Список покупок</h2>
                <div className="smartmenu-actions">
                    <button className="button-dark" type="button" onClick={() => void recalculate()} disabled={calculating}>
                        {calculating ? "Считаем..." : "Рассчитать заново"}
                    </button>
                    <button type="button" onClick={() => void save()} disabled={!localDirty || saving}>
                        {saving ? "Сохраняем..." : "Сохранить изменения"}
                    </button>
                </div>
            </div>
            {shoppingList?.manualDirty && <p className="smartmenu-notice">В списке есть ручные изменения.</p>}
            {isLoading && <p>Загружаем список...</p>}
            {isError && <p className="smartmenu-error">Не удалось загрузить список.</p>}
            <div className="smartmenu-shopping-list">
                {items.map((item) => (
                    <div className="smartmenu-shopping-item" key={item.id}>
                        <input
                            type="checkbox"
                            checked={item.checked}
                            aria-label={`Куплено: ${item.name}`}
                            onChange={(event) => changeItems((current) => current.map((currentItem) => currentItem.id === item.id
                                ? {...currentItem, checked: event.target.checked}
                                : currentItem))}
                        />
                        <input
                            value={item.name}
                            aria-label="Название продукта"
                            onChange={(event) => changeItems((current) => current.map((currentItem) => currentItem.id === item.id
                                ? {...currentItem, name: event.target.value}
                                : currentItem))}
                        />
                        <input
                            value={item.amount}
                            type="number"
                            min="0"
                            step="any"
                            aria-label="Количество"
                            onChange={(event) => changeItems((current) => current.map((currentItem) => currentItem.id === item.id
                                ? {...currentItem, amount: event.target.value}
                                : currentItem))}
                        />
                        <input
                            value={item.um}
                            aria-label="Единица измерения"
                            onChange={(event) => changeItems((current) => current.map((currentItem) => currentItem.id === item.id
                                ? {...currentItem, um: event.target.value}
                                : currentItem))}
                        />
                        <span>{item.source}</span>
                        <button type="button" onClick={() => changeItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}>
                            Удалить
                        </button>
                    </div>
                ))}
                {!isLoading && items.length === 0 && <p>Рассчитайте список по текущему меню.</p>}
            </div>
            <div className="smartmenu-inline-form">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Добавить вручную" />
                <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="any" placeholder="Количество" />
                <input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="Единица" />
                <button type="button" onClick={addManual} disabled={!name.trim()}>Добавить</button>
            </div>
            {error && <p className="smartmenu-error" role="alert">{error}</p>}
        </section>
    );
}

function Menu() {
    const auth = useAuth();
    const {data: menus = [], isLoading: menusLoading, isError: menusError} = useGetMenusQuery(undefined, {skip: !auth.authenticated});
    const {data: recipesData} = useGetMyRecipesQuery(undefined, {skip: !auth.authenticated});
    const {data: catalog = []} = useGetRecipesQuery();
    const [createMenu, {isLoading: creating}] = useCreateMenuMutation();
    const [deleteMenu] = useDeleteMenuMutation();
    const [updateMenu, {isLoading: menuSaving}] = useUpdateMenuMutation();
    const [addRecipeToMenu, {isLoading: addingRecipe}] = useAddRecipeToMenuMutation();
    const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [selectedMealId, setSelectedMealId] = useState("");
    const [selectedServings, setSelectedServings] = useState(1);
    const [newMenuTitle, setNewMenuTitle] = useState("");
    const [error, setError] = useState("");
    const selectedMenu = useMemo(
        () => menus.find((menu) => menu.id === (selectedMenuId ?? menus[0]?.id)),
        [menus, selectedMenuId],
    );
    const recipes = uniqueRecipes(
        recipesData?.owned ?? [],
        recipesData?.saved.map((item) => item.recipe).filter(Boolean) ?? [],
        catalog,
    );

    useEffect(() => {
        if (selectedMenu && !selectedMealId) setSelectedMealId(firstMeal(selectedMenu));
    }, [selectedMealId, selectedMenu]);

    if (!auth.authenticated) {
        return (
            <section className="smartmenu-panel smartmenu-panel--column">
                <h1>Меню недели</h1>
                <p>Войдите, чтобы планировать меню и сохранять списки покупок.</p>
                <button className="button-dark" type="button" onClick={() => void auth.login()}>Войти</button>
            </section>
        );
    }

    const persistDays: PersistDays = async (updater) => {
        if (!selectedMenu) return;
        setError("");
        try {
            await updateMenu({id: selectedMenu.id, patch: {days: updater(structuredClone(selectedMenu.days))}}).unwrap();
        } catch {
            setError("Не удалось сохранить изменение меню.");
        }
    };

    const create = async () => {
        setError("");
        try {
            const menu = await createMenu({title: newMenuTitle.trim() || `Меню ${menus.length + 1}`}).unwrap();
            setSelectedMenuId(menu.id);
            setSelectedMealId(firstMeal(menu));
            setNewMenuTitle("");
        } catch {
            setError("Не удалось создать меню.");
        }
    };

    const addRecipe = async () => {
        if (!selectedMenu || !selectedRecipeId || !selectedMealId) return;
        setError("");
        try {
            await addRecipeToMenu({
                menuId: selectedMenu.id,
                mealId: selectedMealId,
                recipeId: selectedRecipeId,
                servings: selectedServings,
            }).unwrap();
        } catch {
            setError("Не удалось добавить рецепт в меню.");
        }
    };

    return (
        <>
            <h1 className="visually-hidden">Меню недели</h1>
            <section className="smartmenu-panel smartmenu-panel--column">
                <div className="smartmenu-panel__heading">
                    <h2>Недельные меню</h2>
                    {selectedMenu && (
                        <button type="button" onClick={() => {
                            if (window.confirm(`Удалить меню «${selectedMenu.title}»?`)) {
                                void deleteMenu(selectedMenu.id).unwrap().then(() => setSelectedMenuId(null));
                            }
                        }}>Удалить меню</button>
                    )}
                </div>
                <div className="smartmenu-toolbar">
                    <select value={selectedMenu?.id ?? ""} onChange={(event) => {
                        setSelectedMenuId(Number(event.target.value));
                        setSelectedMealId("");
                    }}>
                        {menus.map((menu) => <option key={menu.id} value={menu.id}>{menu.title}</option>)}
                    </select>
                    <input value={newMenuTitle} onChange={(event) => setNewMenuTitle(event.target.value)} placeholder="Название нового меню" />
                    <button className="button-dark" type="button" onClick={() => void create()} disabled={creating}>
                        {creating ? "Создаём..." : "Создать меню"}
                    </button>
                </div>
                {menusLoading && <p>Загружаем меню...</p>}
                {menusError && <p className="smartmenu-error">Не удалось загрузить меню.</p>}
                {!menusLoading && menus.length === 0 && <p>Создайте первое недельное меню.</p>}
            </section>
            {selectedMenu && (
                <>
                    <section className="smartmenu-panel smartmenu-panel--column">
                        <h2>Добавить рецепт</h2>
                        <div className="smartmenu-toolbar">
                            <select value={selectedRecipeId ?? ""} onChange={(event) => {
                                const id = Number(event.target.value);
                                setSelectedRecipeId(id || null);
                                setSelectedServings(recipes.find((recipe) => recipe.id === id)?.servings ?? 1);
                            }}>
                                <option value="">Выберите рецепт</option>
                                {recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.title}</option>)}
                            </select>
                            <select value={selectedMealId} onChange={(event) => setSelectedMealId(event.target.value)}>
                                {selectedMenu.days.flatMap((day) => day.meals.map((meal) => (
                                    <option key={meal.id} value={meal.id}>{day.title}: {meal.title}</option>
                                )))}
                            </select>
                            <label>
                                Порций
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={selectedServings}
                                    onChange={(event) => setSelectedServings(Math.max(1, Number(event.target.value) || 1))}
                                />
                            </label>
                            <button className="button-dark" type="button" onClick={() => void addRecipe()} disabled={!selectedRecipeId || addingRecipe}>
                                {addingRecipe ? "Добавляем..." : "Добавить рецепт"}
                            </button>
                        </div>
                    </section>
                    <section className="smartmenu-board" aria-busy={menuSaving}>
                        {selectedMenu.days.map((day) => <DayEditor key={day.id} day={day} persistDays={persistDays} />)}
                    </section>
                    <ShoppingListEditor menuId={selectedMenu.id} />
                </>
            )}
            {error && <p className="smartmenu-error" role="alert">{error}</p>}
        </>
    );
}

export default Menu;

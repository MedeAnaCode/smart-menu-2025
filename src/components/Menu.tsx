import {useEffect, useMemo, useRef, useState} from "react";
import {
    useAddRecipeToMenuMutation,
    useCalculateShoppingListMutation,
    useCreateMenuMutation,
    useDeleteMenuMutation,
    useGetIngredientsQuery,
    useGetMenusQuery,
    useGetMyRecipesQuery,
    useGetRecipesQuery,
    useGetShoppingListQuery,
    useUpdateMenuMutation,
    useUpdateShoppingListMutation
} from "../apiRtk";
import {useAuth} from "../auth/AuthContext";
import type {
    CommonIngredient,
    ExtraProduct,
    Meal,
    MenuDay,
    MenuRecipe,
    Recipe,
    ShoppingListItem,
    WeeklyMenu
} from "../types";
import {Modal} from "./Modal";
import RecipeImage from "./RecipeImage";

const mealTitles = ["Завтрак", "Обед", "Ужин", "Перекус"] as const;

const uniqueRecipes = (...groups: Recipe[][]) => {
    const recipes = new Map<number, Recipe>();
    for (const recipe of groups.flat()) recipes.set(recipe.id, recipe);
    return [...recipes.values()];
};

type PersistDays = (updater: (days: MenuDay[]) => MenuDay[]) => Promise<void>;

type AddRecipeToMeal = (mealId: string, recipeId: number, servings: number) => Promise<void>;

const scaledAmount = (amount: string, selectedServings: number, baseServings: number) => {
    const numeric = Number(amount.replace(",", "."));
    if (!Number.isFinite(numeric)) return amount;
    return String(Math.round((numeric * selectedServings / baseServings) * 100) / 100);
};

function MenuRecipeDetails({item, open, onOpenChange}: {
    item: MenuRecipe | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!item) return null;
    const recipe = item.recipeSnapshot;
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={recipe.title}>
            <article className="smartmenu-recipe-details">
                <RecipeImage className="smartmenu-recipe-details__image" src={recipe.image} alt={recipe.title} />
                <p>{recipe.description}</p>
                <p className="recipe-card__meta">
                    <span>{recipe.category}</span>
                    <span>{item.servings} порц.</span>
                </p>
                <h3>Ингредиенты</h3>
                <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                        <li key={`${ingredient.name}-${index}`}>
                            {ingredient.name} {scaledAmount(ingredient.amount, item.servings, recipe.servings)} {ingredient.um}
                            {ingredient.custom && <small> Свой ингредиент</small>}
                        </li>
                    ))}
                </ul>
                <h3>Приготовление</h3>
                <p>{recipe.preparing}</p>
            </article>
        </Modal>
    );
}

function MealEditor({meal, recipes, commonIngredients, persistDays, addRecipe, addingRecipe, removeMeal}: {
    meal: Meal;
    recipes: Recipe[];
    commonIngredients: CommonIngredient[];
    persistDays: PersistDays;
    addRecipe: AddRecipeToMeal;
    addingRecipe: boolean;
    removeMeal: () => Promise<void>;
}) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("шт");
    const [customProduct, setCustomProduct] = useState(false);
    const [commonProductId, setCommonProductId] = useState<number | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [selectedServings, setSelectedServings] = useState(1);
    const [openedRecipeId, setOpenedRecipeId] = useState<string | null>(null);
    const [addError, setAddError] = useState("");

    const updateMeal = (updater: (current: Meal) => Meal) => persistDays((days) => days.map((day) => ({
        ...day,
        meals: day.meals.map((item) => item.id === meal.id ? updater(item) : item),
    })));

    const addProduct = async () => {
        const commonIngredient = commonIngredients.find((ingredient) => ingredient.id === commonProductId);
        const productName = customProduct ? name.trim() : commonIngredient?.name ?? "";
        if (!productName) return;
        const product: ExtraProduct = {
            id: crypto.randomUUID(),
            name: productName,
            amount,
            um: unit,
            includeInShopping: true,
            commonIngredientId: customProduct ? null : commonIngredient!.id,
            custom: customProduct,
        };
        await updateMeal((current) => ({...current, extraProducts: [...current.extraProducts, product]}));
        setName("");
        setAmount("");
        setCommonProductId(null);
    };

    const addSelectedRecipe = async () => {
        if (!selectedRecipeId) return;
        setAddError("");
        try {
            await addRecipe(meal.id, selectedRecipeId, selectedServings);
            setSelectedRecipeId(null);
            setSelectedServings(1);
        } catch {
            setAddError("Не удалось добавить блюдо.");
        }
    };

    const openedRecipe = meal.recipes.find((item) => item.id === openedRecipeId);

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
                <button type="button" onClick={() => void removeMeal()}>Удалить приём пищи</button>
            </div>
            <div className="smartmenu-meal__items">
                {meal.recipes.map((item) => (
                    <div className="smartmenu-menu-item" key={item.id}>
                        <input
                            type="checkbox"
                            checked={item.includeInShopping}
                            aria-label={`Учитывать в покупках: ${item.recipeSnapshot.title}`}
                            onChange={(event) => void updateMeal((current) => ({
                                ...current,
                                recipes: current.recipes.map((recipe) => recipe.id === item.id
                                    ? {...recipe, includeInShopping: event.target.checked}
                                    : recipe),
                            }))}
                        />
                        <div className="smartmenu-dish">
                            <button
                                className="smartmenu-dish__title"
                                type="button"
                                onClick={() => setOpenedRecipeId(item.id)}
                            >
                                {item.recipeSnapshot.title}
                            </button>
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
            <div className="smartmenu-add-dish">
                <select
                    aria-label={`Рецепт для ${meal.title}`}
                    value={selectedRecipeId ?? ""}
                    onChange={(event) => {
                        const recipeId = Number(event.target.value);
                        setSelectedRecipeId(recipeId || null);
                        setSelectedServings(recipes.find((recipe) => recipe.id === recipeId)?.servings ?? 1);
                    }}
                >
                    <option value="">Выберите рецепт</option>
                    {recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.title}</option>)}
                </select>
                <label>
                    Порций
                    <input
                        aria-label={`Порций для ${meal.title}`}
                        type="number"
                        min="1"
                        max="100"
                        value={selectedServings}
                        onChange={(event) => setSelectedServings(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
                    />
                </label>
                <button type="button" onClick={() => void addSelectedRecipe()} disabled={!selectedRecipeId || addingRecipe}>
                    {addingRecipe ? "Добавляем..." : "Добавить блюдо"}
                </button>
            </div>
            {addError && <p className="smartmenu-error" role="alert">{addError}</p>}
            <fieldset className="smartmenu-extra-product">
                <legend>Дополнительный продукт</legend>
                <label className="recipe-form__custom-toggle">
                    <input
                        type="checkbox"
                        checked={customProduct}
                        onChange={(event) => {
                            setCustomProduct(event.target.checked);
                            setCommonProductId(null);
                            setName("");
                        }}
                    />
                    Свой продукт
                </label>
                {customProduct ? (
                    <input
                        value={name}
                        aria-label={`Название своего продукта для ${meal.title}`}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Название продукта"
                    />
                ) : (
                    <select
                        value={commonProductId ?? ""}
                        aria-label={`Дополнительный продукт для ${meal.title}`}
                        onChange={(event) => setCommonProductId(Number(event.target.value) || null)}
                    >
                        <option value="">Выберите из базы ингредиентов</option>
                        {commonIngredients.map((ingredient) => (
                            <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                        ))}
                    </select>
                )}
                <input
                    value={amount}
                    aria-label={`Количество дополнительного продукта для ${meal.title}`}
                    onChange={(event) => setAmount(event.target.value)}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Количество"
                />
                <select value={unit} aria-label={`Единица дополнительного продукта для ${meal.title}`} onChange={(event) => setUnit(event.target.value)}>
                    {["шт", "г", "кг", "мл", "л", "уп."].map((item) => <option key={item}>{item}</option>)}
                </select>
                <button
                    type="button"
                    onClick={() => void addProduct()}
                    disabled={customProduct ? !name.trim() : !commonProductId}
                >
                    Добавить продукт
                </button>
            </fieldset>
            <MenuRecipeDetails
                item={openedRecipe}
                open={Boolean(openedRecipe)}
                onOpenChange={(open) => {
                    if (!open) setOpenedRecipeId(null);
                }}
            />
        </section>
    );
}

function DayEditor({day, recipes, commonIngredients, persistDays, addRecipe, addingRecipe}: {
    day: MenuDay;
    recipes: Recipe[];
    commonIngredients: CommonIngredient[];
    persistDays: PersistDays;
    addRecipe: AddRecipeToMeal;
    addingRecipe: boolean;
}) {
    const [mealTitle, setMealTitle] = useState<string>(mealTitles[0]);
    const [comment, setComment] = useState(day.comment ?? "");

    const updateDay = (updater: (current: MenuDay) => MenuDay) => persistDays((days) => (
        days.map((item) => item.id === day.id ? updater(item) : item)
    ));

    useEffect(() => {
        setComment(day.comment ?? "");
    }, [day.comment, day.id]);

    const availableMealTitles = mealTitles.filter((title) => !day.meals.some((meal) => meal.title === title));
    const selectedMealTitle = availableMealTitles.includes(mealTitle as typeof mealTitles[number])
        ? mealTitle
        : availableMealTitles[0] ?? "";

    const addMeal = async () => {
        if (!selectedMealTitle) return;
        await updateDay((current) => ({
            ...current,
            meals: [...current.meals, {
                id: crypto.randomUUID(),
                title: selectedMealTitle,
                includeInShopping: true,
                recipes: [],
                extraProducts: [],
            }],
        }));
        setMealTitle("");
    };

    const saveComment = async () => {
        if (comment.trim() === (day.comment ?? "")) return;
        await updateDay((current) => ({...current, comment: comment.trim()}));
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
            <div className="smartmenu-day__meals">
                {day.meals.map((meal) => (
                    <MealEditor
                        key={meal.id}
                        meal={meal}
                        recipes={recipes}
                        commonIngredients={commonIngredients}
                        persistDays={persistDays}
                        addRecipe={addRecipe}
                        addingRecipe={addingRecipe}
                        removeMeal={() => updateDay((current) => ({
                            ...current,
                            meals: current.meals.filter((item) => item.id !== meal.id),
                        }))}
                    />
                ))}
                {day.meals.length === 0 && <p className="smartmenu-empty">Добавьте приём пищи.</p>}
            </div>
            <div className="smartmenu-add-meal">
                <select value={selectedMealTitle} onChange={(event) => setMealTitle(event.target.value)} aria-label={`Приём пищи для ${day.title}`}>
                    {availableMealTitles.map((title) => <option key={title}>{title}</option>)}
                </select>
                <button type="button" onClick={() => void addMeal()} disabled={!selectedMealTitle}>Добавить приём пищи</button>
            </div>
            <footer className="smartmenu-day__comment">
                <label>
                    Комментарий к дню
                    <textarea
                        value={comment}
                        rows={2}
                        maxLength={2000}
                        placeholder="Например, подготовить продукты заранее"
                        onChange={(event) => setComment(event.target.value)}
                    />
                </label>
                <button type="button" onClick={() => void saveComment()} disabled={comment.trim() === (day.comment ?? "")}>
                    Сохранить комментарий
                </button>
            </footer>
        </article>
    );
}

function MenuDescriptionEditor({menu, saving, onSave}: {
    menu: WeeklyMenu;
    saving: boolean;
    onSave: (description: string) => Promise<void>;
}) {
    const [description, setDescription] = useState(menu.description ?? "");
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        setDescription(menu.description ?? "");
    }, [menu.description, menu.id]);

    const unchanged = description.trim() === (menu.description ?? "");

    const save = async () => {
        setSaveError("");
        try {
            await onSave(description.trim());
        } catch {
            setSaveError("Не удалось сохранить описание.");
        }
    };

    return (
        <section className="smartmenu-panel smartmenu-panel--column smartmenu-menu-description">
            <label className="recipe-form__field">
                Описание меню
                <textarea
                    value={description}
                    rows={3}
                    maxLength={4000}
                    placeholder="Цель меню, особенности недели или общие заметки"
                    onChange={(event) => setDescription(event.target.value)}
                />
            </label>
            <button type="button" onClick={() => void save()} disabled={unchanged || saving}>
                {saving ? "Сохраняем..." : "Сохранить описание"}
            </button>
            {saveError && <p className="smartmenu-error" role="alert">{saveError}</p>}
        </section>
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
    const {data: commonIngredients = []} = useGetIngredientsQuery(undefined, {skip: !auth.authenticated});
    const {data: recipesData} = useGetMyRecipesQuery(undefined, {skip: !auth.authenticated});
    const {data: catalog = []} = useGetRecipesQuery();
    const [createMenu, {isLoading: creating}] = useCreateMenuMutation();
    const [deleteMenu] = useDeleteMenuMutation();
    const [updateMenu, {isLoading: menuSaving}] = useUpdateMenuMutation();
    const [addRecipeToMenu, {isLoading: addingRecipe}] = useAddRecipeToMenuMutation();
    const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);
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
    const daysRef = useRef<MenuDay[]>([]);
    const persistQueueRef = useRef<Promise<void>>(Promise.resolve());

    useEffect(() => {
        daysRef.current = selectedMenu ? structuredClone(selectedMenu.days) : [];
    }, [selectedMenu]);

    if (!auth.authenticated) {
        return (
            <section className="smartmenu-panel smartmenu-panel--column">
                <h1>Меню недели</h1>
                <p>Войдите через кнопку в шапке, чтобы планировать меню и сохранять списки покупок.</p>
            </section>
        );
    }

    const persistDays: PersistDays = async (updater) => {
        if (!selectedMenu) return;
        setError("");
        const currentDays = daysRef.current.length > 0 ? daysRef.current : selectedMenu.days;
        const nextDays = updater(structuredClone(currentDays));
        daysRef.current = structuredClone(nextDays);
        const operation = persistQueueRef.current.then(async () => {
            const updatedMenu = await updateMenu({id: selectedMenu.id, patch: {days: nextDays}}).unwrap();
            daysRef.current = structuredClone(updatedMenu.days);
        });
        persistQueueRef.current = operation.catch(() => undefined);
        try {
            await operation;
        } catch {
            setError("Не удалось сохранить изменение меню.");
        }
    };

    const create = async () => {
        if (!newMenuTitle.trim()) return;
        setError("");
        try {
            const menu = await createMenu({title: newMenuTitle.trim()}).unwrap();
            setSelectedMenuId(menu.id);
            setNewMenuTitle("");
            setCreateMenuOpen(false);
        } catch {
            setError("Не удалось создать меню.");
        }
    };

    const addRecipe: AddRecipeToMeal = async (mealId, recipeId, servings) => {
        if (!selectedMenu) return;
        setError("");
        try {
            await addRecipeToMenu({
                menuId: selectedMenu.id,
                mealId,
                recipeId,
                servings,
            }).unwrap();
        } catch (caughtError) {
            setError("Не удалось добавить рецепт в меню.");
            throw caughtError;
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
                    {menus.length > 0 && (
                        <select value={selectedMenu?.id ?? ""} onChange={(event) => {
                            setSelectedMenuId(Number(event.target.value));
                        }} aria-label="Выбранное меню">
                            {menus.map((menu) => <option key={menu.id} value={menu.id}>{menu.title}</option>)}
                        </select>
                    )}
                    <button className="button-dark" type="button" onClick={() => setCreateMenuOpen(true)}>
                        Создать меню
                    </button>
                </div>
                {menusLoading && <p>Загружаем меню...</p>}
                {menusError && <p className="smartmenu-error">Не удалось загрузить меню.</p>}
                {!menusLoading && menus.length === 0 && <p>Создайте первое недельное меню.</p>}
            </section>
            {selectedMenu && (
                <>
                    <MenuDescriptionEditor
                        menu={selectedMenu}
                        saving={menuSaving}
                        onSave={async (description) => {
                            await updateMenu({id: selectedMenu.id, patch: {description}}).unwrap();
                        }}
                    />
                    <section className="smartmenu-board" aria-busy={menuSaving}>
                        {selectedMenu.days.map((day) => (
                            <DayEditor
                                key={day.id}
                                day={day}
                                recipes={recipes}
                                commonIngredients={commonIngredients}
                                persistDays={persistDays}
                                addRecipe={addRecipe}
                                addingRecipe={addingRecipe}
                            />
                        ))}
                    </section>
                    <ShoppingListEditor menuId={selectedMenu.id} />
                </>
            )}
            {error && <p className="smartmenu-error" role="alert">{error}</p>}
            <Modal open={createMenuOpen} onOpenChange={setCreateMenuOpen} title="Новое меню">
                <form className="smartmenu-create-menu" onSubmit={(event) => {
                    event.preventDefault();
                    void create();
                }}>
                    <label className="recipe-form__field">
                        Название меню
                        <input
                            value={newMenuTitle}
                            maxLength={255}
                            autoFocus
                            onChange={(event) => setNewMenuTitle(event.target.value)}
                        />
                    </label>
                    <button className="button-dark" type="submit" disabled={!newMenuTitle.trim() || creating}>
                        {creating ? "Создаём..." : "Подтвердить создание"}
                    </button>
                </form>
            </Modal>
        </>
    );
}

export default Menu;

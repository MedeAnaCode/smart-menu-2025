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
import Sidebar from "./Sidebar";
import ActionMenu from "./ActionMenu";

const mealTitles = ["Завтрак", "Обед", "Перекус", "Ужин"] as const;

const uniqueRecipes = (...groups: Recipe[][]) => {
    const recipes = new Map<number, Recipe>();
    for (const recipe of groups.flat()) recipes.set(recipe.id, recipe);
    return [...recipes.values()];
};

type PersistDays = (updater: (days: MenuDay[]) => MenuDay[]) => Promise<void>;

type AddRecipeToMeal = (mealId: string, recipeId: number, servings: number) => Promise<void>;

type ShoppingSelection = {
    excludedIds: ReadonlySet<string>;
    toggle: (id: string) => void;
} | null;

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

function RecipeDetails({recipe, open, onOpenChange}: {
    recipe: Recipe | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!recipe) return null;
    return (
        <Modal open={open} onOpenChange={onOpenChange} title={recipe.title}>
            <article className="smartmenu-recipe-details">
                <RecipeImage className="smartmenu-recipe-details__image" src={recipe.image} alt={recipe.title} />
                <p>{recipe.description}</p>
                <p className="recipe-card__meta">
                    <span>{recipe.category}</span>
                    <span>{recipe.servings} порц.</span>
                </p>
                <h3>Ингредиенты</h3>
                <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                        <li key={`${ingredient.name}-${index}`}>
                            {ingredient.name} {ingredient.amount} {ingredient.um}
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

function MealEditor({meal, commonIngredients, persistDays, onChooseRecipe, removeMeal, shoppingSelection}: {
    meal: Meal;
    commonIngredients: CommonIngredient[];
    persistDays: PersistDays;
    onChooseRecipe: (mealId: string) => void;
    removeMeal: () => Promise<void>;
    shoppingSelection: ShoppingSelection;
}) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("шт");
    const [customProduct, setCustomProduct] = useState(false);
    const [commonProductId, setCommonProductId] = useState<number | null>(null);
    const [openedRecipeId, setOpenedRecipeId] = useState<string | null>(null);
    const [productFormOpen, setProductFormOpen] = useState(false);

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
        setProductFormOpen(false);
    };

    const openedRecipe = meal.recipes.find((item) => item.id === openedRecipeId);

    return (
        <section className="smartmenu-meal">
            <div className="smartmenu-meal__heading">
                <h3>{meal.title}</h3>
                {meal.recipes.length > 0 && <button className="ui-link" onClick={() => onChooseRecipe(meal.id)}>+ Добавить</button>}
                <ActionMenu label={`Действия: ${meal.title}`} actions={[
                    {label:'Очистить приём пищи',disabled:!meal.recipes.length&&!meal.extraProducts.length,onSelect:()=>void updateMeal(current=>({...current,recipes:[],extraProducts:[]}))},
                    {label:'Удалить приём пищи',danger:true,onSelect:()=>void removeMeal()},
                ]}/>
            </div>
            <div className="smartmenu-meal__items">
                {meal.recipes.map((item) => (
                    <div className={`smartmenu-menu-item${shoppingSelection ? " is-selecting" : ""}`} key={item.id}>
                        {shoppingSelection && <input
                            type="checkbox"
                            checked={!shoppingSelection.excludedIds.has(item.id)}
                            aria-label={`Учитывать в покупках: ${item.recipeSnapshot.title}`}
                            onChange={() => shoppingSelection.toggle(item.id)}
                        />}
                        <div className="smartmenu-dish">
                            <button
                                className="smartmenu-dish__title"
                                type="button"
                                onClick={() => setOpenedRecipeId(item.id)}
                            >
                                {item.recipeSnapshot.title}
                            </button>
                            <div className="smartmenu-portions" role="group" aria-label={`Изменить порции: ${item.recipeSnapshot.title}`}><span>Порции</span>
                                <button type="button" aria-label="Уменьшить порции" disabled={item.servings <= 1} onClick={() => void updateMeal(current => ({...current, recipes: current.recipes.map(recipe => recipe.id === item.id ? {...recipe, servings: Math.max(1, recipe.servings - 1)} : recipe)}))}>−</button>
                                <input type="number" min="1" max="100" aria-label={`Порции: ${item.recipeSnapshot.title}`} value={item.servings} onChange={event=>void updateMeal(current=>({...current,recipes:current.recipes.map(recipe=>recipe.id===item.id?{...recipe,servings:Math.min(100,Math.max(1,Number(event.target.value)||1))}:recipe)}))}/>
                                <button type="button" aria-label="Увеличить порции" disabled={item.servings >= 100} onClick={() => void updateMeal(current => ({...current, recipes: current.recipes.map(recipe => recipe.id === item.id ? {...recipe, servings: Math.min(100, recipe.servings + 1)} : recipe)}))}>+</button>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => void updateMeal((current) => ({
                                ...current,
                                recipes: current.recipes.filter((recipe) => recipe.id !== item.id),
                            }))}
                            aria-label={`Удалить блюдо: ${item.recipeSnapshot.title}`}
                            className="smartmenu-remove-dish"
                        >×</button>
                    </div>
                ))}
                {meal.extraProducts.map((item) => (
                    <div className="smartmenu-menu-item smartmenu-menu-item--extra" key={item.id}>
                        <label title="Учитывать в списке покупок">
                            {shoppingSelection && <input
                                type="checkbox"
                                checked={!shoppingSelection.excludedIds.has(item.id)}
                                aria-label={`Учитывать в покупках: ${item.name}`}
                                onChange={() => shoppingSelection.toggle(item.id)}
                            />}
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
            </div>
            {meal.recipes.length===0&&<button type="button" className="smartmenu-choose-dish" onClick={()=>onChooseRecipe(meal.id)}><span>Выбрать блюдо</span><span aria-hidden="true">+</span></button>}
            <div className="smartmenu-extra-disclosure"><button type="button" className="ui-link" onClick={() => setProductFormOpen(true)}>+ продукт</button>
            {productFormOpen && <fieldset className="smartmenu-extra-product">
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
                <button type="button" onClick={() => setProductFormOpen(false)}>Отмена</button>
            </fieldset>}</div>
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

function DayEditor({day, commonIngredients, persistDays, onChooseRecipe, shoppingSelection, showHeading=true}: {
    day: MenuDay;
    commonIngredients: CommonIngredient[];
    persistDays: PersistDays;
    onChooseRecipe: (mealId: string) => void;
    showHeading?: boolean;
    shoppingSelection: ShoppingSelection;
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
            {!showHeading&&<h2 className="visually-hidden">{day.title}</h2>}
            {showHeading&&<header className="smartmenu-day__heading">
                <div><h2>{day.title}</h2></div>
                <ActionMenu label={`Действия дня: ${day.title}`} actions={[{label:"Очистить день",danger:true,onSelect:()=>void updateDay(current=>({...current,meals:current.meals.map(meal=>({...meal,recipes:[],extraProducts:[]}))}))}]}/>
            </header>}
            <div className="smartmenu-day__meals">
                {day.meals.map((meal) => (
                    <MealEditor
                        key={meal.id}
                        meal={meal}
                        commonIngredients={commonIngredients}
                        persistDays={persistDays}
                        onChooseRecipe={onChooseRecipe}
                        shoppingSelection={shoppingSelection}
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
            <footer className="smartmenu-day__comment"><h3>На заметку</h3>
                <label>
                    <span className="visually-hidden">Комментарий к дню</span>
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

function useShoppingListEditor(menuId: number | null, onRequestCalculate: () => void, selecting: boolean, menuBusy: boolean) {
    const {data: shoppingList, isLoading, isError} = useGetShoppingListQuery(menuId ?? 0, {skip:menuId===null});
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
        if (menuId===null) return;
        setError("");
        try {
            await updateList({menuId, items}).unwrap();
            setLocalDirty(false);
        } catch {
            setError("Не удалось сохранить изменения списка.");
        }
    };

    const recalculate = async (beforeCalculate?: () => Promise<void>) => {
        if (menuId===null) return false;
        if ((shoppingList?.manualDirty || localDirty) && !window.confirm("Ручные изменения будут удалены. Пересчитать список?")) {
            return false;
        }
        setError("");
        try {
            await beforeCalculate?.();
            await calculate(menuId).unwrap();
            setLocalDirty(false);
            return true;
        } catch {
            setError("Не удалось рассчитать список покупок.");
            return false;
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

    const content = (
        <section className="smartmenu-panel smartmenu-panel--column">
            <div className="smartmenu-panel__heading">
                <h2>Список покупок</h2>
                <div className="smartmenu-actions">
                    <button className="button-dark" type="button" onClick={onRequestCalculate} disabled={calculating || menuBusy}>
                        {calculating ? "Считаем..." : selecting ? "Рассчитать" : "Список покупок"}
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
            <form className="smartmenu-inline-form" onSubmit={(event) => {event.preventDefault(); addManual();}}>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Добавить вручную" />
                <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="any" placeholder="Количество" />
                <input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="Единица" />
                <button type="submit" disabled={!name.trim()}>Добавить</button>
            </form>
            {error && <p className="smartmenu-error" role="alert">{error}</p>}
        </section>
    );
    return {content, recalculate, calculating, itemCount:items.length};
}

const menuDayTitle = (date: Date) => date.toLocaleDateString("ru-RU", {weekday: "long"}).replace(/^./, (letter) => letter.toUpperCase());

function DesktopMealBoard({day, meal, commonIngredients, persistDays, onOpenRecipe, onSetTarget, shoppingSelection}: {
    day: MenuDay;
    meal: Meal;
    commonIngredients: CommonIngredient[];
    persistDays: PersistDays;
    onOpenRecipe: (item: MenuRecipe) => void;
    onSetTarget: (mealId: string) => void;
    shoppingSelection: ShoppingSelection;
}) {
    const [dragOver, setDragOver] = useState(false);
    const [extraProductId, setExtraProductId] = useState<number | null>(null);
    const [extraName, setExtraName] = useState("");
    const [extraAmount, setExtraAmount] = useState("");
    const [extraUnit, setExtraUnit] = useState("шт");
    const [productFormOpen, setProductFormOpen] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(meal.title);
    const titleInput = useRef<HTMLInputElement>(null);
    const updateMeal = (updater: (current: Meal) => Meal) => persistDays((days) => days.map((currentDay) => currentDay.id === day.id ? {
        ...currentDay,
        meals: currentDay.meals.map((currentMeal) => currentMeal.id === meal.id ? updater(currentMeal) : currentMeal),
    } : currentDay));
    const adjustServings = (itemId: string, amount: number) => void updateMeal((current) => ({
        ...current,
        recipes: current.recipes.map((item) => item.id === itemId ? {...item, servings: Math.max(1, Math.min(100, item.servings + amount))} : item),
    }));
    const addExtraProduct = () => {
        const common = commonIngredients.find((item) => item.id === extraProductId);
        const name = extraName.trim() || common?.name;
        if (!name) return;
        void updateMeal((current) => ({...current, extraProducts: [...current.extraProducts, {
            id: crypto.randomUUID(), name, amount: extraAmount, um: extraUnit, includeInShopping: true,
            commonIngredientId: common?.id ?? null, custom: !common,
        }]}));
        setExtraProductId(null); setExtraName(""); setExtraAmount("");
        setProductFormOpen(false);
    };
    useEffect(() => {
        setTitleDraft(meal.title);
        setEditingTitle(false);
    }, [meal.id, meal.title]);
    useEffect(() => {
        if (editingTitle) titleInput.current?.focus();
    }, [editingTitle]);
    const saveTitle = () => {
        const title = titleDraft.trim() || "Приём пищи";
        setTitleDraft(title);
        setEditingTitle(false);
        if (title !== meal.title) void updateMeal((current) => ({...current, title}));
    };

    return <section className={`desktop-meal smartmenu-meal${dragOver ? " is-drag-over" : ""}`} onFocusCapture={() => onSetTarget(meal.id)} onClickCapture={() => onSetTarget(meal.id)} onDragEnter={(event) => {event.preventDefault(); setDragOver(true);}} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => {if (event.currentTarget === event.target) setDragOver(false);}} onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        if (event.currentTarget.closest("fieldset:disabled")) return;
        const recipeId = Number(event.dataTransfer.getData("application/x-smartmenu-recipe"));
        if (recipeId) {
            onSetTarget(meal.id);
            document.dispatchEvent(new CustomEvent("smartmenu:drop-recipe", {detail: {mealId: meal.id, recipeId}}));
        }
    }}>
        <header className="desktop-meal__header">{editingTitle ? <input ref={titleInput} aria-label="Название приёма пищи" value={titleDraft} maxLength={100} onChange={(event) => setTitleDraft(event.target.value)} onBlur={saveTitle} onKeyDown={(event) => {if (event.key === "Enter") {event.preventDefault(); saveTitle();} if (event.key === "Escape") {setTitleDraft(meal.title); setEditingTitle(false);}}}/> : <button type="button" className="desktop-meal__title" title="Изменить тип приёма пищи" onClick={() => setEditingTitle(true)}>{meal.title}</button>}<div><ActionMenu label={`Действия: ${meal.title}`} actions={[{label: "Очистить", disabled: !meal.recipes.length && !meal.extraProducts.length, onSelect: () => void updateMeal((current) => ({...current, recipes: [], extraProducts: []}))}, {label: "Удалить приём пищи", danger: true, onSelect: () => void persistDays((days) => days.map((currentDay) => currentDay.id === day.id ? {...currentDay, meals: currentDay.meals.filter((item) => item.id !== meal.id)} : currentDay))}]}/></div></header>
        <div className="desktop-meal__cards">
            {meal.recipes.map((item) => <article className="desktop-dish" key={item.id}>
                <button type="button" className="desktop-dish__open" onClick={() => onOpenRecipe(item)}><span>{item.recipeSnapshot.title}</span></button>
                <button type="button" className="desktop-dish__remove" aria-label={`Удалить блюдо: ${item.recipeSnapshot.title}`} onClick={() => void updateMeal((current) => ({...current, recipes: current.recipes.filter((recipe) => recipe.id !== item.id)}))}>×</button>
                <div className="desktop-dish__controls">{shoppingSelection && <label title="Учитывать в списке покупок"><input type="checkbox" checked={!shoppingSelection.excludedIds.has(item.id)} aria-label={`Учитывать в покупках: ${item.recipeSnapshot.title}`} onChange={() => shoppingSelection.toggle(item.id)}/><span className="visually-hidden">Учитывать в покупках</span></label>}<div className="desktop-stepper" aria-label={`Порции: ${item.recipeSnapshot.title}`}><button type="button" aria-label="Уменьшить порции" disabled={item.servings <= 1} onClick={() => adjustServings(item.id, -1)}>−</button><span>{item.servings}</span><button type="button" aria-label="Увеличить порции" disabled={item.servings >= 100} onClick={() => adjustServings(item.id, 1)}>+</button></div></div>
            </article>)}
            {!meal.recipes.length && <div className="desktop-meal__dropzone">Перетащите рецепт сюда</div>}
            {meal.extraProducts.map((product) => <div className="desktop-extra-product" key={product.id}><label>{shoppingSelection && <input type="checkbox" checked={!shoppingSelection.excludedIds.has(product.id)} aria-label={`Учитывать в покупках: ${product.name}`} onChange={() => shoppingSelection.toggle(product.id)}/>}<span>{product.name} {product.amount} {product.um}</span></label><button type="button" aria-label={`Удалить продукт: ${product.name}`} onClick={() => void updateMeal((current) => ({...current, extraProducts: current.extraProducts.filter((item) => item.id !== product.id)}))}>×</button></div>)}
            <div className="desktop-extra-form"><button type="button" className="desktop-extra-form__trigger" onClick={() => setProductFormOpen(true)}>+ продукт</button>{productFormOpen && <div><select value={extraProductId ?? ""} aria-label={`Продукт из базы для ${meal.title}`} onChange={(event) => {setExtraProductId(Number(event.target.value) || null); setExtraName("");}}><option value="">Свой продукт</option>{commonIngredients.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select>{!extraProductId && <input className="desktop-extra-form__name" value={extraName} onChange={(event) => setExtraName(event.target.value)} placeholder="Название" aria-label={`Название продукта для ${meal.title}`}/>}<input value={extraAmount} onChange={(event) => setExtraAmount(event.target.value)} placeholder="Кол-во" aria-label={`Количество продукта для ${meal.title}`}/><input value={extraUnit} onChange={(event) => setExtraUnit(event.target.value)} placeholder="Ед." aria-label={`Единица продукта для ${meal.title}`}/><button type="button" aria-label={`Добавить продукт в ${meal.title}`} onClick={addExtraProduct} disabled={!(extraName.trim() || extraProductId)}>+</button><button type="button" className="desktop-extra-form__cancel" onClick={() => setProductFormOpen(false)}>Отмена</button></div>}</div>
        </div>
    </section>;
}

function DesktopMenuBoard({menu, recipes, commonIngredients, persistDays, addRecipe, addingRecipe, onSetTarget, onCalculate, onCancelSelection, shoppingSelection}: {
    menu: WeeklyMenu;
    recipes: Recipe[];
    commonIngredients: CommonIngredient[];
    persistDays: PersistDays;
    addRecipe: AddRecipeToMeal;
    addingRecipe: boolean;
    onSetTarget: (mealId: string) => void;
    onCalculate: () => void;
    onCancelSelection: () => void;
    shoppingSelection: ShoppingSelection;
}) {
    const [openedRecipe, setOpenedRecipe] = useState<MenuRecipe>();
    const [dropError, setDropError] = useState("");
    useEffect(() => {
        const receiveDrop = (event: Event) => {
            const {mealId, recipeId} = (event as CustomEvent<{mealId: string; recipeId: number}>).detail;
            const recipe = recipes.find((item) => item.id === recipeId);
            if (!recipe) return;
            setDropError("");
            void addRecipe(mealId, recipeId, recipe.servings).catch(() => setDropError("Не удалось добавить рецепт."));
        };
        document.addEventListener("smartmenu:drop-recipe", receiveDrop);
        return () => document.removeEventListener("smartmenu:drop-recipe", receiveDrop);
    }, [addRecipe, recipes]);
    const addDay = (side: "start" | "end") => void persistDays((days) => {
        const edgeDay = side === "start" ? days[0] : days[days.length - 1];
        const nextDate = new Date(`${edgeDay.date}T12:00:00`);
        nextDate.setDate(nextDate.getDate() + (side === "start" ? -1 : 1));
        const newDay: MenuDay = {
            id: crypto.randomUUID(), date: nextDate.toISOString().slice(0, 10), title: menuDayTitle(nextDate), includeInShopping: true, comment: "",
            meals: mealTitles.map((title) => ({id: crypto.randomUUID(), title, includeInShopping: true, recipes: [], extraProducts: []})),
        };
        return side === "start" ? [newDay, ...days] : [...days, newDay];
    });
    const removeLastDay = () => void persistDays((days) => days.length > 1 ? days.slice(0, -1) : days);
    const addMeal = (day: MenuDay) => {
        const nextTitle = mealTitles.find((title) => !day.meals.some((meal) => meal.title === title)) ?? "Приём пищи";
        void persistDays((days) => days.map((currentDay) => currentDay.id === day.id ? {...currentDay, meals: [...currentDay.meals, {id: crypto.randomUUID(), title: nextTitle, includeInShopping: true, recipes: [], extraProducts: []}]} : currentDay));
    };
    return <section className="desktop-menu" aria-label="План меню по дням" aria-busy={addingRecipe}>
        <header className="desktop-menu__toolbar">
            <div><p className="eyebrow">План питания</p><h1>{menu.title}</h1><span>{menu.days.length} {menu.days.length === 1 ? "день" : "дней"}</span></div>
            <div className="desktop-menu__actions">
                <button type="button" className="ui-secondary" onClick={() => addDay("start")} disabled={addingRecipe}>+ День слева</button>
                <button type="button" className="ui-secondary" onClick={() => addDay("end")} disabled={addingRecipe}>+ День справа</button>
                <button type="button" className="ui-secondary" onClick={removeLastDay} disabled={menu.days.length <= 1 || addingRecipe}>− Последний</button>
                {shoppingSelection && <button type="button" className="ui-secondary" disabled={addingRecipe} onClick={onCancelSelection}>Отмена</button>}
                <button type="button" className="button-dark" disabled={addingRecipe} onClick={onCalculate}>{shoppingSelection ? "Рассчитать" : "Список покупок"}</button>
            </div>
        </header>
        {shoppingSelection && <p className="menu-shopping-selection" role="status">Выберите продукты: отмечена вся неделя. Снимите отметки с лишнего и нажмите «Рассчитать».</p>}
        <div className="desktop-menu__viewport"><div className="desktop-menu__grid">{menu.days.map((day) => <article className="desktop-day smartmenu-day" key={day.id}>
            <header className="desktop-day__header">
                <h2>{day.title}</h2>
                <ActionMenu label={`Действия дня: ${day.title}`} actions={[{label: "Очистить день", danger: true, onSelect: () => void persistDays((days) => days.map((item) => item.id === day.id ? {...item, meals: item.meals.map((meal) => ({...meal, recipes: [], extraProducts: []}))} : item))}]}/>
            </header>
            <div className="desktop-day__meals">{day.meals.map((meal) => <DesktopMealBoard key={meal.id} day={day} meal={meal} commonIngredients={commonIngredients} persistDays={persistDays} onOpenRecipe={setOpenedRecipe} onSetTarget={onSetTarget} shoppingSelection={shoppingSelection}/>)}</div>
            <button type="button" className="desktop-day__add-meal" disabled={addingRecipe} onClick={() => addMeal(day)} aria-label={`Добавить приём пищи в день ${day.title}`}>+ Приём пищи</button>
            <details className="desktop-day__comment"><summary>Заметка</summary><textarea defaultValue={day.comment ?? ""} maxLength={2000} aria-label={`Комментарий к ${day.title}`} onBlur={(event) => {const comment = event.target.value.trim(); if (comment !== (day.comment ?? "")) void persistDays((days) => days.map((item) => item.id === day.id ? {...item, comment} : item));}}/></details>
        </article>)}</div></div>
        {dropError && <p className="smartmenu-error" role="alert">{dropError}</p>}
        <MenuRecipeDetails item={openedRecipe} open={Boolean(openedRecipe)} onOpenChange={(open) => !open && setOpenedRecipe(undefined)}/>
    </section>;
}

function DesktopRecipeLibrary({recipes, targetMealId, addRecipe, busy}: {recipes: Recipe[]; targetMealId: string | null; addRecipe: AddRecipeToMeal; busy: boolean;}) {
    const [search, setSearch] = useState("");
    const [openedRecipe, setOpenedRecipe] = useState<Recipe>();
    const filtered = recipes.filter((recipe) => recipe.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    return <><section className="desktop-recipe-library sidebar-section"><h3>Рецепты</h3><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти рецепт" aria-label="Поиск рецепта"/><p className="desktop-recipe-library__hint">{targetMealId ? "Выбран приём пищи — добавьте рецепт" : "Перетащите рецепт в нужный приём пищи"}</p><div className="desktop-recipe-library__list">{filtered.map((recipe) => <article className="desktop-recipe-library__item" key={recipe.id} draggable onDragStart={(event) => {event.dataTransfer.effectAllowed = "copy"; event.dataTransfer.setData("application/x-smartmenu-recipe", String(recipe.id));}}><button type="button" className="desktop-recipe-library__open" aria-label={`Открыть рецепт: ${recipe.title}`} onClick={() => setOpenedRecipe(recipe)}><RecipeImage src={recipe.image} alt=""/><span>{recipe.title}</span></button><button type="button" className="ui-icon-button" disabled={!targetMealId || busy} aria-label={`Добавить ${recipe.title} в выбранный приём пищи`} onClick={() => {if (targetMealId) void addRecipe(targetMealId, recipe.id, recipe.servings).catch(() => undefined);}}>+</button></article>)}</div>{!filtered.length && <p className="smartmenu-empty">Рецептов не найдено.</p>}</section><RecipeDetails recipe={openedRecipe} open={Boolean(openedRecipe)} onOpenChange={(open) => {if (!open) setOpenedRecipe(undefined);}}/></>;
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
    const [sideOpen,setSideOpen]=useState(false),[selectedDayId,setSelectedDayId]=useState<string|null>(null),[choosingMealId,setChoosingMealId]=useState<string|null>(null),[pickerSearch,setPickerSearch]=useState(""),[mobile,setMobile]=useState(()=>window.matchMedia('(max-width: 760px)').matches),[desktop,setDesktop]=useState(()=>window.matchMedia('(min-width: 1001px)').matches),[desktopTargetMealId,setDesktopTargetMealId]=useState<string|null>(null);
    const [excludedShoppingIds, setExcludedShoppingIds] = useState<Set<string> | null>(null);
    const [calculatingSelection, setCalculatingSelection] = useState(false);
    const shoppingSelection: ShoppingSelection = excludedShoppingIds === null ? null : {
        excludedIds: excludedShoppingIds,
        toggle: (id) => setExcludedShoppingIds((current) => {
            if (!current) return current;
            const next = new Set(current);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        }),
    };
    const selectedMenu = useMemo(
        () => menus.find((menu) => menu.id === (selectedMenuId ?? menus[0]?.id)),
        [menus, selectedMenuId],
    );
    const recipes = uniqueRecipes(
        recipesData?.owned ?? [],
        recipesData?.saved.map((item) => item.recipe).filter(Boolean) ?? [],
        catalog,
    );
    const shopping=useShoppingListEditor(selectedMenu?.id??null, () => void calculateSelection(), Boolean(shoppingSelection), addingRecipe || menuSaving || calculatingSelection);
    const selectedDay=selectedMenu?.days.find(day=>day.id===selectedDayId)??selectedMenu?.days[0];
    const choosingMeal=selectedDay?.meals.find(meal=>meal.id===choosingMealId);
    const chooseRecipe=(mealId:string)=>{setChoosingMealId(mealId);setSideOpen(true);};
    const daysRef = useRef<MenuDay[]>([]);
    const persistQueueRef = useRef<Promise<void>>(Promise.resolve());

    useEffect(() => {
        daysRef.current = selectedMenu ? structuredClone(selectedMenu.days) : [];
    }, [selectedMenu]);

    useEffect(()=>{setSelectedDayId(null);setChoosingMealId(null);setDesktopTargetMealId(null);setExcludedShoppingIds(null);},[selectedMenu?.id]);
    useEffect(()=>{
        const query=window.matchMedia('(max-width: 760px)'),change=()=>setMobile(query.matches);
        query.addEventListener('change',change);
        return()=>query.removeEventListener('change',change);
    },[]);
    useEffect(()=>{
        const query=window.matchMedia('(min-width: 1001px)'),change=()=>setDesktop(query.matches);
        query.addEventListener('change',change);
        return()=>query.removeEventListener('change',change);
    },[]);

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
            // A just-created day/meal is persisted through the ordered queue first,
            // otherwise the recipe endpoint cannot yet resolve its meal id.
            await persistQueueRef.current;
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

    const calculateSelection=async()=>{
        if (calculatingSelection || addingRecipe || menuSaving || !selectedMenu) return;
        if (!shoppingSelection) {
            setExcludedShoppingIds(new Set());
            setSideOpen(false);
            return;
        }
        setCalculatingSelection(true);
        const menuId = selectedMenu.id;
        // Capture the current queued state before awaiting any network work.
        // Every pending edit is ahead of this selection in the same save queue.
        const days = structuredClone(daysRef.current).map(day => ({
                ...day,
                includeInShopping: true,
                meals: day.meals.map(meal => ({
                    ...meal,
                    includeInShopping: true,
                    recipes: meal.recipes.map(item => ({...item, includeInShopping: !shoppingSelection.excludedIds.has(item.id)})),
                    extraProducts: meal.extraProducts.map(item => ({...item, includeInShopping: !shoppingSelection.excludedIds.has(item.id)})),
                })),
        }));
        try {
            const calculated=await shopping.recalculate(() => {
                const operation = persistQueueRef.current.then(async () => {
                    const updated = await updateMenu({id: menuId, patch: {days}}).unwrap();
                    daysRef.current = structuredClone(updated.days);
                });
                persistQueueRef.current = operation.catch(() => undefined);
                return operation;
            });
            if(calculated){setExcludedShoppingIds(null);setChoosingMealId(null);setSideOpen(true);}
        } finally {
            setCalculatingSelection(false);
        }
    };

    const selectedMenuIndex=selectedMenu?menus.findIndex(menu=>menu.id===selectedMenu.id):-1;
    const moveWeek=(offset:number)=>{
        const next=menus[selectedMenuIndex+offset];
        if(next)setSelectedMenuId(next.id);
    };
    const selectDay=(day:MenuDay)=>{
        setSelectedDayId(day.id);setChoosingMealId(null);
    };
    const daySummary=(day:MenuDay)=>day.meals.flatMap(meal=>meal.recipes.map(item=>item.recipeSnapshot.title)).join(' · ')||'Меню пока не заполнено';

    return (
        <fieldset className="menu-editing-boundary" disabled={calculatingSelection} aria-busy={calculatingSelection}>
        <div className="workspace menu-workspace">
            <div className="workspace__main">
                <h1 className="visually-hidden">Меню на неделю</h1>
                {menusLoading&&<p role="status">Загружаем меню...</p>}
                {menusError&&<p className="smartmenu-error" role="alert">Не удалось загрузить меню.</p>}
                {!menusLoading&&!selectedMenu&&<div className="menu-empty"><p>Создайте первое недельное меню.</p><button className="button-dark" onClick={()=>setCreateMenuOpen(true)}>Создать меню</button></div>}
                {selectedMenu&&selectedDay&&<>
                    {!desktop&&<div className="menu-week-toolbar">
                        <div className="menu-week-switcher"><button type="button" aria-label="Предыдущая неделя" disabled={selectedMenuIndex<=0} onClick={()=>moveWeek(-1)}>←</button><span>{selectedMenu.title}</span><button type="button" aria-label="Следующая неделя" disabled={selectedMenuIndex<0||selectedMenuIndex>=menus.length-1} onClick={()=>moveWeek(1)}>→</button></div>
                        <div className="menu-week-toolbar__actions">{shoppingSelection && <button type="button" className="ui-secondary" disabled={shopping.calculating||menuSaving} onClick={() => setExcludedShoppingIds(null)}>Отмена</button>}<button type="button" className="button-dark" disabled={shopping.calculating||menuSaving||addingRecipe} onClick={()=>void calculateSelection()}>{shopping.calculating?'Считаем...':shoppingSelection?'Рассчитать':'Список покупок'}</button></div>
                    </div>}
                    {!desktop && shoppingSelection && <p className="menu-shopping-selection" role="status">Выберите продукты: отмечена вся неделя. Снимите отметки с лишнего и нажмите «Рассчитать».</p>}
                    {desktop ? <DesktopMenuBoard menu={selectedMenu} recipes={recipes} commonIngredients={commonIngredients} persistDays={persistDays} addRecipe={addRecipe} addingRecipe={addingRecipe||shopping.calculating||menuSaving} onSetTarget={setDesktopTargetMealId} onCalculate={()=>void calculateSelection()} onCancelSelection={() => setExcludedShoppingIds(null)} shoppingSelection={shoppingSelection}/> : mobile ? <>
                        <div className="menu-day-strip" aria-label="Дни недели">{selectedMenu.days.map(day => <button key={day.id} type="button" className={selectedDay.id===day.id?'is-current':''} aria-pressed={selectedDay.id===day.id} aria-label={day.title} onClick={()=>selectDay(day)}><span>{day.title}</span><span className="menu-day-strip__mark" aria-hidden="true">{day.meals.some(meal=>meal.recipes.length||meal.extraProducts.length)?'•':''}</span></button>)}</div>
                        <section className="smartmenu-board" aria-busy={menuSaving}><DayEditor key={selectedDay.id} day={selectedDay} commonIngredients={commonIngredients} persistDays={persistDays} onChooseRecipe={chooseRecipe} shoppingSelection={shoppingSelection}/></section>
                    </> : <section className="menu-week-accordion" aria-label="Меню на всю неделю" aria-busy={menuSaving}>{selectedMenu.days.map(day => {
                        const opened = selectedDay.id === day.id;
                        return <article className={`menu-accordion-day${opened?' is-open':''}`} key={day.id}><button className="menu-accordion-day__summary" type="button" aria-expanded={opened} onClick={()=>selectDay(day)}><b>{day.title}</b><span>{daySummary(day)}</span><i aria-hidden="true">⌄</i></button>{opened&&<div className="menu-accordion-day__content"><DayEditor key={day.id} day={day} commonIngredients={commonIngredients} persistDays={persistDays} onChooseRecipe={chooseRecipe} shoppingSelection={shoppingSelection} showHeading={false}/></div>}</article>;
                    })}</section>}
                    <details className="menu-description-disclosure"><summary>Описание меню</summary><MenuDescriptionEditor menu={selectedMenu} saving={menuSaving} onSave={async description=>{await updateMenu({id:selectedMenu.id,patch:{description}}).unwrap();}}/></details>
                </>}
                {error&&<p className="smartmenu-error" role="alert">{error}</p>}
            </div>
            <Sidebar open={sideOpen} onOpenChange={setSideOpen} title="Под рукой" mobileTitle={choosingMeal?'Выбрать блюдо':'Список покупок'} triggerLabel={choosingMeal?'Открыть выбор блюда':'Открыть список покупок'}>
                <fieldset className="menu-editing-boundary" disabled={calculatingSelection}>
                {desktop&&<DesktopRecipeLibrary recipes={recipes} targetMealId={desktopTargetMealId} addRecipe={addRecipe} busy={addingRecipe||menuSaving}/>}<section className="sidebar-section menu-week-sidebar"><h3>Мои недели</h3>
                    {menus.length>0&&<label className="recipe-form__field">Выбранная неделя<select value={selectedMenu?.id??''} onChange={e=>setSelectedMenuId(Number(e.target.value))} aria-label="Выбранное меню">{menus.map(menu=><option key={menu.id} value={menu.id}>{menu.title}</option>)}</select></label>}
                    <div className="menu-week-actions"><button className="ui-link" onClick={()=>{setSideOpen(false);setCreateMenuOpen(true);}}>Создать меню</button>{selectedMenu&&<ActionMenu label="Действия недели" actions={[{label:'Удалить меню',danger:true,onSelect:()=>{if(window.confirm(`Удалить меню «${selectedMenu.title}»?`))void deleteMenu(selectedMenu.id).unwrap().then(()=>setSelectedMenuId(null)).catch(()=>setError('Не удалось удалить меню.'));}}]}/>}</div>
                </section>
                <section className={`sidebar-section menu-recipe-picker${choosingMeal?' is-active':''}`}><h3>Выбрать блюдо</h3>{choosingMeal?<><p className="menu-picker-context">{selectedDay?.title} · {choosingMeal.title}</p><input type="search" aria-label="Поиск блюда" placeholder="Найти рецепт" value={pickerSearch} onChange={e=>setPickerSearch(e.target.value)}/><div className="menu-picker-list">{recipes.filter(recipe=>recipe.title.toLocaleLowerCase().includes(pickerSearch.toLocaleLowerCase())).map(recipe=><div className="menu-picker-recipe" key={recipe.id}><RecipeImage src={recipe.image} alt=""/><span>{recipe.title}</span><button className="ui-icon-button" aria-label={`Добавить блюдо: ${recipe.title}`} disabled={addingRecipe||menuSaving} onClick={()=>void addRecipe(choosingMeal.id,recipe.id,recipe.servings).catch(()=>undefined)}>+</button></div>)}</div>{!recipes.length&&<p>Добавьте или сохраните рецепт в коллекции.</p>}<button className="ui-link" onClick={()=>setChoosingMealId(null)}>Отменить выбор</button></>:<p>Нажми «Выбрать блюдо» в нужном приёме пищи.</p>}</section>
                {selectedMenu&&<div className="sidebar-section shopping-sidebar">{shopping.content}</div>}
                </fieldset>
            </Sidebar>
            <Modal open={createMenuOpen} onOpenChange={setCreateMenuOpen} title="Новое меню" busy={creating}>
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
        </div>
        </fieldset>
    );
}

export default Menu;

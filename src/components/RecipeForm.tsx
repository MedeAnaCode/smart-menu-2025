import {useEffect, useRef, useState} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {useGetIngredientsQuery, useUploadRecipeImageMutation} from "../apiRtk";
import {recipeFormSchema, type RecipeFormValues} from "../validation/recipe";
import RecipeImage from "./RecipeImage";

const emptyIngredient = (custom: boolean): RecipeFormValues["ingredients"][number] => ({
    name: "",
    amount: "",
    um: "г",
    commonIngredientId: null,
    custom,
});

type Props = {
    initialValues?: RecipeFormValues;
    submitLabel: string;
    onSubmit: (values: RecipeFormValues) => Promise<void>;
    onCancel?: () => void;
};

export default function RecipeForm({initialValues, submitLabel, onSubmit, onCancel}: Props) {
    const {data: commonIngredients = [], isLoading: ingredientsLoading} = useGetIngredientsQuery();
    const [uploadImage] = useUploadRecipeImageMutation();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState("");
    const [submitError, setSubmitError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        control,
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors, isSubmitting},
    } = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeFormSchema),
        defaultValues: initialValues ?? {
            title: "",
            description: "",
            category: "Домашнее",
            servings: 1,
            preparing: "",
            image: "",
            ingredients: [emptyIngredient(true)],
        },
    });
    const {fields, append, remove} = useFieldArray({control, name: "ingredients"});
    const image = watch("image");

    useEffect(() => {
        if (!imageFile) {
            setFilePreview("");
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setFilePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const submit = handleSubmit(async (values) => {
        setSubmitError("");
        try {
            let imageUrl = values.image.trim() || "/img/recipes/unknown.jpg";
            if (imageFile) {
                const body = new FormData();
                body.append("image", imageFile);
                imageUrl = (await uploadImage(body).unwrap()).url;
            }
            await onSubmit({...values, image: imageUrl});
        } catch {
            setSubmitError("Не удалось сохранить рецепт. Проверьте данные и повторите попытку.");
        }
    });

    return (
        <form className="add-recipe-form recipe-form" onSubmit={(event) => void submit(event)} noValidate>
            <label className="recipe-form__field">
                Название
                <input {...register("title")} type="text" autoFocus />
                {errors.title && <span className="recipe-form__error">{errors.title.message}</span>}
            </label>
            <div className="recipe-form__row">
                <label className="recipe-form__field">
                    Категория
                    <input {...register("category")} type="text" />
                    {errors.category && <span className="recipe-form__error">{errors.category.message}</span>}
                </label>
                <label className="recipe-form__field">
                    Базовое число порций
                    <input {...register("servings", {valueAsNumber: true})} type="number" min="1" max="100" step="1" />
                    {errors.servings && <span className="recipe-form__error">{errors.servings.message}</span>}
                </label>
            </div>
            <label className="recipe-form__field">
                Описание
                <textarea {...register("description")} rows={3} />
            </label>
            <fieldset className="recipe-form__image-fieldset">
                <legend>Изображение</legend>
                <label className="recipe-form__field">
                    Ссылка на изображение
                    <input
                        {...register("image")}
                        type="url"
                        placeholder="https://example.com/recipe.jpg"
                    />
                    {errors.image && <span className="recipe-form__error">{errors.image.message}</span>}
                </label>
                <span className="recipe-form__image-separator">или</span>
                <label className="recipe-form__field">
                    Загрузить с компьютера
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                    />
                    <span className="recipe-form__hint">JPG, PNG, WebP или GIF, до 5 МБ. Загруженный файл имеет приоритет над ссылкой.</span>
                </label>
                {imageFile && (
                    <button type="button" onClick={() => {
                        setImageFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    }}>
                        Убрать выбранный файл
                    </button>
                )}
            </fieldset>
            {(filePreview || image) && (
                <RecipeImage
                    className="recipe-form__preview"
                    src={filePreview || image}
                    alt="Предпросмотр рецепта"
                />
            )}
            <section className="recipe-form__ingredients">
                <div className="recipe-form__section-title">
                    <h3>Ингредиенты</h3>
                </div>
                {ingredientsLoading && <p>Загружаем общую базу...</p>}
                {fields.map((field, index) => (
                    <fieldset className="recipe-form__ingredient" key={field.id}>
                        <legend>Ингредиент {index + 1}</legend>
                        <Controller
                            control={control}
                            name={`ingredients.${index}.custom`}
                            render={({field: customField}) => (
                                <label className="recipe-form__custom-toggle">
                                    <input
                                        type="checkbox"
                                        checked={customField.value}
                                        onChange={(event) => {
                                            customField.onChange(event.target.checked);
                                            setValue(`ingredients.${index}.commonIngredientId`, null);
                                            setValue(`ingredients.${index}.name`, "");
                                        }}
                                    />
                                    Свой ингредиент
                                </label>
                            )}
                        />
                        {watch(`ingredients.${index}.custom`) ? (
                            <>
                                <input {...register(`ingredients.${index}.name`)} placeholder="Название ингредиента" />
                                <span className="recipe-form__custom-mark">Свой ингредиент</span>
                            </>
                        ) : (
                            <Controller
                                control={control}
                                name={`ingredients.${index}.commonIngredientId`}
                                render={({field: commonField}) => (
                                    <select
                                        value={commonField.value ?? ""}
                                        onChange={(event) => {
                                            const id = Number(event.target.value);
                                            commonField.onChange(id || null);
                                            setValue(
                                                `ingredients.${index}.name`,
                                                commonIngredients.find((item) => item.id === id)?.name ?? "",
                                            );
                                        }}
                                    >
                                        <option value="">Выберите из общей базы</option>
                                        {commonIngredients.map((ingredient) => (
                                            <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        )}
                        <input {...register(`ingredients.${index}.amount`)} type="number" min="0" step="any" placeholder="Количество" />
                        <select {...register(`ingredients.${index}.um`)}>
                            {["г", "кг", "мл", "л", "шт", "ч.л.", "ст.л.", "по вкусу"].map((unit) => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                        <button type="button" aria-label={`Удалить ингредиент ${index + 1}`} onClick={() => remove(index)}>Удалить</button>
                        {errors.ingredients?.[index]?.name && (
                            <span className="recipe-form__error">{errors.ingredients[index]?.name?.message}</span>
                        )}
                    </fieldset>
                ))}
                <button
                    className="recipe-form__add-ingredient"
                    type="button"
                    aria-label="Добавить ингредиент"
                    title="Добавить ингредиент"
                    onClick={() => append(emptyIngredient(commonIngredients.length === 0))}
                >
                    <span aria-hidden="true">+</span>
                </button>
                <p className="recipe-form__hint">
                    Свои ингредиенты сохраняются только в этом рецепте и не объединяются автоматически в списке покупок.
                </p>
                {errors.ingredients?.root && <span className="recipe-form__error">{errors.ingredients.root.message}</span>}
            </section>
            <label className="recipe-form__field">
                Этапы приготовления
                <textarea {...register("preparing")} rows={6} />
                {errors.preparing && <span className="recipe-form__error">{errors.preparing.message}</span>}
            </label>
            {submitError && <p className="recipe-form__error" role="alert">{submitError}</p>}
            <div className="recipe-form__actions">
                <button className="button-dark" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Сохраняем..." : submitLabel}
                </button>
                {onCancel && <button type="button" onClick={onCancel} disabled={isSubmitting}>Отменить</button>}
            </div>
        </form>
    );
}

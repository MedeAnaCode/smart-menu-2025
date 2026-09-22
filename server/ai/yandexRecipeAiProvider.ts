import type {RecipeAiProvider} from "./recipeImport";

const systemPrompt = `Ты разбираешь русский рецепт в JSON. Ничего не сочиняй. Поле title — обязательное непустое название блюда из текста; если отдельного названия нет, составь короткое фактическое название по составу. Название блюда не переноси в description. Поле preparing сохрани максимально дословно: не убирай числа, порядок шагов и переводы строк. description заполняй только отдельным описанием, не пересказывай приготовление.
Каноническое название ингредиента (поле name): именительный падеж, единственное число независимо от количества, первая буква заглавная. Примеры: "яйцо", "яйца", "яиц" → "Яйцо"; "огурцы" → "Огурец"; "помидоры" → "Помидор"; "томаты" → "Томат"; "грибы" → "Гриб"; "креветки" → "Креветка"; "маслины" → "Маслина"; "листья лайма" → "Лист лайма". Обычные согласованные прилагательные ставь перед существительным: "масло оливковое" → "Оливковое масло", "молоко кокосовое" → "Кокосовое молоко", "филе куриное" → "Куриное филе", "сок лимонный" → "Лимонный сок", "розмарин сушёный" → "Сушёный розмарин". Родительные конструкции и именованные продукты сохраняй: "Зубчик чеснока", "Лист лайма", "Сыр Фета", "Соус Терияки". Пиши букву ё там, где она нужна по орфографии: "Мёд", "Сушёный розмарин", "Чёрный перец". Сохраняй естественные названия, употребляемые во множественном числе: "Спагетти", "Макароны", "Сливки", "Овсяные хлопья долгой варки". Сохраняй значимые уточнения и части продукта. Не заменяй слова синонимами: "Томат" остаётся "Томат", "Помидор" — "Помидор". Это правило относится только к name: description и preparing не изменяй ради нормализации названий.
Разрешены единицы: г, кг, мл, л, шт, ч.л., ст.л., по вкусу. Счётную часть продукта сохраняй в названии ингредиента и измеряй в шт. Для диапазона количества счётных частей выбирай нижнюю границу: "2–3 зубчика чеснока" → name="Зубчик чеснока", amount=2, unit="шт", needsReview=false, warning="". Зубчик не равен головке чеснока; не переводи его в граммы или головки. В приготовлении исходный диапазон сохраняй дословно. Если мера неоднозначна (стакан, пучок, упаковка), не преобразуй её: верни исходную unit и needsReview=true. Для остальных диапазонов, например в граммах, сохрани исходную строку amount и needsReview=true. Обычные единицы массы и объёма не включай в название продукта. Разные продукты, например соль и чёрный перец, перечисляй отдельными ингредиентами. Альтернативы не складывай: выбери основной вариант и укажи альтернативу в warning, сохраняя её в приготовлении. Если количества нет, amount=null и unit="по вкусу", needsReview=false: это значение по умолчанию, отсутствие меры само по себе не требует уточнения. Назначение "для жарки", "для украшения" и другие инструкции использования сохраняй в warning, а не в name: каноническое имя продукта не зависит от его роли в рецепте. Если число есть, но единица отсутствует, сохрани исходное amount и пустую unit, needsReview=true. Не придумывай количество. Поле warning возвращай для каждого ингредиента: текст предупреждения или пустую строку, если предупреждения нет. Любые особенности "по желанию" сохраняй в warning. Если порции не указаны, разумно оцени целое число и укажи servingsSource="estimated". Приготовление копируй дословно полностью, включая последний шаг, абзацы, количества, время и альтернативы. Возвращай только данные по схеме.`;

const responseSchema = {
    type: "object", additionalProperties: false,
    required: ["title", "description", "preparing", "servings", "servingsSource", "ingredients"],
    properties: {
        title: {type: "string", minLength: 2, maxLength: 255}, description: {type: "string"}, preparing: {type: "string"},
        servings: {type: "integer", minimum: 1, maximum: 100},
        servingsSource: {type: "string", enum: ["explicit", "estimated"]},
        ingredients: {type: "array", minItems: 1, items: {type: "object", additionalProperties: false, required: ["name", "amount", "unit", "needsReview", "warning"], properties: {name: {type: "string"}, amount: {anyOf: [{type: "number"}, {type: "string"}, {type: "null"}]}, unit: {type: "string"}, needsReview: {type: "boolean"}, warning: {type: "string"}}}},
    },
} as const;

type YandexConfig = {apiKey: string; folderId: string; model: string; endpoint: string};
function getConfig(): YandexConfig {
    if (process.env.AI_RECIPE_PROVIDER && process.env.AI_RECIPE_PROVIDER !== "yandex") throw new Error("Выбранный провайдер импорта рецептов пока не поддерживается.");
    const apiKey = process.env.YANDEX_AI_API_KEY;
    const folderId = process.env.YANDEX_FOLDER_ID;
    if (!apiKey || !folderId) throw new Error("Интеграция YandexGPT ещё не настроена. Добавьте YANDEX_AI_API_KEY и YANDEX_FOLDER_ID на сервере.");
    return {apiKey, folderId, model: process.env.YANDEX_AI_RECIPE_MODEL ?? "yandexgpt-lite", endpoint: process.env.YANDEX_AI_ENDPOINT ?? "https://ai.api.cloud.yandex.net/foundationModels/v1/completion"};
}
function extractJson(payload: unknown): unknown {
    const text = (payload as {result?: {alternatives?: Array<{message?: {text?: string}}>}})?.result?.alternatives?.[0]?.message?.text;
    if (!text) throw new Error("YandexGPT не вернул ответ для рецепта.");
    try { return JSON.parse(text); } catch { throw new Error("YandexGPT вернул ответ в неожиданном формате. Попробуйте ещё раз."); }
}
export class YandexRecipeAiProvider implements RecipeAiProvider {
    async parseRecipe(text: string): Promise<unknown> {
        const config = getConfig();
        const response = await fetch(config.endpoint, {method: "POST", headers: {"Content-Type": "application/json", Authorization: `Api-Key ${config.apiKey}`, "x-data-logging-enabled": "false"}, body: JSON.stringify({modelUri: `gpt://${config.folderId}/${config.model}`, completionOptions: {stream: false, temperature: 0.1, maxTokens: 4000}, json_schema: {schema: responseSchema}, messages: [{role: "system", text: systemPrompt}, {role: "user", text}]}), signal: AbortSignal.timeout(30_000)});
        if (!response.ok) {const detail = await response.text();console.error("YandexGPT recipe import failed", response.status, detail.slice(0, 500));throw new Error("Не удалось разобрать рецепт с помощью YandexGPT. Повторите попытку позже.");}
        return extractJson(await response.json());
    }
}

import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {RecipeImportService} from "./recipeImport";
import {YandexRecipeAiProvider} from "./yandexRecipeAiProvider";

function expectStrictObjectSchemas(schema: unknown): void {
    if (!schema || typeof schema !== "object") return;
    if (Array.isArray(schema)) {
        schema.forEach(expectStrictObjectSchemas);
        return;
    }
    const node = schema as Record<string, unknown>;
    if (node.type === "object") {
        expect(node.additionalProperties).toBe(false);
        expect(node.properties).toBeDefined();
        expect(node.required).toEqual(expect.any(Array));
        expect([...(node.required as string[])].sort()).toEqual(Object.keys(node.properties as object).sort());
    }
    Object.values(node).forEach(expectStrictObjectSchemas);
}

describe("Yandex recipe provider", () => {
    beforeEach(() => {
        vi.stubEnv("AI_RECIPE_PROVIDER", "yandex");
        vi.stubEnv("YANDEX_AI_API_KEY", "test-api-key");
        vi.stubEnv("YANDEX_FOLDER_ID", "test-folder");
        vi.stubEnv("YANDEX_AI_RECIPE_MODEL", "yandexgpt-lite");
        vi.stubEnv("YANDEX_AI_ENDPOINT", "https://ai.api.cloud.yandex.net/foundationModels/v1/completion");
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it("sends a strict root json_schema and preserves recipe text and fallback warnings", async () => {
        const preparing = "1. Добавьте 200 г муки.\n2. Вбейте 4 яйца.\n\nЧасть укропа оставьте для подачи.";
        const description = "Семейный рецепт с укропом.";
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            result: {alternatives: [{message: {text: JSON.stringify({
                title: "Оладьи", description, preparing, servings: 4, servingsSource: "estimated",
                ingredients: [
                    {name: "Мука", amount: 200, unit: "г", needsReview: false, warning: ""},
                    {name: "Яйца", amount: 4, unit: "шт", needsReview: false, warning: ""},
                    {name: "Укроп", amount: 1, unit: "пучок", needsReview: true, warning: ""},
                ],
            })}}]},
        }), {status: 200, headers: {"Content-Type": "application/json"}}));
        vi.stubGlobal("fetch", fetchMock);
        const source = "Оладьи: мука 200 г, яйца 4 шт, укроп 1 пучок.\n" + preparing;

        const draft = await new RecipeImportService(new YandexRecipeAiProvider()).importRecipe(source);

        expect(fetchMock).toHaveBeenCalledOnce();
        const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("https://ai.api.cloud.yandex.net/foundationModels/v1/completion");
        expect(options.method).toBe("POST");
        const body = JSON.parse(options.body as string);
        expect(body.modelUri).toBe("gpt://test-folder/yandexgpt-lite");
        expect(body.json_schema.schema.type).toBe("object");
        expect(body.json_schema.schema.properties.title).toMatchObject({type: "string", minLength: 2, maxLength: 255});
        expect(body).not.toHaveProperty("responseFormat");
        expect(body.completionOptions).not.toHaveProperty("json_schema");
        expectStrictObjectSchemas(body.json_schema.schema);
        expect(body.messages[1]).toEqual({role: "user", text: source});
        expect(draft.preparing).toBe(preparing);
        expect(draft.description).toBe(description);
        expect(draft.ingredients[0].warning).toBeUndefined();
        expect(draft.ingredients[2]).toMatchObject({needsReview: true, um: "по вкусу"});
        expect(draft.warnings).toContainEqual(expect.stringContaining("1 пучок"));
    });
});

import {describe, expect, it} from "vitest";
import {toFormIngredient} from "../../src/importedIngredient";

describe("imported ingredient form matching", () => {
    it.each(["Яйцо", "яйцо", " ЯЙЦО "])("selects the standard ingredient for %j without changing quantities", (name) => {
        expect(toFormIngredient(
            {name, amount: "4", um: "шт", needsReview: false},
            [{id: 7, name: "Яйцо"}],
        )).toEqual({name: "Яйцо", amount: "4", um: "шт", commonIngredientId: 7, custom: false});
    });

    it("matches a lower-case catalog name and preserves its spelling", () => {
        expect(toFormIngredient(
            {name: "Яйцо", amount: "2", um: "шт", needsReview: false},
            [{id: 7, name: "яйцо"}],
        )).toMatchObject({name: "яйцо", commonIngredientId: 7, custom: false});
    });

    it.each(["Яйца", "Яичный белок", "Томат"])("leaves %j custom when only a different exact name exists", (name) => {
        expect(toFormIngredient(
            {name, amount: "1", um: "шт", needsReview: false},
            [{id: 7, name: "Яйцо"}, {id: 8, name: "Помидор"}],
        )).toMatchObject({name, commonIngredientId: null, custom: true});
    });
});

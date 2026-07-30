import path from "node:path";
import {expect, test, type Page} from "@playwright/test";

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}@example.test`;

async function register(page: Page, email: string, firstName: string) {
    page.on("response", async (response) => {
        if (response.url().includes("/api/") && response.status() >= 400) {
            console.log(`API ${response.status()} ${response.url()}: ${await response.text()}`);
        }
    });
    await page.goto("/profile/recipes");
    await page.getByRole("button", {name: "Зарегистрироваться"}).click();
    await page.locator("#firstName").fill(firstName);
    await page.locator("#lastName").fill("Test");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("SmartMenu-test-123");
    await page.locator("#password-confirm").fill("SmartMenu-test-123");
    await page.getByRole("button", {name: /register|зарегистрироваться/i}).click();
    await expect(page).toHaveURL(/\/profile\/recipes/);
    await expect(page.getByText(firstName, {exact: false}).first()).toBeVisible();
}

test("основной сценарий рецепта, меню и списка покупок", async ({page}) => {
    await register(page, uniqueEmail("owner"), "Owner");

    await page.reload();
    await expect(page.getByText("Owner", {exact: false}).first()).toBeVisible();

    await page.getByRole("button", {name: "Новый рецепт"}).click();
    await page.getByLabel("Название").fill("E2E овощной суп");
    await page.getByLabel("Категория").fill("Супы");
    await page.getByLabel("Описание").fill("Рецепт для проверки SmartMenu");
    await page.getByLabel("Базовое число порций").fill("2");
    await page.getByLabel("Изображение").setInputFiles(path.resolve("public/img/recipes/pumpkin.jpg"));
    await page.getByLabel("Свой ингредиент").check();
    await page.getByPlaceholder("Название ингредиента").fill("Тестовый овощ");
    await page.getByPlaceholder("Количество").first().fill("100");
    await page.getByLabel("Этапы приготовления").fill("Смешать и приготовить.");
    await page.getByRole("button", {name: "Создать рецепт"}).click();

    const ownCard = page.locator(".recipe-card").filter({hasText: "E2E овощной суп"}).first();
    await expect(ownCard).toBeVisible();
    await ownCard.getByLabel("Порций").fill("4");
    await expect(ownCard.getByText(/200 г/)).toBeVisible();
    await ownCard.getByRole("button", {name: "Ред."}).click();
    await page.getByLabel("Описание").fill("Обновлённое описание");
    await page.getByRole("button", {name: "Сохранить изменения"}).click();
    await expect(ownCard.getByText("Обновлённое описание")).toBeVisible();
    await ownCard.getByRole("button", {name: "Опубликовать"}).click();
    await expect(ownCard.getByRole("button", {name: "Снять"})).toBeVisible();

    await page.goto("/profile/menu");
    await page.getByPlaceholder("Название нового меню").fill("E2E неделя");
    await page.getByRole("button", {name: "Создать меню"}).click();
    await page.locator(".smartmenu-panel").filter({hasText: "Добавить рецепт"}).getByRole("combobox").first()
        .selectOption({label: "E2E овощной суп"});
    await page.getByLabel("Порций").fill("3");
    await page.getByRole("button", {name: "Добавить рецепт"}).click();
    await expect(page.getByText("E2E овощной суп").last()).toBeVisible();

    const firstMeal = page.locator(".smartmenu-meal").first();
    await firstMeal.getByPlaceholder("Дополнительный продукт").fill("Хлеб");
    await firstMeal.getByPlaceholder("Количество").fill("1");
    await firstMeal.getByRole("button", {name: "Добавить продукт"}).click();
    await expect(firstMeal.getByText(/Хлеб/)).toBeVisible();
    const breadRow = firstMeal.locator(".smartmenu-menu-item--extra").filter({hasText: "Хлеб"});
    const breadCheckbox = breadRow.getByRole("checkbox");
    await breadCheckbox.click();
    await expect(breadCheckbox).not.toBeChecked();
    await page.getByRole("button", {name: "Рассчитать заново"}).click();
    await expect(page.locator('input[value="Тестовый овощ"]')).toBeVisible();
    await expect(page.locator('input[value="Хлеб"]')).toHaveCount(0);

    await page.getByPlaceholder("Добавить вручную").fill("Салфетки");
    await page.locator(".smartmenu-inline-form").last().getByRole("button", {name: "Добавить"}).click();
    await page.getByRole("button", {name: "Сохранить изменения"}).click();
    await expect(page.locator('input[value="Салфетки"]')).toBeVisible();

    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", {name: "Рассчитать заново"}).click();
    await expect(page.locator('input[value="Салфетки"]')).toHaveCount(0);

    await page.goto("/profile/recipes");
    const updatedCard = page.locator(".recipe-card").filter({hasText: "E2E овощной суп"}).first();
    await updatedCard.getByRole("button", {name: "Снять"}).click();
    await expect(updatedCard.getByRole("button", {name: "Опубликовать"})).toBeVisible();
});

test("сохранение опубликованного рецепта и создание своей копии", async ({browser}) => {
    const ownerPage = await browser.newPage();
    await register(ownerPage, uniqueEmail("publisher"), "Publisher");
    await ownerPage.getByRole("button", {name: "Новый рецепт"}).click();
    await ownerPage.getByLabel("Название").fill("E2E опубликованный рецепт");
    await ownerPage.getByLabel("Описание").fill("Для второго пользователя");
    await ownerPage.getByLabel("Этапы приготовления").fill("Приготовить.");
    await ownerPage.getByLabel("Свой ингредиент").check();
    await ownerPage.getByPlaceholder("Название ингредиента").fill("Продукт");
    await ownerPage.getByPlaceholder("Количество").first().fill("1");
    await ownerPage.getByRole("button", {name: "Создать рецепт"}).click();
    const published = ownerPage.locator(".recipe-card").filter({hasText: "E2E опубликованный рецепт"}).first();
    await published.getByRole("button", {name: "Опубликовать"}).click();

    const readerPage = await browser.newPage();
    await register(readerPage, uniqueEmail("reader"), "Reader");
    const catalogCard = readerPage.locator(".recipe-card").filter({hasText: "E2E опубликованный рецепт"}).last();
    await catalogCard.getByRole("button", {name: "В мои рецепты"}).click();
    const savedCard = readerPage.locator(".recipe-card").filter({hasText: "E2E опубликованный рецепт"}).first();
    await expect(savedCard).toBeVisible();
    await savedCard.getByRole("button", {name: "Создать свою копию"}).click();
    await expect(readerPage.getByText("E2E опубликованный рецепт (копия)").first()).toBeVisible();
    await readerPage.getByRole("button", {name: "Удалить из моих"}).click();
    await expect(readerPage.getByRole("button", {name: "Удалить из моих"})).toHaveCount(0);
});

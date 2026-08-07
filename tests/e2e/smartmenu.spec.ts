import path from "node:path";
import {expect, test, type Page} from "@playwright/test";

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}@example.test`;

async function register(page: Page, email: string, firstName: string) {
    page.on("response", async (response) => {
        if (response.url().includes("/api/") && response.status() >= 400) {
            console.log(`API ${response.status()} ${response.url()}: ${await response.text()}`);
        }
    });
    await page.goto("/profile/recipes", {waitUntil: "domcontentloaded"});
    await expect(page.locator("header").getByRole("button", {name: "Войти"})).toBeVisible();
    await expect(page.locator("main").getByRole("button", {name: "Войти"})).toHaveCount(0);
    await page.getByRole("button", {name: "Зарегистрироваться"}).click({noWaitAfter: true});
    await page.locator("#firstName").fill(firstName);
    await page.locator("#lastName").fill("Test");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("SmartMenu-test-123");
    await page.locator("#password-confirm").fill("SmartMenu-test-123");
    await page.getByRole("button", {name: /register|зарегистрироваться/i}).click({noWaitAfter: true});
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:9000\/profile\/recipes(?:[?#]|$)/);
    await expect(page.locator("header").getByRole("button", {name: "Выйти"})).toBeVisible();
}

async function expectResponsiveLayout(page: Page) {
    await expect.poll(() => page.evaluate(() => (
        document.documentElement.scrollWidth <= document.documentElement.clientWidth
    ))).toBe(true);

    const overlapsFooter = await page.evaluate(() => {
        const workspace = document.querySelector<HTMLElement>(".functional-page");
        const footer = document.querySelector<HTMLElement>(".page-footer--profile");
        if (!workspace || !footer || getComputedStyle(footer).position !== "fixed") return false;
        return workspace.getBoundingClientRect().bottom > footer.getBoundingClientRect().top + 1;
    });
    expect(overlapsFooter).toBe(false);
}

test("вход запускается из кнопки в шапке", async ({page}) => {
    await page.goto("/profile/menu", {waitUntil: "domcontentloaded"});
    await page.locator("header").getByRole("button", {name: "Войти"}).click({noWaitAfter: true});
    await expect(page).toHaveURL(/\/realms\/smartmenu\/protocol\/openid-connect\/auth/);
    await expect(page.locator("#username")).toBeVisible();
});

test("основной сценарий рецепта, меню и списка покупок", async ({page}) => {
    await register(page, uniqueEmail("owner"), "Owner");

    await page.reload({waitUntil: "domcontentloaded"});
    await expect(page.locator("header").getByRole("button", {name: "Выйти"})).toBeVisible();

    await page.getByRole("button", {name: "Новый рецепт"}).click();
    await page.getByLabel("Название").fill("E2E овощной суп");
    await page.getByLabel("Категория").fill("Супы");
    await page.getByLabel("Описание").fill("Рецепт для проверки SmartMenu");
    await page.getByLabel("Базовое число порций").fill("2");
    await page.getByLabel("Загрузить с компьютера").setInputFiles(path.resolve("public/img/recipes/pumpkin.jpg"));
    await page.getByLabel("Свой ингредиент").check();
    const ingredientName = page.getByPlaceholder("Название ингредиента");
    await ingredientName.fill("Тестовый овощ");
    await expect.poll(() => ingredientName.evaluate((input) => getComputedStyle(input).borderTopWidth)).toBe("0px");
    const addIngredientButton = page.getByRole("button", {name: "Добавить ингредиент"});
    await expect(addIngredientButton).toHaveText("+");
    expect(await addIngredientButton.evaluate((button) => {
        const styles = getComputedStyle(button);
        return button.clientWidth === button.clientHeight
            && styles.borderRadius === "50%"
            && styles.backgroundColor !== "rgba(0, 0, 0, 0)";
    })).toBe(true);
    expect(await page.locator(".recipe-form__ingredients").evaluate((section) => {
        const ingredient = section.querySelector(".recipe-form__ingredient:last-of-type");
        const button = section.querySelector(".recipe-form__add-ingredient");
        return Boolean(ingredient && button && (ingredient.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING));
    })).toBe(true);
    await page.getByPlaceholder("Количество").first().fill("100");
    await page.getByLabel("Этапы приготовления").fill("Смешать и приготовить.");
    await page.getByRole("button", {name: "Создать рецепт"}).click();

    const ownCard = page.locator(".recipe-card").filter({hasText: "E2E овощной суп"}).first();
    await expect(ownCard).toBeVisible();
    const uploadedImage = ownCard.getByRole("img", {name: "E2E овощной суп"});
    await expect(uploadedImage).toHaveAttribute("src", /\/uploads\//);
    await expect.poll(() => uploadedImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await ownCard.getByLabel("Порций").fill("4");
    await expect(ownCard.getByText(/200 г/)).toBeVisible();
    await ownCard.getByRole("button", {name: "Ред."}).click();
    await page.getByLabel("Описание").fill("Обновлённое описание");
    await page.getByLabel("Ссылка на изображение").fill("http://127.0.0.1:9000/img/recipes/salad.png");
    await page.getByRole("button", {name: "Сохранить изменения"}).click();
    await expect(ownCard.getByText("Обновлённое описание")).toBeVisible();
    await expect(ownCard.getByRole("img", {name: "E2E овощной суп"})).toHaveAttribute(
        "src",
        "http://127.0.0.1:9000/img/recipes/salad.png",
    );
    await ownCard.getByRole("button", {name: "Опубликовать"}).click();
    await expect(ownCard.getByRole("button", {name: "Снять"})).toBeVisible();

    await page.goto("/profile/menu", {waitUntil: "domcontentloaded"});
    await expect(page.getByLabel("Название меню")).toHaveCount(0);
    await page.getByRole("button", {name: "Создать меню"}).click();
    const createMenuDialog = page.getByRole("dialog", {name: "Новое меню"});
    await createMenuDialog.getByLabel("Название меню").fill("E2E неделя");
    const confirmMenuCreation = createMenuDialog.getByRole("button", {name: "Подтвердить создание"});
    await expect(confirmMenuCreation).toBeEnabled();
    await confirmMenuCreation.click({force: true});
    await expect(createMenuDialog).toHaveCount(0);
    const descriptionPanel = page.locator(".smartmenu-menu-description");
    await descriptionPanel.getByLabel("Описание меню").fill("Проверочная неделя с овощными блюдами");
    await descriptionPanel.getByRole("button", {name: "Сохранить описание"}).click();

    const monday = page.locator(".smartmenu-day").filter({hasText: "Понедельник"});
    await monday.getByLabel("Приём пищи для Понедельник").selectOption({label: "Завтрак"});
    await monday.getByRole("button", {name: "Добавить приём пищи"}).click();
    const firstMeal = monday.locator(".smartmenu-meal").filter({hasText: "Завтрак"});
    await firstMeal.getByLabel("Рецепт для Завтрак").selectOption({label: "E2E овощной суп"});
    await expect(firstMeal.getByLabel("Порций для Завтрак")).toHaveValue("2");
    await firstMeal.getByLabel("Порций для Завтрак").fill("3");
    await firstMeal.getByRole("button", {name: "Добавить блюдо"}).click();
    await expect(firstMeal.getByRole("button", {name: "E2E овощной суп"})).toBeVisible();
    await firstMeal.getByRole("button", {name: "E2E овощной суп"}).click();
    const recipeDialog = page.getByRole("dialog");
    await expect(recipeDialog.getByText("3 порц.")).toBeVisible();
    await expect(recipeDialog.getByText(/150 г/)).toBeVisible();
    await recipeDialog.getByRole("button", {name: "Закрыть"}).click();

    await monday.getByLabel("Комментарий к дню").fill("Подготовить овощи вечером");
    await monday.getByRole("button", {name: "Сохранить комментарий"}).click();
    const commonProductSelect = firstMeal.getByLabel("Дополнительный продукт для Завтрак");
    await expect.poll(() => commonProductSelect.locator("option").count()).toBeGreaterThan(1);
    const commonProductName = (await commonProductSelect.locator("option").nth(1).textContent())!;
    await commonProductSelect.selectOption({index: 1});
    await firstMeal.getByLabel("Количество дополнительного продукта для Завтрак").fill("2");
    await firstMeal.getByRole("button", {name: "Добавить продукт"}).click();
    await expect(firstMeal.locator(".smartmenu-menu-item--extra").filter({hasText: commonProductName})).toBeVisible();

    await firstMeal.getByLabel("Свой продукт").check();
    await firstMeal.getByLabel("Название своего продукта для Завтрак").fill("Хлеб");
    await firstMeal.getByLabel("Количество дополнительного продукта для Завтрак").fill("1");
    await firstMeal.getByRole("button", {name: "Добавить продукт"}).click();
    await expect(firstMeal.getByText(/Хлеб/)).toBeVisible();
    const breadRow = firstMeal.locator(".smartmenu-menu-item--extra").filter({hasText: "Хлеб"});
    const breadCheckbox = breadRow.getByRole("checkbox");
    await breadCheckbox.click();
    await expect(breadCheckbox).not.toBeChecked();
    await page.getByRole("button", {name: "Рассчитать заново"}).click();
    await expect(page.locator('input[value="Тестовый овощ"]')).toBeVisible();
    const commonShoppingInput = page.locator(`input[value="${commonProductName}"]`);
    await expect(commonShoppingInput).toBeVisible();
    await expect.poll(() => commonShoppingInput.evaluate((input) => getComputedStyle(input).borderTopWidth)).toBe("0px");
    await expect(page.locator('input[value="Хлеб"]')).toHaveCount(0);

    await page.getByPlaceholder("Добавить вручную").fill("Салфетки");
    await page.locator(".smartmenu-inline-form").last().getByRole("button", {name: "Добавить"}).click();
    await page.getByRole("button", {name: "Сохранить изменения"}).click();
    await expect(page.locator('input[value="Салфетки"]')).toBeVisible();

    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", {name: "Рассчитать заново"}).click();
    await expect(page.locator('input[value="Салфетки"]')).toHaveCount(0);

    await page.reload({waitUntil: "domcontentloaded"});
    await expect(page.getByLabel("Описание меню")).toHaveValue("Проверочная неделя с овощными блюдами");
    const reloadedMonday = page.locator(".smartmenu-day").filter({hasText: "Понедельник"});
    await expect(reloadedMonday.getByLabel("Комментарий к дню")).toHaveValue("Подготовить овощи вечером");
    await expectResponsiveLayout(page);
    await reloadedMonday.scrollIntoViewIfNeeded();
    await page.setViewportSize({width: 390, height: 844});
    await expectResponsiveLayout(page);
    await expect(reloadedMonday).toBeVisible();
    await reloadedMonday.scrollIntoViewIfNeeded();
    await page.setViewportSize({width: 1280, height: 720});

    await page.goto("/profile/recipes", {waitUntil: "domcontentloaded"});
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

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

    await expect(page.locator(".page-footer")).toHaveCount(1);
    const layout = await page.evaluate(() => {
        const workspace = document.querySelector<HTMLElement>("main")!;
        const footer = document.querySelector<HTMLElement>(".page-footer")!;
        return {
            overlapsFooter: workspace.getBoundingClientRect().bottom > footer.getBoundingClientRect().top + 1,
            footerPosition: getComputedStyle(footer).position,
            fillsViewport: document.querySelector("#root")!.getBoundingClientRect().bottom + window.scrollY >= window.innerHeight - 1,
        };
    });
    expect(layout.overlapsFooter).toBe(false);
    expect(["fixed", "absolute"]).not.toContain(layout.footerPosition);
    expect(layout.fillsViewport).toBe(true);
}

async function expectBrandedAuthCard(page: Page) {
    await expect(page.locator(".pf-v5-c-login__main")).toBeVisible();
    expect(await page.locator(".pf-v5-c-login__main").evaluate(card => getComputedStyle(card).borderTopColor)).toBe("rgb(52, 134, 185)");
    expect(await page.locator(".pf-v5-c-login__main-header").evaluate(header => getComputedStyle(header).borderTopWidth)).toBe("0px");
    for (const footer of await page.locator(".pf-v5-c-login__main-footer-band").all()) {
        expect(await footer.evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
    }
}

async function expectReadableMobilePlanner(page: Page) {
    const dishTitle = page.locator(".smartmenu-dish__title").first();
    await expect(dishTitle).toBeVisible();
    await expect.poll(() => dishTitle.evaluate(title => title.getBoundingClientRect().width)).toBeGreaterThanOrEqual(150);
    await expect.poll(() => dishTitle.evaluate(title => title.getBoundingClientRect().height)).toBeLessThanOrEqual(80);
    const toolbarOverlaps = await page.locator(".menu-week-toolbar").evaluate(toolbar => {
        const dates = toolbar.querySelector(".menu-week-switcher")!.getBoundingClientRect();
        const actions = toolbar.querySelector(".menu-week-toolbar__actions")!.getBoundingClientRect();
        return dates.left < actions.right && dates.right > actions.left && dates.top < actions.bottom && dates.bottom > actions.top;
    });
    expect(toolbarOverlaps).toBe(false);
}

test("футер присутствует на всех страницах и не перекрывает содержимое", async ({page}) => {
    for (const width of [1280, 1000, 390]) {
        await page.setViewportSize({width, height: 844});
        for (const route of ["/", "/profile/recipes", "/profile/menu"]) {
            await page.goto(route, {waitUntil: "domcontentloaded"});
            await expectResponsiveLayout(page);
            const footer = page.locator(".page-footer");
            await footer.scrollIntoViewIfNeeded();
            await expect(footer.getByRole("link", {name: "Telegram", exact: true})).toBeVisible();
            await expect(footer.getByRole("link", {name: "YouTube", exact: true})).toBeVisible();
            await expect(footer.getByRole("link", {name: "VK", exact: true})).toBeVisible();
        }
    }
});

test("вход запускается из кнопки в шапке", async ({page}) => {
    const failedThemeResources: string[] = [];
    page.on("response", response => {
        if (response.url().includes("/smartmenu/") && response.status() >= 400) {
            failedThemeResources.push(`${response.status()} ${response.url()}`);
        }
    });
    await page.goto("/profile/menu", {waitUntil: "domcontentloaded"});
    await page.locator("header").getByRole("button", {name: "Войти"}).click({noWaitAfter: true});
    await expect(page).toHaveURL(/\/realms\/smartmenu\/protocol\/openid-connect\/auth/);
    await expect(page.locator("#username")).toBeVisible();
    await expectBrandedAuthCard(page);
    await expect(page.locator('link[href*="/smartmenu/css/smartmenu.css"]')).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('16px "Golos Text"'))).toBe(true);
    for (const width of [1280, 390]) {
        await page.setViewportSize({width, height: 844});
        await expect(page.locator("#username")).toBeVisible();
        await expect(page.locator("#password")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.getByRole("link", {name: /Register|Регистрация/i}).click();
    await expect(page.locator("#firstName")).toBeVisible();
    await expectBrandedAuthCard(page);
    await page.screenshot({path: ".local/refine-keycloak-registration-mobile.png", fullPage: true});
    await page.setViewportSize({width: 1280, height: 844});
    await page.screenshot({path: ".local/refine-keycloak-registration-desktop.png", fullPage: true});
    await page.getByRole("link", {name: /Back to Login|Назад ко входу|Вернуться ко входу/i}).click();
    await expect(page.locator("#username")).toBeVisible();
    await expectBrandedAuthCard(page);
    await page.screenshot({path: ".local/refine-keycloak-login-desktop.png", fullPage: true});
    await page.getByRole("link", {name: /Forgot Password|Забыли пароль/i}).click();
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.locator('link[href*="/smartmenu/css/smartmenu.css"]')).toHaveCount(1);
    expect(failedThemeResources).toEqual([]);
});

test("меню: компактные дни без дат, перенос названий и перетаскивание рецепта", async ({page}) => {
    const title = "E2E овощной суп с печёными овощами и длинным названием " + "Супердлинноенеразрывноеназвание".repeat(3);
    const weekdays = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
    await page.setViewportSize({width: 1280, height: 844});
    await register(page, uniqueEmail("refine"), "Refine");
    await page.getByRole("button", {name: "+ Добавить рецепт", exact: true}).click();
    await page.getByLabel("Название").fill(title);
    await page.getByLabel("Приготовление").fill("Приготовить.");
    await page.getByLabel("Свой ингредиент").check();
    await page.getByPlaceholder("Название ингредиента").fill("Овощи");
    await page.getByPlaceholder("Количество").first().fill("1");
    await page.getByRole("button", {name: "Создать рецепт"}).click();
    await expect(page.locator(".recipe-card").filter({hasText: title})).toBeVisible();
    await page.goto("/profile/menu", {waitUntil: "domcontentloaded"});
    await page.getByRole("button", {name: "Создать меню"}).first().click();
    const dialog = page.getByRole("dialog", {name: "Новое меню"});
    await dialog.getByLabel("Название меню").fill("Проверка дизайна");
    await dialog.getByRole("button", {name: "Подтвердить создание"}).click();
    await expect(dialog).toHaveCount(0);
    const monday = page.locator(".desktop-day").first();
    if (await monday.locator(".desktop-meal").count() === 0) {
        await monday.getByRole("button", {name: /^Добавить приём пищи в день/}).click();
    }
    const meal = monday.locator(".desktop-meal").first();
    await expect(meal).toBeVisible();
    await expect(page.locator(".desktop-meal__add")).toHaveCount(0);
    await expect(page.getByText(/нажмите\s*\+/i)).toHaveCount(0);
    await page.locator(".desktop-recipe-library__item").filter({hasText: title}).dragTo(meal);
    await expect(meal.locator(".desktop-dish__open")).toHaveText(title);
    await page.reload({waitUntil: "domcontentloaded"});
    await expect(meal.locator(".desktop-dish__open")).toHaveText(title);

    for (const width of [1280, 1000, 390]) {
        await page.setViewportSize({width, height: 844});
        await page.evaluate(() => window.scrollTo(0, 0));
        await expectResponsiveLayout(page);
        const headers = width > 1000 ? page.locator(".desktop-day__header")
            : width > 760 ? page.locator(".menu-accordion-day__summary") : page.locator(".menu-day-strip > button");
        await expect(headers).toHaveCount(7);
        for (let index = 0; index < weekdays.length; index++) {
            await expect(headers.nth(index)).toContainText(weekdays[index]);
            const headingText = await headers.nth(index).innerText();
            // Recipe titles occur in tablet summaries, so inspect only the day label.
            const dayLabel = width > 760 && width <= 1000 ? await headers.nth(index).locator("b").innerText() : headingText;
            expect(dayLabel).not.toMatch(/\d/);
            expect(await headers.nth(index).evaluate(header => header.getBoundingClientRect().height)).toBeLessThanOrEqual(48);
        }
        await expect(page.locator(".workspace__main time:visible")).toHaveCount(0);
        const gap = await page.evaluate(() => document.querySelector(".menu-workspace")!.getBoundingClientRect().top - document.querySelector(".page-header")!.getBoundingClientRect().bottom);
        expect(gap).toBeGreaterThanOrEqual(0);
        expect(gap).toBeLessThanOrEqual(24);
        const dishTitle = page.locator(width > 1000 ? ".desktop-dish__open" : ".smartmenu-dish__title").first();
        await expect(dishTitle).toHaveText(title);
        const titleLayout = await dishTitle.evaluate(element => {
            const box = element.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(element);
            const text = range.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {wrapped: box.height > parseFloat(style.lineHeight) * 1.5,
                textFits: text.left >= box.left - 1 && text.right <= box.right + 1 && text.bottom <= box.bottom + 1,
                clipped: element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1};
        });
        expect(titleLayout).toEqual({wrapped: true, textFits: true, clipped: false});
        await page.screenshot({path: `.local/refine-menu-${width}.png`, fullPage: true});
    }
});

test("основной сценарий рецепта, меню и списка покупок", async ({page}) => {
    await register(page, uniqueEmail("owner"), "Owner");

    await page.reload({waitUntil: "domcontentloaded"});
    await expect(page.locator("header").getByRole("button", {name: "Выйти"})).toBeVisible();

    await page.getByRole("button", {name: "+ Добавить рецепт", exact: true}).click();
    await page.getByLabel("Название").fill("E2E овощной суп");
    await page.getByLabel("Категория").fill("Супы");
    await page.getByLabel("Описание").fill("Рецепт для проверки SmartMenu");
    await page.getByLabel("Базовое число порций").fill("2");
    await page.getByLabel("Загрузить с компьютера").setInputFiles(path.resolve("public/img/recipes/pumpkin.jpg"));
    await page.getByLabel("Свой ингредиент").check();
    const ingredientName = page.getByPlaceholder("Название ингредиента");
    await ingredientName.fill("Тестовый овощ");
    await expect.poll(() => ingredientName.evaluate((input) => getComputedStyle(input).borderTopWidth)).toBe("1px");
    const addIngredientButton = page.getByRole("button", {name: "Добавить ингредиент"});
    await expect(addIngredientButton).toHaveText("+ Добавить ингредиент");
    expect(await page.locator(".recipe-form__ingredients").evaluate((section) => {
        const ingredient = section.querySelector(".recipe-form__ingredient:last-of-type");
        const button = section.querySelector(".recipe-form__add-ingredient");
        return Boolean(ingredient && button && (ingredient.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING));
    })).toBe(true);
    await page.getByPlaceholder("Количество").first().fill("100");
    await page.getByLabel("Приготовление").fill("Смешать и приготовить.");
    await page.getByRole("button", {name: "Создать рецепт"}).click();

    const ownCard = page.locator(".recipe-card").filter({hasText: "E2E овощной суп"}).first();
    await expect(ownCard).toBeVisible();
    const uploadedImage = ownCard.getByRole("img", {name: "E2E овощной суп"});
    await expect(uploadedImage).toHaveAttribute("src", /\/uploads\//);
    await expect.poll(() => uploadedImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await ownCard.getByRole("button", {name: "Состав →"}).click();
    await page.getByLabel("Порций").fill("4");
    await expect(page.getByText(/200 г/)).toBeVisible();
    await ownCard.getByLabel(/^Действия:/).click();
    await page.getByRole("menuitem", {name: "Редактировать"}).click();
    await page.getByLabel("Описание").fill("Обновлённое описание");
    await page.getByText("Фото по ссылке").click();
    await page.getByLabel("Ссылка на изображение").fill("http://127.0.0.1:9000/img/recipes/salad.png");
    await page.getByRole("button", {name: "Сохранить изменения"}).click();
    await ownCard.getByRole("button", {name: "Состав →"}).click();
    await expect(page.getByText("Обновлённое описание")).toBeVisible();
    await expect(ownCard.getByRole("img", {name: "E2E овощной суп"})).toHaveAttribute(
        "src",
        "http://127.0.0.1:9000/img/recipes/salad.png",
    );
    await ownCard.getByLabel(/^Действия:/).click();
    await page.getByRole("menuitem", {name: "Опубликовать"}).click();
    await expect(ownCard).toContainText("опубликован");

    // Legacy interaction coverage intentionally runs at the tablet breakpoint;
    // the desktop planner has its own compact column UI from 1001px.
    await page.setViewportSize({width: 1000, height: 720});
    await page.goto("/profile/menu", {waitUntil: "domcontentloaded"});
    await expect(page.getByLabel("Название меню")).toHaveCount(0);
    await page.getByRole("button", {name: "Создать меню"}).first().click();
    const createMenuDialog = page.getByRole("dialog", {name: "Новое меню"});
    await createMenuDialog.getByLabel("Название меню").fill("E2E неделя");
    const confirmMenuCreation = createMenuDialog.getByRole("button", {name: "Подтвердить создание"});
    await expect(confirmMenuCreation).toBeEnabled();
    await confirmMenuCreation.click({force: true});
    await expect(createMenuDialog).toHaveCount(0);
    await page.locator(".menu-description-disclosure > summary").click();
    const descriptionPanel = page.locator(".smartmenu-menu-description");
    await descriptionPanel.getByLabel("Описание меню").fill("Проверочная неделя с овощными блюдами");
    await descriptionPanel.getByRole("button", {name: "Сохранить описание"}).click();

    const monday = page.locator(".smartmenu-day").first();
    const firstMeal = monday.locator(".smartmenu-meal").filter({hasText: "Завтрак"});
    if (await firstMeal.count() === 0) {
        await monday.getByLabel("Приём пищи для Понедельник").selectOption({label: "Завтрак"});
        await monday.getByRole("button", {name: "Добавить приём пищи", exact: true}).click();
    }
    await firstMeal.getByRole("button", {name: "Выбрать блюдо"}).click();
    await page.getByRole("button", {name: "Добавить блюдо: E2E овощной суп"}).first().click();
    await firstMeal.getByRole("spinbutton", {name: "Порции: E2E овощной суп", exact: true}).fill("3");
    await expect(firstMeal.getByRole("button", {name: "E2E овощной суп", exact: true})).toBeVisible();
    await page.setViewportSize({width: 1280, height: 720});
    await expect(page.locator(".desktop-dish")).toBeVisible();
    await expect(page.locator(".desktop-dish img")).toHaveCount(0);
    await expect(page.locator(".desktop-recipe-library__item img").first()).toBeVisible();
    await page.screenshot({path: ".local/menu-desktop-verified.png", fullPage: true});
    await page.setViewportSize({width: 390, height: 844});
    const mobileSidebarClose = page.getByRole("button", {name: "Закрыть боковую панель"});
    if (await mobileSidebarClose.isVisible()) await mobileSidebarClose.click();
    await expectReadableMobilePlanner(page);
    await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
    await expect(firstMeal.getByRole("checkbox", {name: /^Учитывать в покупках:/})).toBeChecked();
    await expectReadableMobilePlanner(page);
    await page.locator(".menu-week-toolbar").getByRole("button", {name: "Отмена", exact: true}).click();
    await page.screenshot({path: ".local/menu-mobile-verified.png", fullPage: true});
    await page.setViewportSize({width: 1000, height: 720});
    await firstMeal.getByRole("button", {name: "E2E овощной суп", exact: true}).click();
    const recipeDialog = page.getByRole("dialog");
    await expect(recipeDialog.getByText("3 порц.")).toBeVisible();
    await expect(recipeDialog.getByText(/150 г/)).toBeVisible();
    await recipeDialog.getByRole("button", {name: "Закрыть"}).click();

    await monday.getByLabel("Комментарий к дню").fill("Подготовить овощи вечером");
    await monday.getByRole("button", {name: "Сохранить комментарий"}).click();
    await expect(firstMeal.getByRole("checkbox", {name: /^Учитывать в покупках:/})).toHaveCount(0);
    await firstMeal.getByRole("button", {name: "+ продукт", exact: true}).click();
    await expect(firstMeal.locator(".smartmenu-extra-disclosure > summary")).toHaveCount(0);
    const commonProductSelect = firstMeal.getByLabel("Дополнительный продукт для Завтрак");
    await expect.poll(() => commonProductSelect.locator("option").count()).toBeGreaterThan(1);
    const commonProductName = (await commonProductSelect.locator("option").nth(1).textContent())!;
    await commonProductSelect.selectOption({index: 1});
    await firstMeal.getByLabel("Количество дополнительного продукта для Завтрак").fill("2");
    await firstMeal.getByRole("button", {name: "Добавить продукт"}).click();
    await expect(firstMeal.locator(".smartmenu-menu-item--extra").filter({hasText: commonProductName})).toBeVisible();

    await firstMeal.getByRole("button", {name: "+ продукт", exact: true}).click();
    await firstMeal.getByLabel("Свой продукт").check();
    await firstMeal.getByLabel("Название своего продукта для Завтрак").fill("Хлеб");
    await firstMeal.getByLabel("Количество дополнительного продукта для Завтрак").fill("1");
    await firstMeal.getByRole("button", {name: "Добавить продукт"}).click();
    await expect(firstMeal.getByText(/Хлеб/)).toBeVisible();
    const breadRow = firstMeal.locator(".smartmenu-menu-item--extra").filter({hasText: "Хлеб"});
    await expect(breadRow.getByRole("checkbox")).toHaveCount(0);
    await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
    const breadCheckbox = breadRow.getByRole("checkbox");
    await expect(breadCheckbox).toBeChecked();
    await expect(firstMeal.getByRole("checkbox", {name: "Учитывать в покупках: E2E овощной суп"})).toBeChecked();
    await breadCheckbox.click();
    await expect(breadCheckbox).not.toBeChecked();
    await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
    await expect(page.locator('input[value="Тестовый овощ"]')).toBeVisible();
    await expect(firstMeal.getByRole("checkbox", {name: /^Учитывать в покупках:/})).toHaveCount(0);
    const commonShoppingInput = page.locator(`input[value="${commonProductName}"]`);
    await expect(commonShoppingInput).toBeVisible();
    await expect.poll(() => commonShoppingInput.evaluate((input) => getComputedStyle(input).borderTopWidth)).toBe("1px");
    await expect(page.locator('input[value="Хлеб"]')).toHaveCount(0);

    await page.getByPlaceholder("Добавить вручную").fill("Салфетки");
    await page.locator(".smartmenu-inline-form").last().getByRole("button", {name: "Добавить"}).click();
    await page.getByRole("button", {name: "Сохранить изменения"}).click();
    await expect(page.locator('input[value="Салфетки"]')).toBeVisible();

    await page.getByRole("button", {name: "Рассчитать заново", exact: true}).click();
    await expect(breadCheckbox).toBeChecked();
    page.once("dialog", (dialog) => void dialog.accept());
    await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
    await expect(page.locator('input[value="Салфетки"]')).toHaveCount(0);
    await expect(page.locator('input[value="Хлеб"]')).toBeVisible();

    await page.reload({waitUntil: "domcontentloaded"});
    await expect(page.getByLabel("Описание меню")).toHaveValue("Проверочная неделя с овощными блюдами");
    const reloadedMonday = page.locator(".smartmenu-day").first();
    await expect(reloadedMonday.getByLabel("Комментарий к дню")).toHaveValue("Подготовить овощи вечером");
    await expectResponsiveLayout(page);
    await page.setViewportSize({width: 1280, height: 720});
    await expect(page.locator(".desktop-menu")).toBeVisible();
    await expect(page.locator(".desktop-menu__grid .desktop-day")).toHaveCount(7);
    await expect(page.locator(".desktop-recipe-library")).toBeVisible();
    await expectResponsiveLayout(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({path: ".local/menu-desktop-verified.png", fullPage: true});
    const desktopMonday = page.locator(".desktop-day").first();
    const desktopDish = desktopMonday.locator(".desktop-dish").first();
    await expect(desktopDish.getByRole("checkbox")).toHaveCount(0);
    await desktopDish.getByRole("button", {name: "Увеличить порции"}).click();
    await expect(desktopDish.locator(".desktop-stepper > span")).toHaveText("4");
    await desktopDish.getByRole("button", {name: "Уменьшить порции"}).click();
    await expect(desktopDish.locator(".desktop-stepper > span")).toHaveText("3");
    const removePosition = await desktopDish.evaluate((dish) => {
        const card = dish.getBoundingClientRect();
        const remove = dish.querySelector(".desktop-dish__remove")!.getBoundingClientRect();
        return {top: remove.top - card.top, right: card.right - remove.right};
    });
    expect(removePosition.top).toBeGreaterThanOrEqual(0);
    expect(removePosition.top).toBeLessThanOrEqual(8);
    expect(removePosition.right).toBeGreaterThanOrEqual(0);
    expect(removePosition.right).toBeLessThanOrEqual(8);
    const addMeal = desktopMonday.getByRole("button", {name: /^Добавить приём пищи в день/});
    const mealCount = await desktopMonday.locator(".desktop-meal").count();
    await addMeal.click();
    await expect(desktopMonday.locator(".desktop-meal")).toHaveCount(mealCount + 1);
    const mealLayout = await desktopMonday.evaluate((day) => ({
        addTop: day.querySelector(".desktop-day__add-meal")!.getBoundingClientRect().top,
        mealsBottom: day.querySelector(".desktop-day__meals")!.getBoundingClientRect().bottom,
    }));
    expect(mealLayout.addTop).toBeGreaterThanOrEqual(mealLayout.mealsBottom - 1);

    // Shopping selection starts with every item in every day, including a day
    // other than the currently opened Monday in the tablet/mobile planner.
    const desktopTuesday = page.locator(".desktop-day").nth(1);
    const tuesdayMeal = desktopTuesday.locator(".desktop-meal").first();
    if (await tuesdayMeal.count() === 0) {
        await desktopTuesday.getByRole("button", {name: /^Добавить приём пищи в день/}).click();
    }
    await tuesdayMeal.getByRole("button", {name: "+ продукт", exact: true}).click();
    await tuesdayMeal.getByLabel("Название продукта для Завтрак").fill("Продукт вторника");
    await tuesdayMeal.getByLabel("Количество продукта для Завтрак").fill("2");
    await tuesdayMeal.getByRole("button", {name: "Добавить продукт в Завтрак", exact: true}).click();
    await expect(tuesdayMeal.getByText("Продукт вторника 2 шт", {exact: true})).toBeVisible();
    await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
    const weekCheckboxes = page.locator(".desktop-menu").getByRole("checkbox", {name: /^Учитывать в покупках:/});
    await expect(weekCheckboxes).toHaveCount(4);
    for (const checkbox of await weekCheckboxes.all()) await expect(checkbox).toBeChecked();
    await tuesdayMeal.getByRole("checkbox", {name: "Учитывать в покупках: Продукт вторника"}).uncheck();
    await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
    await expect(weekCheckboxes).toHaveCount(0);
    await expect(page.locator('input[value="Продукт вторника"]')).toHaveCount(0);
    await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
    await expect(tuesdayMeal.getByRole("checkbox", {name: "Учитывать в покупках: Продукт вторника"})).toBeChecked();
    let releasePatch!: () => void;
    let markPatchStarted!: () => void;
    const patchGate = new Promise<void>(resolve => { releasePatch = resolve; });
    const patchStarted = new Promise<void>(resolve => { markPatchStarted = resolve; });
    const menuPatchUrl = /\/api\/menus\/\d+$/;
    await page.route(menuPatchUrl, async route => {
        if (route.request().method() === "PATCH") {
            markPatchStarted();
            await patchGate;
        }
        await route.continue();
    });
    try {
        await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
        await patchStarted;
        await expect(desktopDish.getByRole("button", {name: "Увеличить порции"})).toBeDisabled();
        await expect(page.getByLabel("Выбранное меню")).toBeDisabled();
        await expect(addMeal).toBeDisabled();
    } finally {
        releasePatch();
    }
    await expect(page.locator('input[value="Продукт вторника"]')).toBeVisible();
    await page.unroute(menuPatchUrl);
    await page.locator(".workspace__main").getByRole("button", {name: /Рассчитать список/}).click();
    await tuesdayMeal.getByRole("checkbox", {name: "Учитывать в покупках: Продукт вторника"}).uncheck();
    await page.locator(".desktop-menu__actions").getByRole("button", {name: "Отмена", exact: true}).click();
    await expect(weekCheckboxes).toHaveCount(0);
    await expect(page.locator('input[value="Продукт вторника"]')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({path: ".local/menu-desktop-verified.png", fullPage: true});
    await page.setViewportSize({width: 390, height: 844});
    await expectResponsiveLayout(page);
    await expectReadableMobilePlanner(page);
    await reloadedMonday.scrollIntoViewIfNeeded();
    await page.getByRole("button", {name: "Открыть список покупок"}).click();
    await expect(page.getByRole("dialog", {name: "Список покупок"})).toBeVisible();
    await page.getByRole("button", {name: "Закрыть боковую панель"}).click();
    await page.dispatchEvent("body", "touchstart", {touches: [{identifier: 1, clientX: 389, clientY: 400}]});
    await page.dispatchEvent("body", "touchend", {changedTouches: [{identifier: 1, clientX: 280, clientY: 400}]});
    await expect(page.getByRole("dialog", {name: "Список покупок"})).toBeVisible();
    await page.getByRole("button", {name: "Закрыть боковую панель"}).click();
    await expect(reloadedMonday).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({path: ".local/menu-mobile-verified.png", fullPage: true});
    await reloadedMonday.scrollIntoViewIfNeeded();
    await page.setViewportSize({width: 1280, height: 720});
    await desktopDish.getByRole("button", {name: "Удалить блюдо: E2E овощной суп"}).click();
    await expect(desktopMonday.locator(".desktop-dish")).toHaveCount(0);

    await page.goto("/profile/recipes", {waitUntil: "domcontentloaded"});
    const updatedCard = page.locator(".recipe-card").filter({hasText: "E2E овощной суп"}).first();
    await updatedCard.getByLabel(/^Действия:/).click();
    await page.getByRole("menuitem", {name: "Снять с публикации"}).click();
    await expect(updatedCard).not.toContainText("опубликован");
});

test("сохранение опубликованного рецепта и создание своей копии", async ({browser}) => {
    const ownerPage = await browser.newPage();
    await register(ownerPage, uniqueEmail("publisher"), "Publisher");
    await ownerPage.getByRole("button", {name: "+ Добавить рецепт", exact: true}).click();
    await ownerPage.getByLabel("Название").fill("E2E опубликованный рецепт");
    await ownerPage.getByLabel("Описание").fill("Для второго пользователя");
    await ownerPage.getByLabel("Приготовление").fill("Приготовить.");
    await ownerPage.getByLabel("Свой ингредиент").check();
    await ownerPage.getByPlaceholder("Название ингредиента").fill("Продукт");
    await ownerPage.getByPlaceholder("Количество").first().fill("1");
    await ownerPage.getByRole("button", {name: "Создать рецепт"}).click();
    const published = ownerPage.locator(".recipe-card").filter({hasText: "E2E опубликованный рецепт"}).first();
    await published.getByLabel(/^Действия:/).click();
    await ownerPage.getByRole("menuitem", {name: "Опубликовать"}).click();

    const readerPage = await browser.newPage();
    await register(readerPage, uniqueEmail("reader"), "Reader");
    const catalogCard = readerPage.locator(".recipe-card").filter({hasText: "E2E опубликованный рецепт"}).last();
    await catalogCard.getByRole("button", {name: "В мои рецепты"}).click();
    const savedCard = readerPage.locator(".recipe-card").filter({hasText: "E2E опубликованный рецепт"}).first();
    await expect(savedCard).toBeVisible();
    const savedAfterClone = readerPage.locator(".recipe-card").filter({hasText: "Сохранённый рецепт"}).first();
    await savedAfterClone.getByLabel(/^Действия:/).click();
    await readerPage.getByRole("menuitem", {name: "Создать свою копию"}).click();
    await expect(readerPage.getByText("E2E опубликованный рецепт (копия)").first()).toBeVisible();
    await savedAfterClone.getByLabel(/^Действия:/).click();
    await readerPage.getByRole("menuitem", {name: "Удалить из моих"}).click();
    await expect(readerPage.getByText("Сохранённый рецепт")).toHaveCount(0);
});

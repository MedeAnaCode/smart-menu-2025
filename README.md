# PlanDish

PlanDish — fullstack-приложение для хранения и публикации рецептов, планирования недельных меню и формирования списков покупок.

## Стек

- Frontend: React 18, TypeScript, React Router, Redux Toolkit Query, React Hook Form, Zod, Webpack, SCSS.
- Backend: Node.js, Express, Sequelize, Zod.
- Авторизация: Keycloak, Authorization Code Flow с PKCE.
- База данных: PostgreSQL.
- Инфраструктура: Docker Compose, постоянные volumes для БД, Keycloak и изображений.
- Тестирование: Vitest и Playwright.

## Запуск через Docker

Создайте в корне проекта файл `.env`:

```dotenv
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=<надежный-локальный-пароль>
```

Запустите сервисы:

```bash
docker compose up --build
```

После запуска доступны:

- frontend-приложение: [http://localhost:9000](http://localhost:9000);
- альтернативный локальный адрес приложения: `http://127.0.0.1:9000`;
- backend API: `http://localhost:3001`;
- Keycloak: `http://localhost:8080`;
- консоль администратора Keycloak: `http://localhost:8080/admin`.

Realm `smartmenu` и публичный SPA-клиент `smartmenu-web` импортируются из `infra/keycloak/smartmenu-realm.json` при первом запуске на пустом Keycloak volume. Регистрация пользователей включена на странице входа.

Keycloak запускается командой `start-dev` и предназначен только для локальной разработки.

### Фирменная тема авторизации

Нативная login-тема `smartmenu` находится в `infra/keycloak/themes/smartmenu` и
наследует шаблоны `keycloak.v2` версии 26.7.0. Общие стили применяются к входу,
регистрации, восстановлению пароля и другим экранам авторизации. Формы и обработка
паролей остаются штатными Keycloak. Шрифты и логотип монтируются из `public` в
ресурсы темы через Docker Compose, внешние CDN не нужны.

Для существующего окружения выполните `docker compose up -d --no-deps keycloak`,
затем в консоли Keycloak выберите realm `smartmenu` → Realm settings → Themes →
Login theme → `smartmenu` → Save. Импорт при запуске не обновляет существующий
realm. Там же в Realm settings → General укажите Display name: `PlanDish`, а в
Clients → `smartmenu-web` укажите Name: `PlanDish Web`. Для нового окружения эти
значения уже указаны в `smartmenu-realm.json`.

После изменения CSS при необходимости перезапустите Keycloak и обновите страницу
без кеша. При установке вне Compose скопируйте каталог темы в
`/opt/keycloak/themes/smartmenu`, файлы `public/fonts` в `login/resources/fonts`,
а `public/img/icons` — в `login/resources/img`.
При обновлении Keycloak проверяйте вход, регистрацию и восстановление пароля:
собственные стили используют классы родительской темы.

## Личные данные, резервные копии и миграции

Ваши рецепты, планы меню и списки покупок хранятся в PostgreSQL, а не в
исходном коде или E2E-тестах. Файлы загруженных фотографий хранятся отдельно.
При обычных `docker compose stop`, `docker compose down`, пересборке образов и
изменении кода Docker сохраняет эти данные в именованных томах:

- `db_data` — рецепты, ингредиенты, меню и списки покупок;
- `uploads_data` — загруженные вами фотографии;
- `keycloak_data` — учётная запись, через которую личные рецепты связаны с вами.

Для повседневной работы используйте только обычный стек `docker compose up
--build` и входите в одну и ту же учётную запись. Не запускайте для него
`docker compose down -v` и не удаляйте эти три тома: ключ `-v` стирает данные.
Перед существенными экспериментами имеет смысл выгрузить базу в файл:

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
docker compose exec -T db pg_dump -U Nastya postgres > backups/smartmenu-backup.sql
```

Папка `backups/` намеренно не добавлена в git: это личные данные, а не часть
проекта. Для полноценного восстановления также сохраните копии Docker-томов
`uploads_data` и `keycloak_data` либо не удаляйте их.

### E2E-тесты без затрагивания личных рецептов

Обычная команда `npm run test:e2e` подключается к уже запущенному приложению,
поэтому раньше тестовые рецепты могли появляться в общем каталоге. Для работы
над проектом запускайте изолированную команду:

```bash
npm run test:e2e:isolated
```

Она создаёт временный Compose-проект `smartmenu-e2e` на портах 9100, 3101,
8180 и 5433, выполняет тесты, а затем удаляет только его тестовые тома. Ваш
обычный стек на портах 9000, 3001, 8080 и 5432 и его данные не затрагиваются.

## Миграции

При старте backend:

1. Sequelize создаёт отсутствующие таблицы без изменения существующих;
2. migration runner последовательно применяет новые SQL-файлы из `docs/migrations`;
3. применённые файлы фиксируются в таблице `schema_migrations`.

Миграции PlanDish v2:

```text
docs/migrations/2026-07-28-smartmenu-v2.sql
docs/migrations/2026-07-29-normalized-ingredients-keycloak.sql
docs/migrations/2026-08-04-menu-descriptions.sql
```

Старые применённые миграции не редактировались. Изображения рецептов сохраняются вне основной таблицы БД в Docker volume `uploads_data`, а в рецепте хранится URL файла.

## Локальная разработка

Установите зависимости:

```bash
npm ci
```

Основные команды:

```bash
npm run dev
npm run dev:api
npm run seed:ifempty
```

Для локального запуска backend без Docker необходимо задать параметры PostgreSQL, Keycloak и каталог миграций переменными окружения, перечисленными в `docker-compose.yml`.

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
npm run test:unit
npm run test:e2e:isolated
```

`npm run test:e2e:isolated` самостоятельно поднимает и удаляет отдельный
тестовый Compose stack. Команда `npm run test:e2e` оставлена для отладки
уже запущенного стенда; не используйте её для вашего личного окружения.

# Smart Menu

SmartMenu - fullstack-приложение для хранения и публикации рецептов, планирования недельных меню и формирования списков покупок.

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

## Данные и миграции

При старте backend:

1. Sequelize создаёт отсутствующие таблицы без изменения существующих;
2. migration runner последовательно применяет новые SQL-файлы из `docs/migrations`;
3. применённые файлы фиксируются в таблице `schema_migrations`.

Миграции SmartMenu v2:

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
npm run test:e2e
```

E2E-тесты ожидают запущенный Docker Compose stack на портах `9000`, `3001` и `8080`. По умолчанию Playwright открывает приложение через `http://127.0.0.1:9000`, чтобы избежать системных различий разрешения `localhost`, и использует установленный Google Chrome.

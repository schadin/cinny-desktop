# AGENTS.md — Cinny Desktop

## Обзор

**Cinny Desktop** — это десктопный клиент для протокола Matrix (матрикс-чат), построенный на фреймворке **Tauri v2**. Представляет собой обёртку вокруг веб-приложения [Cinny](https://github.com/cinnyapp/cinny) (React/TypeScript), которая добавляет нативные возможности: системные уведомления, буфер обмена, глобальные горячие клавиши, автозапуск, автообновление и т.д.

- **Автор:** Ajay Bura (ajbura)
- **Лицензия:** AGPL-3.0-only
- **Репозиторий:** https://github.com/cinnyapp/cinny-desktop
- **Сайт:** https://cinny.in

---

## Структура проекта

```
cinny-desktop/
├── cinny/                      # Git-подмодуль: веб-клиент Cinny (React + Vite)
│   ├── src/                    # Исходники React-приложения
│   ├── public/                 # Статические ресурсы
│   ├── config.json             # Конфигурация: homeserver, сообщества
│   ├── package.json            # Зависимости фронтенда
│   └── vite.config.js          # Конфиг Vite
├── src-tauri/                  # Tauri v2 (Rust) — десктопная обёртка
│   ├── src/
│   │   ├── main.rs             # Точка входа
│   │   ├── lib.rs              # Основная логика приложения (setup, updater, окно)
│   │   └── menu.rs             # Нативное меню macOS (закомментировано)
│   ├── capabilities/           # Tauri v2 capability-based permissions
│   │   ├── desktop.json        # Разрешения для глобальных шорткатов
│   │   └── migrated.json       # Разрешения, мигрированные из Tauri v1
│   ├── icons/                  # Иконки приложения (PNG, ICO, ICNS)
│   ├── wix/                    # Баннеры для WiX (Windows Installer)
│   ├── Cargo.toml              # Rust-зависимости и фичи
│   ├── tauri.conf.json         # Конфигурация Tauri
│   └── build.rs                # Сборочный скрипт Tauri
├── scripts/
│   ├── release.mjs             # Создание release.json для автообновлений
│   └── update-version.mjs      # Обновление версии во всех файлах (npm, Cargo, tauri.conf)
├── .github/
│   ├── workflows/
│   │   ├── tauri.yml           # Сборка и публикация релизов (Windows, Linux, macOS)
│   │   ├── tauri2.yml          # Релиз без встроенного апдейтера
│   │   ├── test.yml            # Сборка PR (проверка, что собирается)
│   │   ├── archive.yml         # ZIP-архив исходников в релизе
│   │   ├── cla.yml             # CLA Assistant
│   │   ├── lockfile.yml        # Проверка изменений package-lock.json
│   │   └── pr-title.yml        # Проверка conventional commit в заголовках PR
│   ├── ISSUE_TEMPLATE/
│   │   └── config.yml          # Перенаправление на discussions
│   ├── dependabot.yml          # Автообновление GitHub Actions (npm/cargo — закомментированы)
│   ├── renovate.json           # Renovate для lock-файлов
│   └── FUNDING.yml             # Ссылки на спонсорство
├── config.json                 # Общая конфигурация (homeserver, communities)
├── package.json                # Корневые npm-скрипты и зависимости (Tauri CLI)
├── 0001-disable-tauri-updater.patch  # Патч для отключения встроенного апдейтера
├── .node-version               # Node.js 24.13.1
└── README.md                   # Основная документация
```

---

## Технологический стек

### Бэкенд (Rust)
| Компонент | Версия | Описание |
|-----------|--------|----------|
| Tauri | 2.11.2 | Основной фреймворк |
| tauri-plugin-localhost | 2.3.2 | Сервер для раздачи фронтенда на порту 44548 (release) |
| tauri-plugin-window-state | 2.4.1 | Сохранение позиции/размера окна |
| tauri-plugin-clipboard-manager | 2.3.2 | Буфер обмена |
| tauri-plugin-notification | 2.3.3 | Уведомления |
| tauri-plugin-fs | 2.5.1 | Работа с файловой системой |
| tauri-plugin-shell | 2.3.5 | Запуск внешних команд |
| tauri-plugin-http | 2.5.9 | HTTP-запросы из webview |
| tauri-plugin-process | 2.3.1 | Управление процессом |
| tauri-plugin-os | 2.3.2 | Информация об ОС |
| tauri-plugin-opener | 2.5.4 | Открытие ссылок в браузере |
| tauri-plugin-dialog | 2.7.1 | Системные диалоги |
| tauri-plugin-global-shortcut | 2.3.2 | Глобальные горячие клавиши (desktop only) |
| tauri-plugin-updater | 2.10.1 | Встроенное автообновление (опционально, feature `updater`) |

### Фронтенд (Web App — подмодуль cinny)
| Компонент | Версия | Описание |
|-----------|--------|----------|
| React | 18.2.0 | UI-библиотека |
| TypeScript | 4.9.4 | Типизация |
| Vite | 5.4.19 | Сборщик |
| matrix-js-sdk | 41.7.0 | Matrix SDK (в процессе замены на собственный) |
| vanilla-extract | 1.9.3 | CSS-фреймворк (zero-runtime CSS-in-JS) |
| react-router-dom | 6.30.3 | Маршрутизация |
| TanStack React Query | 5.24.1 | Управление состоянием/запросами |
| i18next | 23.12.2 | Интернационализация |
| Zustand (через jotai) | 2.6.0 | Состояние (jotai) |

---

## Сборочная система и скрипты

Корневые npm-скрипты (`package.json`):

| Команда | Описание |
|---------|----------|
| `npm run tauri dev` | Запуск в режиме разработки (HMR на http://localhost:8080) |
| `npm run tauri build` | Продакшен-сборка |
| `npm run release` | Создание `release.json` для апдейтера (CI) |
| `npm run bump <version>` | Обновление версии во всех файлах |

**Процесс сборки:**
1. `beforeBuildCommand` / `beforeDevCommand`: сборка/запуск фронтенда (`cd cinny && npm run build` / `npm start`)
2. Tauri компилирует Rust-бэкенд и упаковывает фронтенд (`cinny/dist`) в нативный бинарник
3. В release-режиме `tauri-plugin-localhost` раздаёт статику с порта 44548

**Обновление версии (`npm run bump <version>`):**
- `package.json` (npm)
- `src-tauri/Cargo.toml` (Rust)
- `src-tauri/Cargo.lock` (через `cargo update`)
- `src-tauri/tauri.conf.json` (Tauri)
- Подмодуль `cinny` обновляется до последнего тега

---

## CI/CD (GitHub Actions)

### `tauri.yml` — Публикация релиза
Срабатывает при публикации GitHub Release. Собирает нативные бинарники для трёх платформ:
- **Windows** (MSI) — `windows-latest`
- **Linux** (deb + AppImage) — `ubuntu-22.04`
- **macOS** (DMG + app.tar.gz, universal binary) — `macos-latest`

Финальный шаг `release-update` загружает `release.json` для встроенного апдейтера.

### `tauri2.yml` — Релиз без апдейтера
То же самое, но применяет патч `0001-disable-tauri-updater.patch` (отключает фичу `updater`).

### `test.yml` — Проверка PR
Собирает приложение для всех трёх платформ на каждый PR (без создания релиза).

### Остальные workflows
- `archive.yml` — добавляет ZIP-архив исходников в релиз
- `cla.yml` — проверка подписания CLA
- `lockfile.yml` — визуализация изменений в package-lock.json
- `pr-title.yml` — проверка conventional commit

---

## Особенности архитектуры

### 1. Два режима работы
- **Dev** (`tauri dev`): фронтенд на Vite dev server (HMR), порт 8080
- **Release** (`tauri build`): статика из `cinny/dist` раздаётся через `tauri-plugin-localhost` на порту 44548

### 2. Автообновление (опционально)
- Фича `updater` в Cargo.toml
- В `lib.rs` при запуске проверяет наличие обновлений, показывает диалог
- `release.json` формируется скриптом `scripts/release.mjs` по тегам релизов
- Патч `0001-disable-tauri-updater.patch` отключает фичу для сборки без апдейтера

### 3. Прокси localhost
В `lib.rs` при старте гарантируется, что `localhost` и `127.0.0.1` есть в `NO_PROXY` — это критично для работы embedded-сервера в корпоративных сетях с прокси.

### 4. Безопасность (CSP)
Достаточно разрешительный CSP в `tauri.conf.json`:
```
connect-src 'self' blob: ipc: ws: wss: http: https: http://ipc.localhost
script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: ...
```

### 5. Разрешения (Tauri v2 capabilities)
- `desktop.json` — глобальные шорткаты
- `migrated.json` — все остальные разрешения, мигрированные из Tauri v1 (FS, окна, диалоги, HTTP, уведомления, буфер обмена, opener и т.д.)

### 6. Нативное меню macOS
В `menu.rs` описано меню для macOS (Cinny, Edit, View, Window). Закомментировано в `lib.rs` — вероятно из-за конфликтов с веб-рендерингом.

### 7. Подмодуль cinny
Версия веб-клиента фиксируется через git submodule. При сборке всегда используется та версия, которая записана в `.gitmodules`. Скрипт `update-version.mjs` при бампе версии переключает подмодуль на последний тег.

### 8. Версионирование
Версия приложения синхронизирована: `npm`, `Cargo.toml`, `tauri.conf.json` — все используют одинаковую версию (на момент написания 4.12.5).

---

## Разработка

### Требования
- Node.js >= 16 (используется 24.13.1 согласно `.node-version`)
- Rust (stable)
- Системные зависимости Tauri: [Prerequisites](https://v2.tauri.app/start/prerequisites/)

### Локальный запуск
```bash
git clone --recursive https://github.com/cinnyapp/cinny-desktop.git
cd cinny-desktop/cinny
npm ci
cd ..
npm ci
npm run tauri dev     # разработка с HMR
npm run tauri build   # продакшен-сборка
```
---

## Правила разработки

### Задачи (tasks/)

1. Все доработки описываются в файлах `tasks/TK-XXXXX.md`, где `XXXXX` — сквозной номер с лидирующими нулями (например, `TK-00001`).
2. Файл задачи содержит:
   - **Описание** — что и зачем делается
   - **План реализации** — шаги, компоненты, файлы
   - **Изменения по ходу** — если в процессе работы план меняется, это фиксируется в том же файле
3. После завершения задачи коммит делается только после подтверждения пользователем.

### Версионирование

1. Версию приложения изменять **только по явной команде пользователя** (`npm run bump <version>`). Самостоятельно поднимать версию нельзя.

### Ветки и публикация

1. Основная ветка разработки — `customize`.
2. **Push никогда не выполнять** — все изменения остаются локально до явного указания пользователя.

### ROADMAP.md

1. Все планируемые доработки фиксируются в `ROADMAP.md` со ссылками на файлы из `tasks/`.
2. Записи группируются по функциональности.
3. После реализации запись из `ROADMAP.md` удаляется.

### CHANGES.md

1. Все реализованные доработки фиксируются в `CHANGES.md` со ссылками на файлы из `tasks/`.
2. Записи группируются по функциональности.

---

## Полезные ссылки

- [Cinny Desktop releases](https://github.com/cinnyapp/cinny-desktop/releases)
- [Cinny Web App](https://app.cinny.in/)
- [Tauri v2 Documentation](https://v2.tauri.app/)
- [Matrix protocol](https://matrix.org/)
- [Flathub: in.cinny.Cinny](https://flathub.org/apps/details/in.cinny.Cinny)

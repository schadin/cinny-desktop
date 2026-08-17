# AGENTS.md — Cinny Desktop

## Обзор

**Cinny Desktop** — это десктопный клиент для протокола Matrix (матрикс-чат), построенный на фреймворке **Tauri v2**. Представляет собой обёртку вокруг веб-приложения [Cinny](https://github.com/cinnyapp/cinny) (React/TypeScript), которая добавляет нативные возможности: системные уведомления, буфер обмена, глобальные горячие клавиши, автозапуск и т.д.

- **Автор:** Ajay Bura (ajbura)
- **Лицензия:** AGPL-3.0-only
- **Репозиторий:** https://github.com/schadin/harrier-desktop
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
│   │   ├── lib.rs              # Основная логика приложения (setup, окно)
│   │   │                       # migrate.rs — миграция настроек cinny → harrier
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
│   ├── rebrand.mjs             # Применение/откат ребрендинга (0002-rebrand-harrier.patch + логотип)
│   └── update-version.mjs      # Обновление версии во всех файлах (npm, Cargo, tauri.conf)
├── .github/
│   ├── workflows/
│   │   ├── tauri.yml           # Сборка и публикация релизов (Windows, Linux, macOS)
│   │   ├── test.yml            # Сборка PR (проверка, что собирается)
│   │   ├── archive.yml         # ZIP-архив исходников в релизе
│   │   ├── lockfile.yml        # Проверка изменений package-lock.json
│   │   └── pr-title.yml        # Проверка conventional commit в заголовках PR
│   ├── dependabot.yml          # Автообновление GitHub Actions (npm/cargo — закомментированы)
│   └── renovate.json           # Renovate для lock-файлов
├── config.json                 # Общая конфигурация (homeserver, communities)
├── package.json                # Корневые npm-скрипты и зависимости (Tauri CLI)
├── assets/                     # Исходники логотипа/иконки Harrier (harrier.svg, harrier.png)
├── 0002-rebrand-harrier.patch  # Патч ребрендинга подмодуля cinny (применяется при сборке)
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

### `test.yml` — Проверка PR
Собирает приложение для всех трёх платформ на каждый PR (без создания релиза).

### Остальные workflows
- `archive.yml` — добавляет ZIP-архив исходников в релиз
- `lockfile.yml` — визуализация изменений в package-lock.json
- `pr-title.yml` — проверка conventional commit

---

## Особенности архитектуры

### 1. Два режима работы
- **Dev** (`tauri dev`): фронтенд на Vite dev server (HMR), порт 8080
- **Release** (`tauri build`): статика из `cinny/dist` раздаётся через `tauri-plugin-localhost` на порту 44548

### 2. Ребрендинг при сборке
- Изменения фронтенда (About/Welcome, index.html) применяются патчем `0002-rebrand-harrier.patch` через `scripts/rebrand.mjs` (`rebrand:apply`/`rebrand:revert`) и откатываются после сборки — подмодуль `cinny` остаётся в upstream-состоянии
- Логотип `assets/harrier.svg` копируется в `cinny/public/res/svg/` при apply
- `beforeBuildCommand`: apply → build → revert; `beforeDevCommand`: apply (revert вручную после dev-сессии)
- Автообновление удалено: плагин updater, ключи подписи и release.json не используются

### 3. Миграция настроек cinny → harrier
`src-tauri/src/migrate.rs` при первом старте копирует (не перемещает) настройки `in.cinny.app` → `io.github.schadin.harrier` (config + data каталоги, XDG на Linux), создаёт маркер `migration.success`; ничего не удаляет и не перезаписывает существующие новые данные.

### 4. Прокси localhost
В `lib.rs` при старте гарантируется, что `localhost` и `127.0.0.1` есть в `NO_PROXY` — это критично для работы embedded-сервера в корпоративных сетях с прокси.

### 5. Безопасность (CSP)
Достаточно разрешительный CSP в `tauri.conf.json`:
```
connect-src 'self' blob: ipc: ws: wss: http: https: http://ipc.localhost
script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: ...
```

### 6. Разрешения (Tauri v2 capabilities)
- `desktop.json` — глобальные шорткаты
- `migrated.json` — все остальные разрешения, мигрированные из Tauri v1 (FS, окна, диалоги, HTTP, уведомления, буфер обмена, opener и т.д.)

### 7. Нативное меню macOS
В `menu.rs` описано меню для macOS (Cinny, Edit, View, Window). Закомментировано в `lib.rs` — вероятно из-за конфликтов с веб-рендерингом.

### 8. Подмодуль cinny
Версия веб-клиента фиксируется через git submodule. При сборке всегда используется та версия, которая записана в `.gitmodules`. Скрипт `update-version.mjs` при бампе версии переключает подмодуль на последний тег.

### 9. Версионирование
Версия приложения синхронизирована: `npm`, `Cargo.toml`, `tauri.conf.json` — все используют одинаковую версию (на момент написания 4.12.5).

---

## Разработка

### Требования
- Node.js >= 16 (используется 24.13.1 согласно `.node-version`)
- Rust (stable)
- Системные зависимости Tauri: [Prerequisites](https://v2.tauri.app/start/prerequisites/)

### Локальный запуск
```bash
git clone --recursive https://github.com/schadin/harrier-desktop.git
cd cinny-desktop/cinny
npm ci
cd ..
npm ci
npm run tauri dev     # разработка с HMR
npm run tauri build   # продакшен-сборка
```
---

## Правила разработки

### Возможности протокола

1. Работаем в рамках возможностей протокола Matrix: фичи строятся только на тех
   механизмах и данных, которые протокол предоставляет (события, read receipts,
   статусы из matrix-js-sdk).
2. Если в протоколе нет механизма для желаемой функции — не реализуем её и не
   изобретаем нестандартные обходные пути.

### Задачи

1. Все доработки ведутся как GitHub Issues в репозитории-зонтике
   `schadin/harrier-project` (`https://github.com/schadin/harrier-project/issues`).
   Нумерация `TK-XXXXX` сохранена исторически и используется в заголовках и
   сообщениях коммитов как ссылка на конкретную задачу.
2. Описание задачи содержит цель, план реализации и учёт изменений по ходу работы.
3. После завершения задачи коммит делается только после подтверждения пользователем.

### Версионирование

1. Версию приложения изменять **только по явной команде пользователя** (`npm run bump <version>`). Самостоятельно поднимать версию нельзя.

### Ветки и публикация

1. Основная ветка разработки — `harrier`.
2. **Push никогда не выполнять** — все изменения остаются локально до явного указания пользователя.

### README.md

1. После завершения доработки спрашивать пользователя, нужно ли добавить описание функции в `README.md`.

---

## Полезные ссылки

- [Cinny Desktop releases](https://github.com/schadin/harrier-desktop/releases)
- [Cinny Web App](https://app.cinny.in/)
- [Tauri v2 Documentation](https://v2.tauri.app/)
- [Matrix protocol](https://matrix.org/)
- [Flathub: in.cinny.Cinny](https://flathub.org/apps/details/in.cinny.Cinny)

# Chappy Web — Product Prototype v0.1

Рабочее AI-пространство: изображения, видео, музыка, чат и агенты — с проектами,
Canvas, памятью (аватары/голоса/стили/локации) и каталогом моделей. Русский интерфейс.

> Отдельный продукт и отдельный проект. Не связан с Planify / другими проектами.
> Это интерактивный **прототип**: генерации, оплата, авторизация — имитируются (mock) и честно помечены.

## Стек
- **Vite + React + TypeScript** (SPA)
- **React Router** — маршрутизация (публичный сайт + `/app/*` воркспейс)
- **@xyflow/react** — Canvas (визуальная доска)
- **Zustand + persist** — состояние и сохранение в `localStorage`
- **CSS-переменные + CSS Modules** — дизайн-токены (без Tailwind)
- **i18n-ready** — строки в `src/i18n/ru.ts` + `t()` (английский подключается позже)

## Запуск
```bash
npm install
npm run dev      # http://localhost:5210 (или порт Vite по умолчанию)
npm run build    # production-сборка в dist/
npm run preview  # предпросмотр сборки
```

## Структура
```
src/
  main.tsx App.tsx        # точка входа + роутинг
  layouts/                # PublicLayout, AppLayout (sidebar + topbar)
  pages/ public/ app/     # страницы сайта и воркспейса
  components/             # общие UI-компоненты (Modal, Toaster, StubPage, …)
  features/               # canvas, agents, music-studio, … (по мере готовности)
  services/               # payment (PaymentProvider), storage, mockGen
  store/                  # zustand store (проекты, кредиты, тосты)
  data/                   # mock-данные (models, agents, trends, plans, account)
  styles/                 # tokens.css, global.css, components.css
  types/                  # доменные типы
  i18n/                   # ru.ts + useT
public/trends/            # демо-изображения (оптимизированы из легаси)
```

## Позиционирование
Продукт — **рабочее AI-пространство** (не «агрегатор моделей» и не «сайт про оплату без VPN»).
Оплата российской картой через ЮKassa и доступ к разным моделям — это **функции**, а не ядро бренда.

## Оплата (архитектура)
UI зависит от абстракции `PaymentProvider` (`src/services/payment.ts`).
Первая реализация — `YooKassaProvider` (mock). Другие провайдеры добавляются без переделки UI.

## Что переиспользовано из версии Владимира (`chappy-site.zip`)
- **Только как референс/контент:** дизайн-язык (тёмная тема, индиго→циан градиент, шрифты
  Bricolage Grotesque / Inter / JetBrains Mono), идея app-shell, паттерны карточек,
  категории/форматы трендов, 13 демо-превью (сжаты в JPEG, ~1 МБ вместо ~28 МБ).
- **НЕ переиспользовано:** двухфайловая HTML-архитектура, мёртвые кнопки, фейковые метрики,
  mock-персона, брендовое ядро «оплата РФ / без VPN / агрегатор 100+ моделей».

## Статус
См. `CHANGELOG.md`. Это baseline v0.1; следующие изменения — в v0.2.

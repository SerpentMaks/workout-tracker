# BentoFit — Bento Grid Workout Tracker (iPhone PWA)

Веб-приложение для трекинга тренировок на iPhone в стиле Bento Grid.

## Инструкция по деплою на GitHub Pages:

1. Создайте новый репозиторий на GitHub (например, `bentofit` или `<username>.github.io`).
2. Распакуйте содержимое архива в корень репозитория:
   - `index.html` должен находиться в корне репозитория.
   - Папки `css/`, `js/`, `icons/`, файлы `manifest.json` и `sw.js` также должны быть в корне.
3. Закоммитьте и отправьте файлы в ветку `main`:
   ```bash
   git add .
   git commit -m "Initial commit of BentoFit PWA"
   git push origin main
   ```
4. Откройте репозиторий на GitHub:
   - Перейдите в **Settings** (Настройки репозитория) -> **Pages**.
   - В разделе **Build and deployment**:
     - Source: **Deploy from a branch**
     - Branch: выберите `main` и папку `/ (root)`
     - Нажмите **Save**.
5. Через 1-2 минуты сайт станет доступен по адресу:
   `https://<username>.github.io/<repository-name>/`

## Установка на экран «Домой» (iPhone):
1. Откройте полученную ссылку в браузере Safari на iPhone.
2. Нажмите кнопку **«Поделиться»** (иконка квадрата со стрелкой вверх внизу экрана Safari).
3. Прокрутите меню и выберите **«На экран "Домой"»** (*Add to Home Screen*).
4. Нажмите **«Добавить»**.
5. Приложение готово к использованию в полноэкранном режиме и будет работать полностью автономно (offline).

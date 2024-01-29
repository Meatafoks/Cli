# Metafoks Application
Inspired by Spring. Metafoks Application реализует реверсивный инжекцию зависимостей.

- [Установка](#установка)
- [Архитектура проекта](#архитектура-проекта)
- [Как использовать (гайд)](#как-использовать-гайд)
  - [Первый сервис](#первый-сервис)
  - [Компоненты](#компоненты)
  - [Загрузчики](#загрузчики)
  - [Расширения](#расширения)
- [Скан компонентов](#скан-компонентов)
- [Логирование](#логирование)

## Установка
Установите глобально пакет metafoks cli
```shell
npm i -g @metafoks/cli
```

Создайте директорию проекта, например `project`
```shell
mkdir project
```

Перейдите в директорию проекта
```shell
cd project
```

Выполните стартовый скрипт инициализации проекта
```shell
metafoks init
```

## Архитектура проекта
- `/config` - директория с конфигурациями
- `/config/config.json` - файл с конфигурацией приложения
- `/src` - основные файлы проекта
- `/src/index.ts` - точка входа в приложение
- `/package.json` - основной файл модуля
- `/esbuild.config.js` - конфигурация сборки проекта
- `/tsconfig.json` - основной файл конфигурации typescript

## Как использовать (гайд)
### Первый сервис
В директории файлов проекта, есть файл точки входа `index.ts`, давайте дополним его:
```typescript
// file: index.ts

import { MetafoksApplication, createLogger } from "@metafoks/app";
import MyService from './my.service.ts';

@MetafoksApplication()
class Application {
    private logger = createLogger( Application );

    constructor(private deps: { config: any, myService: MyService }) {}

    start() {
        // Start point of your application
        this.logger.info( this.deps.config );
        this.deps.myService.startService();
    }
}
```

и создадим наш первый сервис. Обратите внимание, что необходимо использовать ключевое слово `default` при экспорте модуля.


```typescript
// file: my.service.ts

export default class MyService {
    private logger = createLogger( MyService );

    constructor(private deps: { config: any }) {}

    startService() {
        this.logger.info( "service has been started!" );
    }
}
```

## Компоненты

Если вы хотите создать компонент, который не является сервисом, используйте файлы с расширением `*.component.ts`.
Компонент должен быть экспортирован как `default`.

```typescript
// file: db.component.ts

export default class DbComponent {
}
```

Но что, если вы хотите регистрировать свой компонент с использованием более короткого имени? Есть решение!
```typescript
// file: db.component.ts

import { Component } from "@mtafoks/app";

@Component( "db" )
export default class DbComponent {
}
```

Теперь можно использовать имя `db`.

```typescript
// file: index.ts

import { MetafoksApplication, createLogger } from "@metafoks/app";
import DbComponent from './db.component.ts';

@MetafoksApplication()
class Application {
    private logger = createLogger( Application );

    constructor(private deps: { config: any, db: DbComponent }) {}

    async start() {
        this.logger.info( this.deps.config );
        await this.deps.db.connect();
    }
}
```

## Загрузчики

Приложение Metafoks имеет `загрузчики` - функции, выполняющиеся один раз и живущие как singleton, однако они также имеют контекст.
Давайте создадим файл `telegraf.loader.ts`. Обратите внимание, что загрузчик всегда имеет формат `*.loader.ts`.

```typescript
// file: telegraf.loader.ts

export default function (deps: { config: any }) {
    return new Telegraf( config.token );
}
```

Теперь мы можем также создать загрузчик для `Telegram`.

```typescript
// file: telegram.loader.ts

export default function (deps: { telegraf: Telegraf }) {
    return telegraf.telegram;
}
```

Отлично! Для получения результатов загрузчика из контекста, необходимо использовать имя файла загрузчика без `.loader`.

```typescript
// file: bot.component.ts

import { Component } from "@metafoks/app";

@Component( "bot" )
export default class BotComponent {
    public constructor(private deps: { telegraf: Telegraf, telegram: Telegram, config: any }) {}
}
```

### Расширения

```typescript
import { MetafoksContext } from "@metafoks/app";

MetafoksContext.getContext()
```

`getContext()` возвращает контекст приложения.

Простейший пример:

```typescript
// module: @custom/tg
// file: index.ts

import { MetafoksContext } from "@metafoks/app";

export class TelegramBot {
    public constructor(private deps: {}) {}

    startBot() {}
}

export function telegramBotExtension(context: MetafoksContext) {
    context.addClass( "telegramBot", TelegramBot );
}
```

```typescript
// file: index.ts

// ...imports

@MetafoksApplication( {
    with: [telegramBotExtension]
} )
class Application {
    private logger = createLogger( Application );

    constructor(private deps: { config: any, telegramBot: TelegramBot }) {}

    start() {
        this.logger.info( this.deps.config );
        this.deps.telegramBot.startBot();
    }
}
```

## Скан компонентов
Во встроенном конфиге `config/config.json` есть правила сканирования компонентов:

```json
{
  "metafoks": {
    "scanner": {
      "service": "./src/**/*.service.ts",
      "loader": "./src/**/*.loader.ts",
      "component": "./src/**/*.component.ts"
    }
  }
}
```

## Логирование
Во встроенном конфиге `config/config.json` существуют некоторые настройки для логирования:

```json
{
  "metafoks": {
    "logger": {
      "level": {
        "app": "INFO",
        "system": "INFO"
      }
    }
  }
}
```

- `system` - системные логи приложения
- `app` - логи, созданные `createLogger` функцией

Поддерживаемые типы логирования: trace, debug, info, warn, error.
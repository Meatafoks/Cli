# Metafoks Application

Inspired by Spring, the Metafoks Application implements reverse dependency injection.

- [Installation](#installation)
- [Project Architecture](#project-architecture)
- [How to Use (Guide)](#how-to-use-guide)
    - [First Service](#first-service)
    - [Components](#components)
    - [Loaders](#loaders)
    - [Extensions](#extensions)
- [Component Scanning](#component-scanning)
- [Logging](#logging)

## Installation
Install the Metafoks CLI globally:
```shell
npm i -g @metafoks/cli
```

Create a project directory, for example, `project`:
```shell
mkdir project
```

Navigate to the project directory:
```shell
cd project
```

Run the project initialization script:
```shell
metafoks init
```

## Project Architecture
- `/config` - directory with configurations
- `/config/config.json` - application configuration file
- `/src` - main project files
- `/src/index.ts` - entry point of the application
- `/package.json` - main module file
- `/esbuild.config.js` - project build configuration
- `/tsconfig.json` - main TypeScript configuration file

## How to Use (Guide)
### First Service
In the project files directory, there is an entry point file `index.ts`. Let's enhance it:
```typescript
// file: index.ts

import { MetafoksApplication, createLogger } from "@metafoks/app";
import MyService from './my.service.ts';

@MetafoksApplication()
class Application {
    private logger = createLogger(Application);

    constructor(private deps: { config: any, myService: MyService }) {}

    start() {
        // Start point of your application
        this.logger.info(this.deps.config);
        this.deps.myService.startService();
    }
}
```

Now let's create our first service. Note that you need to use the `default` keyword when exporting the module.
```typescript
// file: my.service.ts

export default class MyService {
    private logger = createLogger(MyService);

    constructor(private deps: { config: any }) {}

    startService() {
        this.logger.info("Service has been started!");
    }
}
```

## Components
If you want to create a component that is not a service, use files with the `*.component.ts` extension. The component should be exported as `default`.
```typescript
// file: db.component.ts

export default class DbComponent {
}
```

But what if you want to register your component using a shorter name? There's a solution!
```typescript
// file: db.component.ts

import { Component } from "@mtafoks/app";

@Component("db")
export default class DbComponent {
}
```

Now you can use the name `db`.
```typescript
// file: index.ts

import { MetafoksApplication, createLogger } from "@metafoks/app";
import DbComponent from './db.component.ts';

@MetafoksApplication()
class Application {
    private logger = createLogger(Application);

    constructor(private deps: { config: any, db: DbComponent }) {}

    async start() {
        this.logger.info(this.deps.config);
        await this.deps.db.connect();
    }
}
```

## Loaders
The Metafoks application has `loaders` - functions that run once and live as singletons, but they also have context. Let's create a `telegraf.loader.ts` file. Note that the loader always has the `*.loader.ts` format.
```typescript
// file: telegraf.loader.ts

export default function (deps: { config: any }) {
    return new Telegraf(config.token);
}
```

Now we can also create a loader for `Telegram`.
```typescript
// file: telegram.loader.ts

export default function (deps: { telegraf: Telegraf }) {
    return telegraf.telegram;
}
```

Great! To get loader results from the context, you need to use the loader file name without `.loader`.
```typescript
// file: bot.component.ts

import { Component } from "@metafoks/app";

@Component("bot")
export default class BotComponent {
    public constructor(private deps: { telegraf: Telegraf, telegram: Telegram, config: any }) {}
}
```

### Extensions
```typescript
import { MetafoksContext } from "@metafoks/app";

MetafoksContext.getContext()
```

`getContext()` returns the application context.

Simple example:
```typescript
// module: @custom/tg
// file: index.ts

import { MetafoksContext } from "@metafoks/app";

export class TelegramBot {
    public constructor(private deps: {}) {}

    startBot() {}
}

export function telegramBotExtension(context: MetafoksContext) {
    context.addClass("telegramBot", TelegramBot);
}
```

```typescript
// file: index.ts

// ...imports

@MetafoksApplication({
    with: [telegramBotExtension]
})
class Application {
    private logger = createLogger(Application);

    constructor(private deps: { config: any, telegramBot: TelegramBot }) {}

    start() {
        this.logger.info(this.deps.config);
        this.deps.telegramBot.startBot();
    }
}
```

## Component Scanning
In the built-in config `config/config.json`, there are component scanning rules:
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

## Logging
In the built-in config `config/config.json`, there are some settings for logging:
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
- `system` - system logs of the application
- `app` - logs created by the `createLogger` function

Supported log types: trace, debug, info, warn, error.
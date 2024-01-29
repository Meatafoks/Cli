# Metafoks 应用

受 Spring 启发，Metafoks 应用实现了反向依赖注入。

- [安装](#安装)
- [项目架构](#项目架构)
- [如何使用（指南）](#如何使用指南)
    - [第一个服务](#第一个服务)
    - [组件](#组件)
    - [加载器](#加载器)
    - [扩展](#扩展)
- [组件扫描](#组件扫描)
- [日志记录](#日志记录)

## 安装
全局安装 Metafoks CLI：
```shell
npm i -g @metafoks/cli
```

创建一个项目目录，例如 `project`：
```shell
mkdir project
```

进入项目目录：
```shell
cd project
```

运行项目初始化脚本：
```shell
metafoks init
```

## 项目架构
- `/config` - 包含配置的目录
- `/config/config.json` - 应用配置文件
- `/src` - 项目的主要文件
- `/src/index.ts` - 应用的入口点
- `/package.json` - 主模块文件
- `/esbuild.config.js` - 项目构建配置
- `/tsconfig.json` - TypeScript 的主要配置文件

## 如何使用（指南）
### 第一个服务
在项目文件目录中，有一个入口点文件 `index.ts`。让我们增强它：
```typescript
// file: index.ts

import { MetafoksApplication, createLogger } from "@metafoks/app";
import MyService from './my.service.ts';

@MetafoksApplication()
class Application {
    private logger = createLogger(Application);

    constructor(private deps: { config: any, myService: MyService }) {}

    start() {
        // 应用的起始点
        this.logger.info(this.deps.config);
        this.deps.myService.startService();
    }
}
```

现在让我们创建我们的第一个服务。请注意，导出模块时需要使用 `default` 关键字。
```typescript
// file: my.service.ts

export default class MyService {
    private logger = createLogger(MyService);

    constructor(private deps: { config: any }) {}

    startService() {
        this.logger.info("服务已启动！");
    }
}
```

## 组件
如果要创建不是服务的组件，请使用扩展名为 `*.component.ts` 的文件。组件应作为 `default` 导出。
```typescript
// file: db.component.ts

export default class DbComponent {
}
```

但如果你想使用更短的名称注册组件怎么办？有一个解决方案！
```typescript
// file: db.component.ts

import { Component } from "@mtafoks/app";

@Component("db")
export default class DbComponent {
}
```

现在你可以使用名称 `db`。
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

## 加载器
Metafoks 应用有 `加载器` - 一次运行的函数，作为单例存在，但它们也具有上下文。让我们创建一个 `telegraf.loader.ts` 文件。请注意，加载器的格式始终为 `*.loader.ts`。
```typescript
// file: telegraf.loader.ts

export default function (deps: { config: any }) {
    return new Telegraf(config.token);
}
```

现在我们还可以为 `Telegram` 创建一个加载器。
```typescript
// file: telegram.loader.ts

export default function (deps: { telegraf: Telegraf }) {
    return telegraf.telegram;
}
```

太好了！要从上下文中获取加载器的结果，需要使用加载器文件名而无需 `.loader`。
```typescript
// file: bot.component.ts

import { Component } from "@metafoks/app";

@Component("bot")
export default class BotComponent {
    public constructor(private deps: { telegraf: Telegraf, telegram: Telegram, config: any }) {}
}
```

### 扩展
```typescript
import { MetafoksContext } from "@metafoks/app";

MetafoksContext.getContext()
```

`getContext()` 返回应用上下文。

简单的例子：
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

## 组件扫描
在内置配置 `config/config.json` 中，有组件扫描规则：
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

## 日志记录
在内置配置 `config/config.json` 中，有一些日志记录的设置：
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
- `system` - 应用程序的系统日志
- `app` - 由 `createLogger` 函数创建的日志

支持的日志类型：trace、debug、info、warn、error。
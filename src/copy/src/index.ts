import { MetafoksApplication } from '@metafoks/app';

@MetafoksApplication
export class Application {
    public constructor(private deps: {}) {}

    start() {
        // application starts here
        // this function could be async
    }
}

import { MetafoksApplication } from '@metafoks/app';

@MetafoksApplication()
export class Application {
    public constructor(private deps: {}) {}

    async start() {
        // application starts here
    }
}

import type { Config } from 'jest';

const config: Config = {
    collectCoverage: true,
    coverageReporters: ['html', 'json'],
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: ['node_modules', '<rootDir>/src/index.ts', '.mock.ts'],
    coverageDirectory: '<rootDir>/coverage/',
    testRegex: '(/test/.*\\.(test|spec))\\.(jsx?|tsx?|ts|js)$',
    transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node', 'jsx', 'tsx'],
};

export default config;

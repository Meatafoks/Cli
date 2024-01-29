#!/usr/bin/env node
const yargs = require('yargs')
    .usage(
        `
    Usage $0
    `,
    )
    .help();

require('../lib/index').default();

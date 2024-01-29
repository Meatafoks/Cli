import * as child_process from 'child_process';
import * as path from 'path';
import * as process from 'process';
import figlet from 'figlet';
import chalk from 'chalk';
import * as fs from 'fs';

const sourceFiles = path.resolve(__dirname, './copy');

export default async function cli() {
    const currentPath = process.cwd();
    await drawHeader();

    function printHelp() {
        if (isApplicationInFolder(currentPath)) {
            console.log(`Use ${chalk.cyan('metafoks start')} - to start application`);
            console.log(`Use ${chalk.cyan('metafoks build')} - to build application`);
            console.log(`Use ${chalk.cyan('metafoks watch')} - to start watcher`);
            console.log();
        } else {
            console.log(`Use ${chalk.cyan('metafoks init')} - to init new application`);
            console.log();
        }
    }

    const isVerbose = process.argv.includes('-v') || process.argv.includes('--verbose');

    if (process.argv[2] === 'help') {
        printHelp();
    }

    if (process.argv[2] === 'init') {
        console.log('Started project init...');

        if (isApplicationInFolder(currentPath)) {
            console.log(chalk.red('package.json file is already in folder - clean folder and try again'));
            return;
        }

        console.log('Copying startup files...');
        child_process.execSync(`cp -r ${sourceFiles}/** ${currentPath}`, {
            stdio: isVerbose ? 'inherit' : undefined,
        });
        console.log(`${chalk.green('[OK]')} Copied`);

        console.log('Installing packages...');
        child_process.execSync('npm i', { cwd: currentPath, stdio: isVerbose ? 'inherit' : undefined });
        console.log(`${chalk.green('[OK]')} Installed`);

        console.log();
        printHelp();
    }

    if (process.argv[2] === 'start') {
        console.log('Starting application....');

        if (isVerbose) console.log('Path: ' + currentPath);
        child_process.execSync('ts-node ./src/index.ts', {
            cwd: currentPath,
            stdio: 'inherit',
        });
    }

    if (process.argv[2] === 'build') {
        console.log('Building application...');

        child_process.execSync('node esbuild.config.js', { cwd: currentPath, stdio: 'inherit' });
        console.log(`Build done. Check ${chalk.cyan('/build')} folder`);
    }

    if (process.argv[2] === 'watch') {
        console.log('Starting watcher...');

        child_process.execSync('nodemon --watch ./src --exec "npm run start" -e ts', {
            cwd: currentPath,
            stdio: 'inherit',
        });
    }
}

async function drawHeader() {
    return new Promise(resolve => {
        console.log();
        console.log();
        figlet('Metafoks', { font: 'ANSI Regular' }, (error, result) => {
            console.log(chalk.yellow(result));
            resolve(true);
        });
    });
}

function isApplicationInFolder(path: string) {
    return fs.existsSync(path + '/package.json');
}

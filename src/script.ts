import { execFile } from 'child_process'
import * as fg from "fast-glob";
import * as fsEx from "fs-extra";
import { validate } from "compare-versions";
import validatePkgName from "validate-npm-package-name";
import gradient from 'gradient-string';
import { zip } from 'zip-a-folder';
import { sync as rimraf } from 'rimraf';
import { CheckForUnsafeStrings, Dependencies, DeployLambda, DepsToInstall, BuildLambda, InstallDeps, LambdaLayerPackageJson } from "./interfaces";
const { copyFile, existsSync, readFileSync, mkdirSync, readdirSync } = fsEx;
const glob = fg.sync;

/**
 * execPromise
 * @description interprets a cmd
 * @param {cmd} string
 * @returns {object}
 */
export const execFilePromise = (file: string, args: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    execFile(file, args, (error, stdout, stderr) => {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

export function logger(fnName: string, msg: unknown) {
  console.info(`🕹 ${gradient.vice('lambda-layer:')}${fnName}:debug:`, msg);
}

export function resolveJSON(
  path: string,
  debug = false
): LambdaLayerPackageJson | void {
  try {
    const json = JSON.parse(readFileSync(path, "utf8"));
    return json;
  } catch (err) {
    if (debug) logger("resolveJSON", err);
    return;
  }
}

export function checkForUnsafeStrings({ debug = false, deps, dir, output, runner }: CheckForUnsafeStrings): boolean {
  const isValidRunner = ['yarn', 'pnpm', 'npm', 'bun'].includes(runner);
  if (!isValidRunner) {
    if (debug) logger('checkForUnsafeStrings', { msg: 'check invalid runner', runner });
    return false
  }
  const isValidDir = /[A-Za-z0-9\-_.]/.test(dir);
  if (!isValidDir) {
    if (debug) logger('checkForUnsafeStrings', { msg: 'check invalid dir', dir });
    return false
  }
  const isValidModule = deps.every(({ name, version }) => {
    const { validForNewPackages, validForOldPackages } = validatePkgName(name);
    const isValidName = validForNewPackages || validForOldPackages;
    const versionCharacters = version.split("");
    const [firstCharacter, ...rest] = versionCharacters;
    const specifier = ["^", "~"].includes(firstCharacter) ? firstCharacter : "";
    const hasSpecifier = specifier.length === 1;
    const characters = rest.join("");
    const exactVersion = hasSpecifier ? characters : version;
    const isValidVersion = validate(exactVersion);
    if (debug) logger('checkForUnsafeStrings', { msg: 'check invalid module', name, version, exactVersion, isValidName, isValidVersion });
    return isValidName && isValidVersion;
  });
  if (!isValidModule) {
    if (debug) logger('checkForUnsafeStrings', { msg: 'check invalid deps', deps });
    return false
  }
  const isValidOutput = /[A-Za-z0-9\-_.]/.test(output);
  if (!isValidOutput) {
    if (debug) logger('checkForUnsafeStrings', { msg: 'check invalid output', output });
    return false
  }
  return true
}

export function depsToInstall({ dependencies, ignore = [], include = {}, debug = false }: DepsToInstall) {
  const dependencyNames = Object.keys(dependencies);
  const includeNames = Object.keys(include);
  const hasDependencies = dependencyNames.length > 0;
  const hasInclude = includeNames.length > 0;
  if (!hasDependencies && !hasInclude) return [];
  const deps = hasDependencies ? dependencyNames.filter(dep => !ignore.includes(dep)).map(name => ({ name, version: dependencies[name] })) : [];
  const includeDeps = hasInclude ? includeNames.map(name => ({ name, version: include[name] })) : [];
  // mergeDeps with includeDeps taking the priority
  const mergedDeps = deps.filter(({ name }) => !includeDeps.map(({ name }) => name).includes(name)).concat(includeDeps);
  if (debug) logger('depsToInstall', { deps, includeDeps, mergedDeps });
  return mergedDeps;
}

export async function installDeps({
  config,
  dependencies,
  dir,
  debug = false,
  isTesting = false,
  exec = execFilePromise,
  output = '',
  runner = 'npm',
  rootDir = './',
}: InstallDeps) {
  const { ignore = [], include = {} } = config || {};
  const deps = depsToInstall({ dependencies, ignore, include, debug });
  const depsString = deps.map(({ name, version }) => `${name}@${version}`).join(' ');
  // clean up and setup the install
  const outDir = `${rootDir}${output}${dir}`;
  if (existsSync(outDir)) rimraf(outDir);
  const modulePath = `${outDir}/nodejs`;
  mkdirSync(modulePath, { recursive: true });
  if (existsSync(`${rootDir}/.npmrc`)) {
    copyFile(`${rootDir}/.npmrc`, `${modulePath}/.npmrc`);
    if (debug) logger('npmrc', 'copied!');
  }
  const dest = `--prefix ${modulePath}`;
  if (debug) logger('installDeps', { deps, config, depsString, isTesting });
  // checks for unsafe exec inputs
  const isExec = checkForUnsafeStrings({ debug, deps, dir, output, runner });
  if (isTesting === true || deps.length < 1 || !isExec) return;
  if (debug) logger('installDeps', 'Installing deps!');
  try {
    await exec(`${runner}`, ["install", dest, depsString, "-S"]);
    return deps;
  } catch (err) {
    if (debug) logger('installDeps', err);
    return deps;
  }
}

export async function deployLambda({
  debug = false,
  dir,
  bucket,
  runtimes = ['nodejs14.x'],
  architectures = ['x86_64'],
  output = '',
  rootDir = './',
  exec = execFilePromise,
}: DeployLambda): Promise<void> {
  if (!bucket) {
    throw new Error('No bucket provided');
  }

  const layerName = `${dir}`;
  const s3Path = `${rootDir}${output}${dir}.zip`;

  const args = [
    'lambda', 'publish-layer-version',
    '--layer-name', layerName,
    '--content', `S3Bucket=${bucket},S3Key=${s3Path}`,
    '--compatible-runtimes', runtimes.join(' '),
    '--compatible-architectures', architectures.join(' ')
  ];

  try {
    if (debug) {
      console.log(`Deploying Lambda Layer with: aws ${args.join(' ')}`);
    }
    const result = await exec('aws', args);
    if (debug) {
      console.log(result);
    }
  } catch (error) {
    console.error(`Failed to deploy Lambda Layer: ${error}`);
    throw error; // Rethrow the error for further handling if necessary
  }
}

export async function buildLambda({
  architectures,
  bucket,
  config,
  debug = false,
  deploy = false,
  dir,
  files: matchers = ['package.json'],
  ignore = ["node_modules/**/*", "**/node_modules/**/*"],
  isTesting = false,
  noZip = false,
  output = "",
  rootDir = "./",
  runner = 'npm',
  runtimes,
}: BuildLambda) {
  const files = glob(matchers, { cwd: rootDir, ignore });
  if (debug) logger('buildLambda', { config, files, matchers, ignore, rootDir });
  if (!dir || dir.length < 1) throw new Error('No dir provided');
  if (!files || files.length < 1) throw new Error('No config (package.json, ) files found');
  const dependencies = files
    .reduce((acc: Dependencies, file: string) => {
      const path = `${rootDir}${file}`;
      const packageJson = readFileSync(path, "utf8");
      const { dependencies } = JSON.parse(packageJson);
      return {
        ...acc,
        ...dependencies,
      }
    }, {} as Dependencies);
  if (Object.keys(dependencies).length < 1) {
    logger('error', { msg: 'No dependencies found! To build a lambda layer, dependencies are required. Is the file array correct?', files: matchers });
    return;
  }
  if (debug) {
    const currentDir = readdirSync(process.cwd());
    console.log(`${rootDir}${output}${dir}`);
    logger('gatherDeps', { dependencies, config, currentDir, cwd: process.cwd(), });
  }
  const configItems = config && Object.keys(config);
  const hasConfig = configItems && configItems.length > 0;
  let updatedConfig = config;
  if (!hasConfig) {
    const rootPkgJSON = readFileSync(`${rootDir}package.json`, "utf8");
    const { lambdaLayer } = JSON.parse(rootPkgJSON);
    updatedConfig = lambdaLayer;
  }

  const dest = await installDeps({ config: updatedConfig, debug, dependencies, dir, isTesting, output, runner, rootDir });
  if (!noZip && !isTesting) {
    await zip(`${rootDir}${output}${dir}`, `${rootDir}${output}${dir}.zip`);
  }
  if (deploy && bucket && !isTesting) await deployLambda({ bucket, debug, dir, runtimes, architectures });
  return dest;
}

export default buildLambda;

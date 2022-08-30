import { promisify } from "util";
import { exec } from 'child_process'
import { sync as glob } from "fast-glob";
import { readFileSync } from "fs-extra";
import { validate } from "compare-versions";
import gradient from 'gradient-string';
import { zip } from 'zip-a-folder';
import { CheckForUnsafeStrings, Dependencies, DepsToInstall, BuildLambda, InstallDeps, LambdaLayerPackageJson } from "./interfaces";

/**
 * execPromise
 * @description interprets a cmd
 * @param {cmd} string
 * @returns {object}
 */
export const execPromise = promisify(exec);

export function logger(fnName: string, msg: any) {
  console.log(`🕹 ${gradient.vice('lambda-layer:')}${fnName}:debug:`, msg);
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
    if (debug) logger('checkForUnsafeStrings', { msg: 'invalid runner', runner });
    return false
  }
  const isValidDir = /[A-Za-z0-9\-_.]/.test(dir);
  if (!isValidDir) {
    if (debug) logger('checkForUnsafeStrings', { msg: 'invalid dir', dir });
    return false
  }
  const isValideModule = deps.every(({ name, version }) => /[A-Za-z0-9\-_.]/.test(name) && validate(version));
  if (!isValideModule) {
    if (debug) logger('checkForUnsafeStrings', { msg: 'invalid deps', deps });
    return false
  }
  const isValidOutput = /[A-Za-z0-9\-_.]/.test(output);
  if (!isValidOutput) {
    if (debug) logger('checkForUnsafeStrings', { msg: 'invalid output', output });
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
  exec = execPromise,
  output = __dirname,
  runner = 'npm',
}: InstallDeps) {
  const { ignore = [], include = {} } = config || {};
  const deps = depsToInstall({ dependencies, ignore, include, debug });
  const depsString = deps.map(({ name, version }) => `${name}@${version}`).join(' ');
  const dest = `--prefix ${dir}/nodejs`;
  if (debug) logger('installDeps', { deps, config, depsString, isTesting });
  // checks for unsafe exec inputs
  const isExec = checkForUnsafeStrings({ debug, deps, dir, output, runner });
  if (isTesting === true || deps.length < 1 || !isExec) return;
  if (debug) logger('installDeps', 'Installing deps!');
  try {
    await exec(`${runner} install ${dest} ${depsString} -S`);
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
}: any) {
  const runtimesString = runtimes.join(' ');
  const architecturesString = architectures.join(' ');
  try {
    if (debug) logger('deployLambda', { architectures, bucket, dir, runtimes, msg: 'Build Lambda Layers assumes you\'re authenticated to AWS! 👌' });
    if (!bucket) throw new Error('No bucket provided');
    await exec(`
        aws lambda publish-layer-version
        --layer-name ${dir}
        --content S3Bucket=${bucket},S3Key=${dir}.zip
        --compatible-runtimes ${runtimesString}
        --compatible-architectures ${architecturesString}
      `);
  } catch (err) {
    if (debug) logger('deployLambda', err);
    return;
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
  output = "./",
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
  if (debug) logger('gatherDeps', { dependencies, config });
  const configItems = config && Object.keys(config);
  const hasConfig = configItems && configItems.length > 0;
  let updatedConfig = config;
  if (!hasConfig) {
    const rootPkgJSON = readFileSync(`${rootDir}package.json`, "utf8");
    const { lambdaLayer } = JSON.parse(rootPkgJSON);
    updatedConfig = lambdaLayer;
  }
  const dest = await installDeps({ config: updatedConfig, debug, dependencies, dir, isTesting, output, runner });
  if (!noZip && !isTesting) await zip(dir, `${output}${dir}.zip`);
  if (deploy && !isTesting) await deployLambda({ bucket, debug, dir, runtimes, architectures });
  return dest;
}

export default buildLambda;

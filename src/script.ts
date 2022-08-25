import { promisify } from "util";
import { exec } from 'child_process'
import { sync as glob } from "fast-glob";
import { readFileSync } from "fs-extra";
import { validate } from "compare-versions";
import gradient from 'gradient-string';
import { CheckForUnsafeStrings, Dependencies, DepsToInstall, GatherDeps, InstallDeps, LambdaLayerPackageJson } from "./interfaces";

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

export function checkForUnsafeStrings({ deps, output, runner }: CheckForUnsafeStrings): boolean {
  const isValidRunner = ['yarn', 'pnpm', 'npm', 'bun'].includes(runner);
  if (!isValidRunner) return false
  const isValideModule = deps.every(({ name, version }) => /[A-Za-z0-9\-_.]/.test(name) && validate(version));
  if (!isValideModule) return false
  const isValidOutput = /[A-Za-z0-9\-_.]/.test(output);
  if (!isValidOutput) return false
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
  dest = 'nodejs',
  debug = false,
  isTesting = false,
  exec = execPromise,
  runner = 'npm',
}: InstallDeps) {
  const { ignore = [], include = {} } = config || {};
  const deps = depsToInstall({ dependencies, ignore, include, debug });
  const depsString = deps.map(({ name, version }) => `${name}@${version}`).join(' ');
  const output = dest ? ` --prefix ${dest} ` : ' ';
  if (debug) logger('installDeps', { deps, config, depsString });
  if (isTesting || deps.length < 1) return;
  try {
    await exec(`${runner} install${output}${depsString} -S`);
    return deps;
  } catch (err) {
    if (debug) logger('installDeps', err);
    return deps;
  }
}

export async function gatherDeps({
  config,
  debug = false,
  dest = 'nodejs',
  files: matchers = ['package.json'],
  ignore = ["node_modules/**/*", "**/node_modules/**/*"],
  isTesting = false,
  rootDir = "./",
  runner = 'npm',
}: GatherDeps) {
  const files = glob(matchers, { cwd: rootDir, ignore });
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
  if (debug) logger('gatherDeps', { dependencies, config });
  const configItems = config && Object.keys(config);
  const hasConfig = configItems && configItems.length > 0;
  let updatedConfig = config;
  if (!hasConfig) {
    const rootPkgJSON = readFileSync(`${rootDir}package.json`, "utf8");
    const { lambdaLayer } = JSON.parse(rootPkgJSON);
    updatedConfig = lambdaLayer;
  }
  const output = await installDeps({ config: updatedConfig, debug, dest, dependencies, isTesting, runner })
  return output;
}

export default gatherDeps;

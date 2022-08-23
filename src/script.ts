import { promisify } from "util";
import { exec } from 'child_process'
import { sync as glob } from "fast-glob";
import { readFileSync } from "fs-extra";
import compare from "compare-versions";

type $FIXME = any;

/**
 * execPromise
 * @description interprets a cmd
 * @param {cmd} string
 * @returns {object}
 */
export const execPromise = promisify(exec);

export function resolveJSON(
  path: string,
  debug = false
): $FIXME | void {
  try {
    const json = JSON.parse(readFileSync(path, "utf8"));
    return json;
  } catch (err) {
    if (debug)
      console.log(` Pastoralist found invalid JSON at:\n${path}`);
    return;
  }
}

export function depsToInstall({ dependencies = {}, ignore = [], include = {}, debug = false } = {}) {
  const dependencyNames = Object.keys(dependencies);
  const includeNames = Object.keys(include);
  const hasDependencies = dependencyNames.length > 0;
  const hasInclude = includeNames.length > 0;
  if (!hasDependencies && !hasInclude) return [];
  const deps = hasDependencies ? dependencyNames.filter(dep => !ignore.includes(dep)).map(name => ({ name, version: dependencies[name] })) : [];
  const includeDeps = hasInclude ? includeNames.map(name => ({ name, version: include[name] })) : [];
  const mergedDeps = includeDeps.concat(deps);
  const filteredDeps = mergedDeps.filter((dep) => {
    const matches = mergedDeps.filter(item => item.name === dep.name)
    if (matches.length > 1) {
      const latestVersion = mergedDeps.filter(item => item.name === dep.name).map(({ version }) => version).sort(compare).reverse()[0];
      if (dep.version !== latestVersion) return null;
    }
    return dep;
  });
  if (debug) console.log('installDeps:debugging:', { filteredDeps });
  return filteredDeps;
}

export async function installDeps({
  config,
  dependencies,
  dest = 'nodejs',
  debug = false,
  isTesting = false,
  exec = execPromise,
  runner = 'npm',
}: $FIXME) {
  const { ignore = [], include = {} } = config || {};
  const deps = depsToInstall({ dependencies, ignore, include, debug });
  const depsString = deps.map(({ name, version }) => `${name}@${version}`).join(' ');
  if (debug) console.log('installDeps:debugging:', { deps, config, depsString });
  if (isTesting || deps.length < 1) return;
  /**
   * @todo provide support for yarn/pnpm installs
   * @note yarn/pnpm installs won't respect their configured workspace
   */
  try {
    await exec(`${runner} install ${dest ? `--prefix ${dest} ` : ' '}${depsString} -S`);
    return deps;
  } catch (err) {
    console.log(err);
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
}: $FIXME) {
  const files = glob(matchers, { cwd: rootDir, ignore });
  const dependencies = files
    .reduce((acc: $FIXME, file: string) => {
      const path = `${rootDir}${file}`;
      const packageJson = readFileSync(path, "utf8");
      const { dependencies } = JSON.parse(packageJson);
      return {
        ...acc,
        ...dependencies,
      }
    }, {} as $FIXME);
  if (debug) console.log('gather-deps:debugging:', { dependencies, config });
  const output = await installDeps({ config, debug, dest, dependencies, isTesting, runner })
  return output;
}

export default gatherDeps;

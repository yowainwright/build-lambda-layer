#!/usr/bin/env node

import { program } from "commander";
import { cosmiconfigSync } from "cosmiconfig";
import script from "./script";
import { Options, ConfigResult } from "./interfaces";
import gradient from 'gradient-string';

export async function action(dir: string, options: Options = {}): Promise<void> {
  // capture config data
  const explorer = cosmiconfigSync("lambdaLayer");
  const result = options?.searchPath
    ? explorer.search(options.searchPath)
    : explorer.search();
  const { config: pathConfig = {} } = (
    options?.config ? explorer.load(options?.config) : {}
  ) as ConfigResult;

  // massage config and option data
  const updatedConfig = {
    ...(!Object.keys(pathConfig).length ? result?.config : {}),
    ...(pathConfig?.lambdaLayer ? { ...pathConfig.lambdaLayer } : pathConfig),
    ...options,
    dir
  };

  // remove action level options
  const {
    config: usedConfig,
    searchPath: usedSearchPath,
    isTestingCLI,
    ...updatedOptions
  } = updatedConfig;

  if (options.isTestingCLI) {
    console.log({ options: updatedOptions });
    return;
  }

  try {
    console.log(`🕹 ${gradient.vice('lambda-layer:')} running...`);
    await script(updatedOptions);
    console.log(`🕹 ${gradient.vice('lambda-layer:')} complete!`);
  } catch (err) {
    console.log(err);
  }
}

program
  .description(
    "Build Lambda Layer, Build node awesome lambda layers with controls 🕹"
  )
  .argument('<dir>', 'lambda layer directory to build to')
  .option('--architectures [architectures...]', 'architectures for deployment to AWS')
  .option('--bucket <bucket>', 'bucket to deploy to using AWS')
  .option("-c, --config <config>", "path to a config file")
  .option('--deploy', 'deploy your lambda layer')
  .option('-n, --name <name>', 'lambda layer name')
  .option("--debug", "enable debugging")
  .option("-f, --files [files...]", "file glob pattern")
  .option("-i, --ignore [ignore...]", "ignore glob pattern")
  .option("--isTesting", "enable running fn tests w/o overwriting")
  .option('--noZip', 'don\'t zip lambda layer')
  .option('-o, --output <output>', 'output path')
  .option("-r, --rootDir <rootDir>", "root directory to start search")
  .option("--runner <runner>", "npm, pnpm, or yarn")
  .option('--runtimes [runtimes...]', 'runtimes for deployment to AWS')
  .option("-t, --isTestingCLI", "enable CLI only testing")
  .action(action)
  .parse(process.argv);

export { program };

#!/usr/bin/env node

import { program } from "commander";
import { cosmiconfigSync } from "cosmiconfig";
import script from "./script";
import { Options, ConfigResult } from "./interfaces";

export async function action(options: Options = {}): Promise<void> {
  // capture config data
  const explorer = cosmiconfigSync("");
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
  };

  // remove action level options
  const {
    config: usedConfig,
    searchPath: usedSearchPath,
    isTestingCLI,
    ...updatedOptions
  } = updatedConfig;

  if (options.isTestingCLI) {
    console.log({ options: { ...updatedOptions, config: updatedConfig } });
  }

  try {
    await script({ ...updatedOptions, config: usedConfig });
  } catch (err) {
    console.log(err);
  }
}

program
  .description(
    "Build Lambda Layer, Build node awesome lambda layers with controls 🕹"
  )
  .option("-c, --config <config>", "path to a config file")
  .option("--debug", "enable debugging")
  .option("-f, --files [files...]", "file glob pattern")
  .option("-i, --ignore [ignore...]", "ignore glob pattern")
  .option("--isTesting", "enable running fn tests w/o overwriting")
  .option("-r, --rootDir <rootDir>", "root directory to start search")
  .option("--runner <runner>", "npm, pnpm, or yarn")
  .option("-t, --isTestingCLI", "enable CLI only testing")
  .action(action)
  .parse(process.argv);

export { program };

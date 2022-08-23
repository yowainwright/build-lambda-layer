import { CosmiconfigResult } from "cosmiconfig/dist/types";

export interface Options {
  isTestingCLI?: boolean;
  isTesting?: boolean;
  files?: Array<string>;
  config?: string;
  rootDir?: string;
  ignore?: Array<string>;
  update?: boolean;
  debug?: boolean;
  silent?: boolean;
  searchPath?: string;
}

export type ConfigResult = { config: Options } & CosmiconfigResult;

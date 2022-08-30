import { CosmiconfigResult } from "cosmiconfig/dist/types";

export interface Options {
  architectures?: string[];
  bucket?: string;
  deploy?: boolean;
  isTestingCLI?: boolean;
  isTesting?: boolean;
  files?: Array<string>;
  config?: string;
  rootDir?: string;
  noZip?: boolean;
  ouput?: string;
  update?: boolean;
  debug?: boolean;
  silent?: boolean;
  searchPath?: string;
  runtimes?: string[];
}

export type ConfigResult = { config: Options } & CosmiconfigResult;

export interface CheckForUnsafeStrings {
  debug?: boolean;
  deps: Array<Record<string, string>>;
  dir: string;
  output: string;
  runner: string;
}

export interface Dependencies {
  [key: string]: string
}
export interface Config {
  ignore?: Array<string>;
  include?: Dependencies;
}

export interface LambdaLayerPackageJson {
  dependencies?: Dependencies;
  lambdaLayer?: Config;
}

export interface BuildLambda {
  architectures?: string[];
  bucket?: string;
  config?: Config;
  debug?: boolean;
  deploy?: boolean;
  dir: string;
  dest?: string;
  files?: Array<string>;
  ignore?: Array<string>;
  isTesting?: boolean;
  noZip?: boolean;
  output?: string;
  rootDir?: string;
  runner?: string;
  runtimes?: string[];
}


export interface InstallDeps {
  config?: Config;
  dir: string;
  dependencies: Dependencies;
  dest?: string;
  debug?: boolean;
  isTesting?: boolean;
  exec?: any;
  output?: string;
  runner?: string;
}

export interface DepsToInstall {
  debug?: boolean;
  dependencies: Dependencies;
  ignore?: Array<string>;
  include?: Dependencies;
}

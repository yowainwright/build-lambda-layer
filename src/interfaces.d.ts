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
export declare type ConfigResult = {
    config: Options;
} & CosmiconfigResult;
export interface Dependencies {
    [key: string]: string;
}
export interface Config {
    ignore?: Array<string>;
    include?: Dependencies;
}
export interface LambdaLayerPackageJson {
    dependencies?: Dependencies;
    lambdaLayer?: Config;
}
export interface GatherDeps {
    config?: Config;
    debug?: boolean;
    dest?: string;
    files?: Array<string>;
    ignore?: Array<string>;
    isTesting?: boolean;
    rootDir?: string;
    runner?: string;
}
export interface InstallDeps {
    config?: Config;
    dependencies: Dependencies;
    dest?: string;
    debug?: boolean;
    isTesting?: boolean;
    exec?: any;
    runner?: string;
}
export interface DepsToInstall {
    debug?: boolean;
    dependencies: Dependencies;
    ignore?: Array<string>;
    include?: Dependencies;
}

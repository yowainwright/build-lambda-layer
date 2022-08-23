/// <reference types="node" />
import { exec } from 'child_process';
import { DepsToInstall, GatherDeps, InstallDeps, LambdaLayerPackageJson } from "./interfaces";
/**
 * execPromise
 * @description interprets a cmd
 * @param {cmd} string
 * @returns {object}
 */
export declare const execPromise: typeof exec.__promisify__;
export declare function resolveJSON(path: string, debug?: boolean): LambdaLayerPackageJson | void;
export declare function depsToInstall({ dependencies, ignore, include, debug }: DepsToInstall): {
    name: string;
    version: string;
}[];
export declare function installDeps({ config, dependencies, dest, debug, isTesting, exec, runner, }: InstallDeps): Promise<{
    name: string;
    version: string;
}[]>;
export declare function gatherDeps({ config, debug, dest, files: matchers, ignore, isTesting, rootDir, runner, }: GatherDeps): Promise<{
    name: string;
    version: string;
}[]>;
export default gatherDeps;

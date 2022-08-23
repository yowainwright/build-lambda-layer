#!/usr/bin/env node
import { program } from "commander";
import { Options } from "./interfaces";
export declare function action(options?: Options): Promise<void>;
export { program };

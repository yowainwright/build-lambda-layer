#!/usr/bin/env node
import { program } from "./program";
import script, { gatherDeps } from "./script";

program;

export { gatherDeps };
export default script;

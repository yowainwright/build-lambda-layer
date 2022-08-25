import { promisify } from "util";
import { exec } from "child_process";
import { expect, test, vi } from 'vitest';
import { stdoutToJSON } from "stdouttojson";
import { cosmiconfigSync } from "cosmiconfig";
import { action } from "../src/program";

export const execPromise = promisify(exec);

vi.mock("cosmiconfig", () => {
  let _cache;
  const cosmiconfigSync = () => {
    if (_cache) return _cache;
    _cache = {
      load: vi.fn(() => ({
        config: { include: { foo: "bar" }, exclude: ['foo'] },
      })),
      search: vi.fn(() => ({
        config: { include: { foo: "bar" }, exclude: ['foo'] },
      })),
    };
    return _cache;
  };
  return { cosmiconfigSync };
});

vi.mock("../scripts", () => ({
  script: vi.fn(),
}));

test("w/ no config reference", async () => {
  const { stdout = "{}" } = await execPromise(
    "ts-node ./src/program.ts --isTestingCLI --files 'package.json'"
  );

  const result = stdoutToJSON(stdout);

  expect(result).toStrictEqual({
    options: { files: ["package.json"] },
  });
});

test('w/ options', async () => {
  const { stdout = "{}" } = await execPromise(
    "ts-node ./src/program.ts --isTestingCLI --debug --files 'package.json'"
  );

  const result = stdoutToJSON(stdout);

  expect(result).toStrictEqual({
    options: { debug: "true", files: ["package.json"] }
  });
});

test('w/ search path', async () => {
  const { stdout = "{}" } = await execPromise(
    "ts-node ./src/program.ts --isTestingCLI --debug --config './tests/.lambdaLayerrc'"
  );

  const result = stdoutToJSON(stdout);

  expect(result).toStrictEqual({
    options: { debug: "true", exclude: ['gradient-string'], include: { lodash: "latest" } }
  });
});

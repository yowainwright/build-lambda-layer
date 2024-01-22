import * as assert from "assert";
import JSON from "json5";
import { execFilePromise } from "../src/script";

async function testNoConfigReference() {
  const stdout = await execFilePromise(
    "tsx", ["./src/program.ts", "foo", "--isTestingCLI", "--files", "package.json"],
  );

  const result = JSON.parse(stdout);

  assert.deepStrictEqual(result, {
    options: { dir: 'foo', files: ["package.json"] },
  });
}

async function runTests() {
  await testNoConfigReference();
  // Add calls to other test functions here
  console.log("All tests passed!");
}

runTests().catch((err) => {
  console.error("A test failed:", err);
  process.exit(1);
});

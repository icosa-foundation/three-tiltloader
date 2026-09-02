import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));
const declared = packageJson.dependencies["three-icosa"];

assert.match(declared, /\/archive\/[0-9a-f]{40}\.tar\.gz$/);
assert.equal(packageLock.packages[""].dependencies["three-icosa"], declared);
assert.equal(packageLock.packages["node_modules/three-icosa"].resolved, declared);

console.log("Library dependency pin is aligned.");

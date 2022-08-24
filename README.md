# Build Lambda Layer

![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
![ci](https://github.com/yowainwright/build-lambda-layer/actions/workflows/ci.yml/badge.svg)
[![npm](https://img.shields.io/npm/v/build-lambda-layer)](https://www.npmjs.com/package/build-lambda-layer)
[![Github](https://badgen.net/badge/icon/github?icon=github&label&color=black)](https://github.com/yowainwright/build-lambda-layer)

### Builds Awesome Node Lambda Layers with Control! 🕹

_Build Lambda Layer_ is a small utility CLI for building Lambda Layers with control for AWS Node Lambda projects.

---

### Why is this written?

_Build Lambda Layer_ is built to take any consideration out of the _seemingly_ simple task of building a lambda layer.<br>
Sure, you could do it manually but why when _Build Lambda Layer_ will get it done it for you!

---

### Do I get any other benefits?

Yes! _Build Lambda Layer_ is built to assist with optimizing your node lambda layer builds, it:

- Works with and for monorepos
- Provides `ignore` and `include` support

---

### Install

```sh
pnpm install build-lambda-layer
```

---

### Usage

Build Lambda Layer is built to work as a CLI.

#### Easy mode

```sh
install-layer
```

---

#### Full API

```sh
Usage: build-layer [options]

Build Lambda Layer, Build node awesome lambda layers with controls 🕹

Options:
-c, --config <config> path to a config file
--debug enable debugging
-f, --files [files...] file glob pattern
-i, --ignore [ignore...] ignore glob pattern
--isTesting enable running fn tests w/o overwriting
-r, --rootDir <rootDir> root directory to start search
--runner <runner> npm, pnpm, or yarn
-t, --isTestingCLI enable CLI only testing
-h, --help display help for command
```

---

### Roadmap

- Tests (should come tomorrow)
- Full AWS CLI integration

---

Made by [@yowainwright](https://github.com/yowainwright) for fun with passion! MIT, 2022 🐝

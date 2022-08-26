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
build-layer <dir>
```

#### Full API

```sh
Usage: build-layer [options] <dir>

Build Lambda Layer, Build node awesome lambda layers with controls 🕹

Arguments:
  dir                                 lambda layer directory to build to

Options:
  --architectures [architectures...]  architectures for deployment to AWS
  --bucket <bucket>                   bucket to deploy to using AWS
  -c, --config <config>               path to a config file
  --deploy                            deploy your lambda layer
  -n, --name <name>                   lambda layer name
  --debug                             enable debugging
  -f, --files [files...]              file glob pattern
  -i, --ignore [ignore...]            ignore glob pattern
  --isTesting                         enable running fn tests w/o overwriting
  --noZip                             don't zip lambda layer
  -o, --output <output>               output path
  -r, --rootDir <rootDir>             root directory to start search
  --runner <runner>                   npm, pnpm, or yarn
  --runtimes [runtimes...]            runtimes for deployment to AWS
  -t, --isTestingCLI                  enable CLI only testing
  -h, --help                          display help for command
```

---

## Recipes

##### Debugging

Gets you logging in your terminal

```sh
build-layer <dir> --debug
```

##### No Zip

Just build you a directory

```sh
build-layer <dir> --noZip
```

##### Customer runner

Build everything with a runner besides `npm`. Options are `npm`, `pnpm`, or `yarn`

```sh
build-layer <dir> --runner 'pnpm'
```

##### AWS Deploy

Assumes you're authenticated and have the AWS CLI

```
build-layer <dir> --bucket <bucket> --runtimes [runtimes...] --architectures [architectures...]
```

---

Made by [@yowainwright](https://github.com/yowainwright) for fun with passion! MIT, 2022

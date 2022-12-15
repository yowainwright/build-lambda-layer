# Build Lambda Layer

![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
![ci](https://github.com/yowainwright/build-lambda-layer/actions/workflows/ci.yml/badge.svg)
[![npm](https://img.shields.io/npm/v/build-lambda-layer)](https://www.npmjs.com/package/build-lambda-layer)
[![Github](https://badgen.net/badge/icon/github?icon=github&label&color=black)](https://github.com/yowainwright/build-lambda-layer)

### Builds Awesome Node Lambda Layers with Control! 🕹

_Build Lambda Layer_ is a utility CLI for building AWS Lambda Layers with control for AWS Node Lambda projects.

---

## Why is this written?

### _Build Lambda Layer takes complexity out of building lambda layers!_

---

### + Monorepo support<br>+ The ability to ignore and add dependencies at run time<br>+ Easy json configuration!

---

By running:

```sh
build-layer <your-lambda-layer>
```

_Build Lambda Layer_ will:

- install all `package.json` dependencies to `<your-lambda-layer>`, and
- zip it up to be uploaded to AWS 🚀

---

#### Additionally, _Build Lambda Layer_ works with monorepos!

A key additional feature that Build Lambda Layer provides is that it works with monorepos!

By running:

```sh
build-layer my-lambda-layer --files 'packages/**/package.json'
```

_Build Lambda Layer_ will:

- install all `package/**/package.json` dependencies to your lambda layer, and
- zip it up to be uploaded to AWS

---

#### Ignore and include the dependencies you want!

_Build Lambda Layer_ supports specificity with `ignore` and `include` options.

By adding a `"lambdaLayer"` object to a `package.json` file you're building from, you can specify packages to `ignore` and `include`:

```json
{
  "buildLambda": {
    "ignore": ["@types/aws-lambda"],
    "include": {
      "aws-lambda": "latest"
    }
  }
}
```

You can also add a `lambdaLayerrc` file to your project root if you want to preserve your `package.json` file.

```json
{
  "ignore": ["@types/aws-lambda"],
  "include": {
    "aws-lambda": "latest"
  }
}
```

---

#### Be _really_ selective with your installs

There is nothing stopping you from creating your own dependency object to install.

Add a `<your-dependencies>.json` file to your project root:

```json
{
  "dependencies": {
    "aws-lambda": "latest"
  }
}
```

And run:

```sh
build-layer my-lambda-layer --files '<your-dependencies>.json'
```

---

That's it! 🎉

Save yourself the time and effort of building Lambda Layers and let _Build Lambda Layer_ do it for you!

---

### Install

```sh
pnpm install build-lambda-layer
```

---

### CLI API

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

##### Custom runner

Build everything with a runner besides `npm`. Options are `npm`, `pnpm`, or `yarn`

```sh
build-layer <dir> --runner 'pnpm'
```

##### AWS Deploy

Assumes you're authenticated, have the AWS CLI, and have already deployed the layer to S3.
AKA, implemented but not actively guaranteed to work!

```
build-layer <dir> --bucket <bucket> --runtimes [runtimes...] --architectures [architectures...]
```

---

Made by [@yowainwright](https://github.com/yowainwright) for fun with passion! MIT, 2022

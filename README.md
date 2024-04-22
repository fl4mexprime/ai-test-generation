# ai-test-generation

A tool aimed at providing easy means to ensure maintainability of frontend code

---

## Overview

1. [Prerequisite](#prerequisite)
2. [Getting started](#getting-started)
3. [Functionality](#functionality)
   1. [Generate tests](#generate-tests)
   2. [Run tests (local)](#run-tests-local)
   3. [Run tests (CI)](#run-tests-ci)
4. [Configuration](#configuration)

---

## Prerequisite

* Currently you'll have to provide your own `Api-Key` for use with `api.openai.com`
* `jest` is needed to run the generated tests on you machine as well as when building in you CI-pipeline. Consult the docs for configuration

## Getting started

```bash
npm install ai-test-generation
```

After successfully installing the package, you'll need to add the following to your package.json

```json
"ai-test-generation": {
  "api-key": {"YOU-API-KEY"}
}
```

As well as these scripts, to be able to use all functionality

```json
"scripts": {
  "generate-tests": "node node_modules/ai-test-generation/index.js"
  "test": "jest --watchAll --collect-coverage --coverage --coverageDirectory='coverage' --detectOpenHandles",
  "test-ci": "jest --collect-coverage --coverage --coverageDirectory='coverage'",
}
```
## Functionality

### Generate tests

```bash
npm run generate-tests
```
If you don't have a folder named `tests` then you will have following output.
This lets you create a folder to store your tests within you project

```
tests directory (tests) not found or naming is mismatched
Create folder in project src now? (y/n):
```

This is to consent that directories of your project will be searched.
This may list other directories besides `utils` depending on you project and config

```
Following directories will be searched: [utils] Continue? (y/n):
```
After confirming you are presented with this output.
This indicates what file is being queried and what the current (overall) progress is.
Files that already have tests will not be re-run.

```
[==================      036%                        ]
jwt.ts
```

After successful completion you'll get a output outlining the results.

```
Added 25 Tests in 117.074 seconds. Check each test-file for errors and run 'jest' to verify the results.
```

### Run tests (local)

```bash
npm run test
```

* This will run each test in the `tests` folder
* File changes will trigger a re-run of the tests
* A coverage report is generated which includes useful information for further testing. 
(Don't commit this, since during the build process a new report is generated)

### Run tests (CI)

```bash
npm run test-ci
```

You should not use this on your machine. Add a step in you build process that runs this script during deployment. The specific implementation varies by platform.

* This will run each test in the `tests` folder
* Arguments not needed for CI have been removed (file-watcher, detection of open handles, etc...)

## Configuration

### Model

Choose a model to use (Currently limited to models from `api.openai.com`)

```json
{
   "model": "gpt-3.5-turbo"
}
```

### Tests directory

What directory should the tests be placed

```json
{
   "tests-directory": "tests"
}
```

### Ignored directories

These are the directories that are not included when generating tests

```json
{
   "ignored-directories": [
      "api",
      "types",
      "interfaces",
      "redux-modules"
   ]
}
```

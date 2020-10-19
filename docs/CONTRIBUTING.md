# Contributing

We're really glad you're reading this, because we need volunteers to help this project.

## Prerequisites

You will need node and yarn installed on your computer to run the code. And git to download it:

- [node](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/)
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## Download the code

To download the code, use git:

```bash
git clone https://github.com/tonaljs/tonal
yarn install
yarn build
```

## Development

Modules are written in Typescript and live inside `packages/` folder.

If you are adding new functionality or fixing a bug, please add a test for it.

**Run test and build the library before submitting a pull request :pray:**

```bash
yarn test:ci
```

### How to add a new module

To create a new module:

- Add a new folder inside packages: `packages/my-module`
- Add a new package.json inside the folder (see any of them as an example)
- Add required dependencies to "dependencies" inside package.json. Ensure correct dependency versions. For example, if your module needs to use `tonal/core` look at core's package.json to see what version to use
- After adding your dependencies, use lerna to wire them up: run `yarn lerna` at root folder
- Add your functionality and tests
- Ensure everything works: run `yarn test:ci` at root folder
- Create a pull request

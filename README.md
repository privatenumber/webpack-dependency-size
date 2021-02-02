<h1>
	👩‍🔬 Webpack Dependency Size Plugin
	<a href="https://npm.im/webpack-dependency-size"><img src="https://badgen.net/npm/v/webpack-dependency-size"></a>
	<a href="https://npm.im/webpack-dependency-size"><img src="https://badgen.net/npm/dm/webpack-dependency-size"></a>
	<a href="https://packagephobia.now.sh/result?p=webpack-dependency-size"><img src="https://packagephobia.now.sh/badge?p=webpack-dependency-size"></a>
</h1>

[Webpack](https://webpack.js.org) plugin to get an overview of bundled dependencies and their size.

## :raising_hand: Why?
- 📦 **Only Dependencies** Get insight into the blackbox!
- 🔥 **Fast** Only analyzes the bare minium!
- 👀 **JSON Output** Formatted, sorted, and portable!
- 🙈 **No distractions** Ignore application code!

## :rocket: Install
```sh
npm i -D webpack-dependency-size
```

## 👩‍🏫 Basic Usage
In your Webpack config:
```js
// 1. Import plugin
const DependencySize = require('webpack-dependency-size');

module.exports = {
	...,

	plugins: [
		// 2. Add to plugins array
		new DependencySize()
	]
};
```

### Options
Pass in an options object to configure:
```js
new DependencySize({
	// Options
	gzip: true
})
```
- `outputPath` (`dependency-size.json`) JSON output path relative to Webpack output directory (`output.path`)
- `gzip` (`false`) Calculate gzipped size
- `indent` (2 spaces) JSON output indentation

## 📋 Output

### Schema
- `[package path]` bundled-in package (sorted by `size`)
  - `size` human-readable net import size from package
  - `files` specific files imported from the package (sorted by `size`)
    - `filepath` bundled-in file
    - `size` human-readable size
    - `reasons` request sources

### Example

> Tip: If the output is too large, I recommend using [fx](https://github.com/antonmedv/fx) to navigate the JSON

```json5
[
  {
    "dependencyPath": "./node_modules/axios",
    "size": "40.15 KB",
    "files": [
      {
        "filepath": "./node_modules/axios/lib/utils.js",
        "size": "8.61 KB",
        "reasons": [
          "./node_modules/axios/lib/adapters/xhr.js",
          ...
        ]
      },
      ...
    ]
  },
  {
    "dependencyPath": "./node_modules/lodash",
    "size": "25.37 KB",
    "files": [
      {
        "filepath": "./node_modules/lodash/_deburrLetter.js",
        "size": "3.33 KB",
        "reasons": [
          "./node_modules/lodash/deburr.js"
        ]
      },
      ...
    ]
  },
  ...
]
```

## 👨‍👩‍👦‍👦 Related

- [webpack-distsize](https://github.com/privatenumber/webpack-distsize) - Track Webpack output size via version control
- [webpack-analyze-duplication-plugin](https://github.com/privatenumber/webpack-analyze-duplication-plugin) - Webpack plugin to detect duplicated modules


## 💼 License
MIT

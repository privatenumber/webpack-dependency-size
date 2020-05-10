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
- 👀 **JSON Output** Pre-formatted and portable!
- 🙈 **No distractions** Ignore application code!

## :rocket: Install
```sh
npm i webpack-dependency-size
```

## Basic Usage
In your Webpack config:
```js
// 1. Import plugin
const DependencySize = require('webpack-dependency-size');

module.exports = {
	...,

	plugins: [
		// 2. Add to plugins array
		new DependencySize({
			// Options
		}),
	]
};
```

### Options

- `outputPath` (`dependency-size.json`) JSON output path relative to Webpack output directory (`output.path`)
- `gzip` (`false`) Calculate gzipped size
- `indent` (2 spaces) JSON output indentation

## Output

### Schema
- `[package path]` bundled-in package
  - `size` human-readable net import size from package
  - `files`
    - `filepath` bundled-in file
    - `size` human-readable size
    - `reasons` request sources

### Example
```json5
{
  "./node_modules/axios": {
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
  "./node_modules/lodash": {
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
}
```

## License
MIT

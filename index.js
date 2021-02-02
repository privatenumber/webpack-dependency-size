const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const byteSize = require('byte-size');
const gzipSize = require('gzip-size');

// Strips loaders (!) and " + n modules" suffix
const getFilepath = name => name && name.split('!').pop().replace(/ \+.+$/, '');

// Gets the dependency name
const ptrn = /^(.*node_modules\/(@[^/]+\/)?[^/]+)/;
const getDepName = filepath => _.head(filepath.match(ptrn));

const statsOptions = {
	assets: false,
	builtAt: false,
	moduleAssets: false,
	moduleTrace: false,
	cachedAssets: false,
	children: false,
	chunks: false,
	chunkGroups: false,
	chunkModules: false,
	chunkRootModules: false,
	chunkOrigins: false,
	source: false,
	performance: false,
	providedExports: false,
	errors: false,
	errorDetails: false,
	errorStack: false,
	entrypoints: false,
	warnings: false,
	outputPath: false,
	hash: false,
	publicPath: false,
	timings: false,
	version: false,
	logging: 'none',
};

class DependencySizePlugin {
	constructor({
		outputPath = 'dependency-size.json',
		gzip = false,
		indent = '  ',
	} = {}) {
		this.outputPath = outputPath;
		this.gzip = gzip;
		this.indent = indent;
	}

	apply(compiler) {
		this.compiler = compiler;
		const analyzeStats = this.analyzeStats.bind(this);

		if (compiler.hooks) {
			compiler.hooks.done.tapAsync('webpack-dependency-size', analyzeStats);
		} else {
			compiler.plugin('done', analyzeStats);
		}
	}

	getDependencyModules({ modules }) {
		return modules
			.map((_module) => {
				const filepath = getFilepath(_module.name);
				if (!ptrn.test(filepath)) {
					return;
				}

				let { size } = _module;
				if (this.gzip) {
					if (typeof _module.source === 'string') {
						size = gzipSize.sync(_module.source);
					} else if (Array.isArray(_module.modules)) {
						// eslint-disable-next-line unicorn/no-reduce
						size = _module.modules.reduce(
							(totalSize, { source }) => totalSize + gzipSize.sync(source),
							0,
						);
					} else {
						try {
							const fsSource = fs.readFileSync(path.resolve(this.compiler.context, filepath));
							size = gzipSize.sync(fsSource);
						} catch {
							console.warn(`Failed to calculate gzip size for "${filepath}". Using original size ${byteSize(size)}.`);
						}
					}
				}

				return {
					filepath,
					size,
					reasons: _.uniq(_module.reasons.map(r => getFilepath(r.moduleName))).sort(),
				};
			})
			.filter(Boolean);
	}

	analyzeStats(stats, callback = _.noop) {
		const statsJson = stats.toJson({
			...statsOptions,
			source: this.gzip,
		});

		const dependencyModules = this.getDependencyModules(statsJson);
		const groupedDependencyModules = {};
		dependencyModules.forEach((m) => {
			const depName = getDepName(m.filepath);

			if (!groupedDependencyModules[depName]) {
				groupedDependencyModules[depName] = {
					size: 0,
					files: [],
				};
			}

			groupedDependencyModules[depName].size += m.size;
			groupedDependencyModules[depName].files.push(m);
		});

		const dependencyReport = _(groupedDependencyModules)
			.toPairs()
			.orderBy(['1.size'], ['desc'])
			.map((dep) => {
				dep[1].size = byteSize(dep[1].size).toString();
				dep[1].files
					.sort((a, b) => b.size - a.size)
					.forEach((f) => {
						f.size = byteSize(f.size).toString();
					});

				return dep;
			})
			.fromPairs()
			.value();

		this.writeData(dependencyReport, callback);
	}

	writeData(data, callback) {
		// eslint-disable-next-line node/prefer-promises/fs
		fs.writeFile(
			path.resolve(this.compiler.outputPath, this.outputPath),
			JSON.stringify(data, null, this.indent),
			callback,
		);
	}
}

module.exports = DependencySizePlugin;

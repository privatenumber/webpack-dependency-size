const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const filesize = require('filesize');
const gzipSize = require('gzip-size');

// Strips loaders (!) and " + n modules" suffix
const getFilepath = name => name && name.split('!').pop().replace(/ \+.+$/, '');

// Gets the dependency name
const ptrn = /^(.*node_modules\/(@[^\/]+\/)?[^\/]+)/;
const getDepName = filepath => _.head(filepath.match(ptrn));

const statsOpts = {
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
			.map((m) => {
				const filepath = getFilepath(m.name);
				if (!filepath.startsWith('./node_modules/')) { return; }

				let { size } = m;
				if (this.gzip) {
					if (typeof m.source === 'string') {
						size = gzipSize.sync(m.source);
					} else if (Array.isArray(m.modules)) {
						size = m.modules.reduce((s, m) => (s + gzipSize.sync(m.source)), 0);
					} else {
						try {
							const fsSource = fs.readFileSync(path.resolve(this.compiler.context, filepath));
							size = gzipSize.sync(fsSource);
						} catch (err) {
							console.warn(`Failed to calculate gzip size for "${filepath}". Using original size ${filesize(size)}.`);
						}
					}
				}

				return {
					filepath,
					size,
					reasons: _.uniq(m.reasons.map(r => getFilepath(r.moduleName))).sort(),
				};
			})
			.filter((m) => m);
	}

	analyzeStats(stats, cb = _.noop) {
		const statsJson = stats.toJson({
			...statsOpts,
			source: this.gzip,
		});

		let deps = this.getDependencyModules(statsJson)
			.reduce((deps, m) => {
				const depName = getDepName(m.filepath);

				if (!deps[depName]) {
					deps[depName] = {
						size: 0,
						files: [],
					};
				}

				deps[depName].size += m.size;
				deps[depName].files.push(m);

				return deps;
			}, {});

		deps = _(deps)
			.toPairs()
			.orderBy(['1.size'], ['desc'])
			.map((dep) => {
				dep[1].size = filesize(dep[1].size);
				dep[1].files
					.sort((a, b) => b.size - a.size)
					.forEach((f) => {
						f.size = filesize(f.size);
					});

				return dep;
			})
			.fromPairs()
			.value();

		this.writeData(deps, cb);
	}

	writeData(data, cb) {
		fs.writeFile(
			path.resolve(this.compiler.outputPath, this.outputPath),
			JSON.stringify(data, null, this.indent),
			cb
		);
	}
}

module.exports = DependencySizePlugin;

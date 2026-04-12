import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

const execFileAsync = promisify(execFile);

const yalcPushPlugin = (watchMode) => ({
	name: 'yalc-push',
	async writeBundle() {
		if (!watchMode) {
			return;
		}

		await execFileAsync('node', ['./scripts/generate-types.mjs']);
		await execFileAsync('yalc', ['publish', '--push']);
	},
});

export default (commandLineArgs) => ({
	input: 'src/exports.js',
	output: {
		file: 'dist/index.js',
		format: 'esm',
		sourcemap: true,
		generatedCode: {constBindings: true},
	},
	plugins: [
		resolve({
			browser: true,
			preferBuiltins: false,
		}),
		babel({
			babelHelpers: 'bundled',
			exclude: /node_modules/,
			presets: [
				['@babel/preset-react', {runtime: 'automatic'}],
			],
		}),
		yalcPushPlugin(Boolean(commandLineArgs.watch)),
	],
	external: ['react', 'react/jsx-runtime', 'poon-router'],
});

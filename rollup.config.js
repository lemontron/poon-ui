import resolve from '@rollup/plugin-node-resolve';
import multiEntry from '@rollup/plugin-multi-entry';
import babel from '@rollup/plugin-babel';

export default {
	input: 'src/**/*.js',
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
		multiEntry(),
	],
	external: ['react', 'react/jsx-runtime', 'poon-router'],
};

import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import multiEntry from '@rollup/plugin-multi-entry';

export default () => ({
	input: ['src/**/*.js'],
	watch: {
		exclude: ['dist/**'],
	},
	output: {
		file: 'dist/index.js',
		format: 'esm',
		sourcemap: true,
		generatedCode: {constBindings: true},
	},
	plugins: [
		multiEntry(),
		resolve({browser: true, preferBuiltins: false}),
		babel({
			babelHelpers: 'bundled',
			exclude: /node_modules/,
			presets: [['@babel/preset-react', {runtime: 'automatic'}]],
		}),
	],
	external: ['react', 'react/jsx-runtime', 'poon-router'],
});

import resolve from '@rollup/plugin-node-resolve';
import multiEntry from '@rollup/plugin-multi-entry';
import babel from '@rollup/plugin-babel';

export default {
	input: 'src/**/*.js',
	output: {
		name: 'poon-ui',
		file: 'dist/index.js',
		format: 'esm',
		generatedCode: {constBindings: true},
	},
	plugins: [
		resolve(),
		babel({
			babelHelpers: 'bundled',
			presets: [
				['@babel/preset-react', {'useBuiltIns': true}],
			],
		}),
		multiEntry(),
	],
	external: ['poon-router', 'react'],
};

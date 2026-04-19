import { c } from './util';
import { normalizeOptions } from './util/options.js';

export const Select = ({title, options, value, disabled, autoComplete, onChangeValue}) => (
	<select
		className={c('text select', disabled && 'disabled')}
		onChange={e => onChangeValue(e.target.value)}
		value={value}
		disabled={disabled}
		autoComplete={autoComplete}
	>
		{title ? <option disabled children={title}/> : null}
		{normalizeOptions(options).options.map(r => (
			<option key={r._id} value={r._id} children={r.name}/>
		))}
	</select>
);
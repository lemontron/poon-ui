import { c } from './util';

export const FormGroup = ({title, subtitle, children, inset, padding, RightComponent}) => (
	<div className={c('form-group', inset && 'inset', padding && 'padding')}>
		{title ? (
			<div className="form-group-top">
				<div className="form-group-header">
					<label>{title}</label>
					{RightComponent}
				</div>
				{subtitle ? <div className="meta">{subtitle}</div> : null}
			</div>
		) : null}
		<div className="form-group-body">{children}</div>
	</div>
);
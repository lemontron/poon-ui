import { c } from './util';

export const FormGroup = ({title, subtitle, children, well, padding, frame, RightComponent}) => (
	<div className={c('form-group', well && 'well', padding && 'padding', frame && 'frame')}>
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
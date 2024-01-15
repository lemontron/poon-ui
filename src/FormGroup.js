import React, { Fragment } from 'react';

export const FormGroup = ({title, children}) => (
	<div className="form-group">
		<label>{title}</label>
		{children}
	</div>
);
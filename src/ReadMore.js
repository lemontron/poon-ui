import React from 'react';
import { Touchable } from './Touchable.js';
import { showAlert } from './Alert.js';

export const ReadMore = ({content}) => {
	if (!content) return null;

	const showMore = () => showAlert({'message': content});

	return (
		<div className="read-more">
			<div className="read-more-content">{content}</div>
			<Touchable onClick={showMore} className="read-more-button" children="MORE"/>
		</div>
	);
};
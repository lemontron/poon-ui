import { c } from './util/index.js';
import { VStack } from './Stack.js';
import { Touchable } from './Touchable.js';
import { Icon } from './Icon.js';

export const ChatBubble = ({role, text, disabled, ButtonsComponent, onPressMore}) => (
	<VStack
		disabled={disabled}
		align={role === 'user' ? 'trailing' : 'leading'}
		padding="horizontal"
		spacing
		className="chat-bubble"
	>
		<div
			className={c('chat-bubble-text', (role === 'user') ? 'user' : 'external')}>{text}</div>
		{ButtonsComponent ? <div className="chat-bubble-toolbar">{ButtonsComponent}</div> : null}
		{onPressMore ? (
			<Touchable
				onClick={onPressMore}
				children={<Icon icon="more_vert"/>}
			/>
		) : null}
	</VStack>
);
import { c } from './util/index.js';
import { HStack } from './Stack.js';
import { Touchable } from './Touchable.js';
import { Icon } from './Icon.js';

export const ChatBubble = ({role, text, disabled, onPressMore}) => (
	<HStack
		disabled={disabled}
		spacing
		className="chat-bubble-wrapper"
	>
		<div className={c('chat-bubble', role === 'user' ? 'chat-bubble-user' : 'chat-bubble-external')}>
			<div className="chat-bubble-text">{text}</div>
		</div>
		{onPressMore ? (
			<Touchable
				onClick={onPressMore}
				children={<Icon icon="more_vert"/>}
			/>
		) : null}
	</HStack>
);
import { c } from './util/index.js';
import { TouchableHighlight } from './TouchableHighlight.js';

export const ChatBubble = ({role, text, disabled, onClick}) => (
	<TouchableHighlight
		onClick={onClick}
		disabled={disabled}
		className={c('chat-bubble', role === 'user' ? 'chat-bubble-user' : 'chat-bubble-external')}
	>
		<div className="chat-bubble-body">
			<div className="chat-bubble-text">{text}</div>
		</div>
	</TouchableHighlight>
);
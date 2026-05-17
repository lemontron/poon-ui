import { VStack } from './Stack.js';
import { Markdown } from './Markdown.js';

export const Bubble = ({role, text, date, disabled, ButtonsComponent, HeaderComponent}) => (
	<VStack
		disabled={disabled}
		align={role === 'user' ? 'trailing' : 'leading'}
		padding="horizontal"
		spacing
	>
		<div className={`bubble-content bubble-${role}`}>
			{HeaderComponent}
			<Markdown content={text}/>
			{(date && role !== 'assistant') ? <div className="bubble-timestamp">{date.toLocaleString()}</div> : null}
		</div>
		{ButtonsComponent ? <div className="bubble-toolbar">{ButtonsComponent}</div> : null}
	</VStack>
);

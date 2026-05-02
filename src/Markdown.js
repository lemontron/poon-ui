import { createElement } from 'react';
import { Markdown as PoonMarkdown } from 'poon-markdown';
import { Touchable } from './Touchable';

export const Markdown = props => createElement(PoonMarkdown, {...props, link: Touchable});

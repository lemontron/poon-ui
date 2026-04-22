import { createElement } from 'react';
import { Touchable } from './Touchable';

/**
 * @typedef {object} MarkdownProps
 * @property {string} [content]
 */

const renderInline = (text, keyPrefix) => {
	const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
	return parts.filter(Boolean).map((part, index) => {
		if (part.startsWith('`') && part.endsWith('`')) {
			return createElement('code', {key: `${keyPrefix}-code-${index}`}, part.slice(1, -1));
		}

		if (part.startsWith('**') && part.endsWith('**')) {
			return createElement('strong', {key: `${keyPrefix}-strong-${index}`}, part.slice(2, -2));
		}

		const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
		if (linkMatch) {
			return createElement(Touchable, {
				key: `${keyPrefix}-link-${index}`,
				href: linkMatch[2],
			}, linkMatch[1]);
		}

		return part;
	});
};

/** @param {MarkdownProps} props */
export const Markdown = ({content}) => {
	if (!content) return null;

	const lines = content.split('\n');
	const elements = [];

	let currentUnorderedListItems = [];
	let currentOrderedListItems = [];
	let codeBlockLines = null;

	const pushCurrentLists = (index) => {
		if (currentUnorderedListItems.length > 0) {
			elements.push(createElement('ul', {key: `ul-${index}`}, currentUnorderedListItems));
			currentUnorderedListItems = [];
		}

		if (currentOrderedListItems.length > 0) {
			elements.push(createElement('ol', {key: `ol-${index}`}, currentOrderedListItems));
			currentOrderedListItems = [];
		}
	};

	const pushCodeBlock = (index) => {
		if (codeBlockLines !== null) {
			elements.push(
				createElement('pre', {key: `code-${index}`}, codeBlockLines.join('\n')),
			);
			codeBlockLines = null;
		}
	};

	const isSeparator = (line) => {
		const trimmed = line.trim();
		return (
			trimmed === '<hr>' ||
			trimmed === '<hr/>' ||
			trimmed === '<hr />' ||
			/^(\*\s*){3,}$/.test(trimmed) ||
			/^(-\s*){3,}$/.test(trimmed) ||
			/^(_\s*){3,}$/.test(trimmed)
		);
	};

	const orderedListMatch = (line) => line.match(/^(\d+)\.\s+(.*)$/);

	lines.forEach((line, index) => {
		const key = `${index}-${line}`;
		const twoLinesBack = index > 1 ? lines[index - 2] : null;
		const previousLine = index > 0 ? lines[index - 1] : null;
		const nextLine = index < lines.length - 1 ? lines[index + 1] : null;
		if (line.startsWith('```')) {
			pushCurrentLists(index);
			if (codeBlockLines === null) {
				codeBlockLines = [];
			} else {
				pushCodeBlock(index);
			}
		} else if (codeBlockLines !== null) {
			codeBlockLines.push(line);
		} else if (line.startsWith('# ')) {
			pushCurrentLists(index);
			elements.push(createElement('h1', {'key': key}, renderInline(line.slice(2), key)));
		} else if (line.startsWith('## ')) {
			pushCurrentLists(index);
			elements.push(createElement('h2', {'key': key}, renderInline(line.slice(3), key)));
		} else if (line.startsWith('### ')) {
			pushCurrentLists(index);
			elements.push(createElement('h3', {'key': key}, renderInline(line.slice(4), key)));
		} else if (isSeparator(line)) {
			pushCurrentLists(index);
			elements.push(createElement('hr', {'key': key}));
		} else if (line.startsWith('- ')) {
			if (currentOrderedListItems.length > 0) {
				pushCurrentLists(index);
			}
			currentUnorderedListItems.push(createElement('li', {'key': key}, renderInline(line.slice(2), key)));
		} else if (orderedListMatch(line)) {
			if (currentUnorderedListItems.length > 0) {
				pushCurrentLists(index);
			}
			const match = orderedListMatch(line);
			currentOrderedListItems.push(createElement('li', {'key': key}, renderInline(match[2], key)));
		} else if (line.trim() === '') {
			pushCurrentLists(index);
			const twoBackIsBlank = (twoLinesBack || '').trim() === '';
			const previousIsBlank = (previousLine || '').trim() === '';
			if (
				!twoBackIsBlank &&
				previousIsBlank &&
				!isSeparator(previousLine || '') &&
				!isSeparator(nextLine || '')
			) {
				elements.push(createElement('br', {'key': key}));
			}
		} else {
			pushCurrentLists(index);
			elements.push(createElement('p', {'key': key}, renderInline(line, key)));
		}
	});

	pushCurrentLists(lines.length);
	pushCodeBlock(lines.length);

	return elements;
};

import { useEffect, useRef, useState } from 'react';
import { c } from './util';
import { ActivityIndicator } from './ActivityIndicator';
import { Icon } from './Icon';

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => resolve(reader.result);
	reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
	reader.readAsDataURL(file);
});

/**
 * @typedef {object} ImageUploadProps
 * @property {string[] | string} [acceptableFileTypes]
 * @property {(files: File[] | File | string[] | string) => void} [onDrop]
 * @property {import('react').ReactNode} [background]
 * @property {import('react').ReactNode} [children]
 * @property {string} [className]
 * @property {boolean} [loading]
 * @property {boolean} [multiSelect]
 * @property {boolean} [callbackDataUrl]
 * @property {string} [title]
 * @property {string} [message]
 */

/** @param {ImageUploadProps} props */
export const ImageUpload = ({
	acceptableFileTypes = ['image/*'],
	onDrop,
	background,
	children,
	className,
	loading,
	multiSelect = false,
	callbackDataUrl = false,
}) => {
	const inputRef = useRef();
	const [dropping, setDropping] = useState(false);
	const [previewUrl, setPreviewUrl] = useState('');

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const emitFiles = async (inputFiles) => {
		let files = Array.from(inputFiles || []);
		if (!files.length) return;
		if (!multiSelect) files = [files[0]];
		const file = files[0];
		if (file?.type?.startsWith('image/')) {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(URL.createObjectURL(file));
		}
		if (!onDrop) return;
		if (callbackDataUrl) {
			const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
			return onDrop(multiSelect ? dataUrls : dataUrls[0]);
		}
		return onDrop(multiSelect ? files : files[0]);
	};

	return (
		<button
			type="button"
			className={c('image-upload', dropping && 'dropping', loading && 'loading', className)}
			onClick={() => inputRef.current?.click()}
			onDragOver={(e) => e.preventDefault()}
			onDragEnter={(e) => {
				e.preventDefault();
				setDropping(true);
			}}
			onDragLeave={(e) => {
				e.preventDefault();
				setDropping(false);
			}}
			onDrop={(e) => {
				e.preventDefault();
				setDropping(false);
				emitFiles(e.dataTransfer?.files);
			}}
		>
			<input
				ref={inputRef}
				className="image-upload-input"
				type="file"
				accept={acceptableFileTypes}
				multiple={multiSelect}
				onChange={async (e) => {
					await emitFiles(e.target.files);
					e.target.value = '';
				}}
			/>
			<div
				className="image-upload-surface"
				style={previewUrl ? {'backgroundImage': `url(${previewUrl})`} : undefined}
			>
				{!previewUrl ? background : null}
				{children}
				{loading ? (
					<div className="image-upload-loading">
						<ActivityIndicator size={28}/>
					</div>
				) : null}
				<div className="image-upload-corner">
					<Icon icon="upload"/>
				</div>
			</div>
		</button>
	);
};

import * as React from 'react';
import * as hljs from 'highlight.js';
import 'highlight.js/styles/tomorrow.css';

// hljs.registerLanguage('js', jsLang);

export type CodeHighlightProps = {
	value: string;
}

export function CodeHighlight(props: CodeHighlightProps) {
	const codeRef = React.useRef(null as HTMLElement | null);
	const {
		value,
	} = props;

	React.useEffect(() => {
		hljs.highlightBlock(codeRef.current as any);
	}, [value]);

	return (
		<pre>
			<code
				ref={codeRef}
				className="javascript"
				dangerouslySetInnerHTML={{__html: value}}
			/>
		</pre>
	);
}

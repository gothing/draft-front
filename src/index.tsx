import * as React from 'react';
import { render } from 'react-dom';
import { App }  from './App';
import * as serviceWorker from './serviceWorker';

import 'antd/dist/antd.css';

render(
	<App config={Object((globalThis as any).GODRAFT_CONFIG)} />,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// Print git tag/hash to console
console.log("APPLICATION VERSION: ", process.env.REACT_APP_VERSION);

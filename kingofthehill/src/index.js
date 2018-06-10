import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AppKotH from './AppKotH';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AppKotH userMarkers={[]} />, document.getElementById('root'));
registerServiceWorker();

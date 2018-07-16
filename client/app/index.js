import React from 'react';
import ReactDOM from 'react-dom';
import App from './routes/App';
import ErrorBoundary from './components/ErrorBoundary'

// import './app.global.css'

ReactDOM.render(<ErrorBoundary><App /></ErrorBoundary>, document.getElementById('root'));

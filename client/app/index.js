import React from 'react';
import ReactDOM from 'react-dom';
import App from './routes/App';
import ErrorBoundary from './components/ErrorBoundary'
import {Provider, Subscribe} from 'unstated';
import MainContainer from './containers';

// import './app.global.css'
const Main = () => (
    <Provider>
        <Subscribe to={[MainContainer]}>
        {
            store => (
                <ErrorBoundary>
                    <App {...store}></App>
                </ErrorBoundary>
            )
        }
        </Subscribe>
    </Provider>
)

ReactDOM.render(
  <Main />
, document.getElementById('root'));

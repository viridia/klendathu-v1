import ReactDOM from 'react-dom';
import axios from 'axios';
import Routes from './components/routes.jsx';
import { env } from './globals';
import './components/defines/bootstrap.scss'; // Bootstrap styles
import './components/defines/font-faces.scss';

document.addEventListener('DOMContentLoaded', () => {
  axios.defaults.baseURL = env.apiUrl;
  ReactDOM.render(Routes, document.getElementById('react-root'));
  if (module.hot) {
    module.hot.accept('./components/routes.jsx', () => {
      ReactDOM.render(Routes, document.getElementById('react-root'));
    });
  }
});

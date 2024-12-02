import ReactDOM from 'react-dom/client';
import Lanki from './components/Lanki';
import injectedStyles from './styles/injected.css';

// Create and inject custom styles
const style = document.createElement('style');
style.textContent = injectedStyles;
document.head.appendChild(style);

// Create a container for the React app
const appContainer = document.createElement('div');
appContainer.id = 'lanki-root';
document.body.appendChild(appContainer);

// Render the React app into the container
const root = ReactDOM.createRoot(appContainer);
root.render(<Lanki />);

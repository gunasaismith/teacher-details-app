// pages/_app.js

import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
// Import in pages/_app.js or individual pages
import { ToastContainer } from 'react-toastify';


// Include <ToastContainer /> in your component's JSX


function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;

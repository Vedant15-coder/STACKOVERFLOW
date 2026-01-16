import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/lib/AuthContext";
import Head from "next/head";
import "@/lib/i18n"; // Initialize i18n

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>DevQuery</title>
      </Head>
      <AuthProvider>
        <ToastContainer />
        <Component {...pageProps} />
        {/* Global reCAPTCHA container for Firebase Phone Authentication */}
        <div
          id="recaptcha-container"
          style={{
            display: 'block',
            visibility: 'visible',
            minHeight: '78px',
            margin: '0 auto',
            textAlign: 'center'
          }}
        ></div>
      </AuthProvider>
    </>
  );
}

export default App;


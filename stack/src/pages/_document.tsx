import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google reCAPTCHA v3 - Required for Firebase Phone Authentication */}
        <script src="https://www.google.com/recaptcha/api.js?render=explicit" async defer></script>
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

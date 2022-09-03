import type { AppProps } from "next/app";
import "../styles/globals.css";
import Footer from "components/Footer";
import Header from "components/Header";
import { UserProvider } from "providers/user";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Toaster containerStyle={{ zIndex: 10001 }} />
      <Header />
      <Component {...pageProps} />
      <Footer />
    </UserProvider>
  );
}

export default MyApp;

import type { AppProps } from "next/app";
import "../styles/globals.css";
import Footer from "components/Footer";
import Header from "components/Header";
import { UserProvider } from "providers/user";
import { Toaster } from "react-hot-toast";
import NextNProgress from "nextjs-progressbar";
import { ScrollTop } from "components/ScrollTop";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Toaster containerStyle={{ zIndex: 10001 }} />
      <Header />
      <NextNProgress height={1} />
      <Component {...pageProps} />
      <Footer />
      <ScrollTop />
    </UserProvider>
  );
}

export default MyApp;

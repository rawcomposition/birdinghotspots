import type { AppProps } from "next/app";
import "../styles/globals.css";
import Footer from "components/Footer";
import Header from "components/Header";
import { UserProvider } from "providers/user";
import { ModalProvider } from "providers/modals";
import { Toaster } from "react-hot-toast";
import NextNProgress from "nextjs-progressbar";
import { ScrollTop } from "components/ScrollTop";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { get } from "lib/helpers";
import toast from "react-hot-toast";
import { GetParams } from "lib/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => get(queryKey[0] as string, (queryKey[1] || {}) as GetParams),
      retry: 3,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage) {
        toast.error(query.meta.errorMessage.toString() || "An error occurred");
      }
    },
  }),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ModalProvider>
          <Toaster containerStyle={{ zIndex: 10001 }} />
          <Header />
          <NextNProgress height={1} />
          <Component {...pageProps} />
          <Footer />
          <ScrollTop />
        </ModalProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default MyApp;

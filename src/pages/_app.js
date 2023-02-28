import "@/styles/globals.css";
import Navbar from "components/Navbar";
import ContextProvider from "context/ContextProvider";

export default function App({ Component, pageProps }) {
  return (
    <ContextProvider>
      <Navbar />
      <Component {...pageProps} />
    </ContextProvider>
  );
}

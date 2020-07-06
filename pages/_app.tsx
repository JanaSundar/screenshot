import { AppProps } from "next/app";
import "nprogress/nprogress.css";
import "../font.css";
import "../style.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

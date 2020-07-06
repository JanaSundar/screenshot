import Head from "next/head";
import Screenshot from "../Components/Screenshot";

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Screenshot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Screenshot />
    </div>
  );
}

import Head from "next/head";
import Screenshot from "../Components/Screenshot";

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Screenshot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="nav">
        <img src="/Logo.svg" alt="Logo" className="logo" />
      </nav>
      <div className="content">
        <h1 className="title">Turn websites into screenshot</h1>
        <Screenshot />
        <img src="/Mockup.svg" alt="mockup" className="mockup" />
        <footer>
          <p>
            Made with{" "}
            <span role="img" aria-label="heart">
              ❤️
            </span>{" "}
            by Jana
          </p>
        </footer>
      </div>
    </div>
  );
}

import React from "react";
import Head from "next/head";
import Link from "next/link";

function App() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div>
        <h2>Another note taking app</h2>
        <ul>
          <li>
            <Link href="/tags">Tags</Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default App;

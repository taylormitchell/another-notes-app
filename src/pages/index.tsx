import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
            <Link href="/lists">Lists</Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default App;

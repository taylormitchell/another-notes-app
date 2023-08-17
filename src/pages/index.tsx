import React from "react";
import Notes from "./notes";
import Head from "next/head";

function App() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div>
        <h2>Another note taking app</h2>
        <Notes />
      </div>
    </>
  );
}

export default App;

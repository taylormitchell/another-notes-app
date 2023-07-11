import "../global.css";
import BottomNav from "../components/BottomNav";
import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

// set up apollo client to talk to graphql at /api/graphql
const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache(),
});

const App = ({ Component, pageProps }) => {
  // show bottom bar on all pages
  // route to /notes, /lists, /create, /search
  return (
    <ApolloProvider client={client}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Component {...pageProps} />
        </div>
        <BottomNav />
      </div>
    </ApolloProvider>
  );
};

export default App;

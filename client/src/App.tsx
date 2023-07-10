import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { useAllListsQuery } from "./generated/graphql";

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

const Lists: React.FC = () => {
  const { data, loading, error } = useAllListsQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      {data?.allLists.map((list) => (
        <div key={list.id}>
          <h2>{list.name}</h2>
          {list.notes.map((note) => (
            <p key={note.id}>
              {note.text} by {note.author}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h2>My Lists:</h2>
        <Lists />
      </div>
    </ApolloProvider>
  );
}

export default App;

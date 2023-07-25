import "../global.css";
import BottomNav from "../components/BottomNav";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const App = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Component {...pageProps} />
        </div>
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
};

export default App;

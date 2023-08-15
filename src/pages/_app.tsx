import "../global.css";
import BottomNav from "../components/BottomNav";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const App = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div id="app" className="flex flex-col">
        <div className="flex-grow overflow-y-auto">
          <Component {...pageProps} />
        </div>
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
};

export default App;

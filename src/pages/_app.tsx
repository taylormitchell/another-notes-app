import "../global.css";
import BottomNav from "../components/BottomNav";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const App = ({ Component, pageProps }) => {
  const [height, setHeight] = React.useState(0);
  // useEffect(() => {
  //   const resize = () => {
  //     setHeight(window.visualViewport.offsetTop);
  //   };
  //   window.visualViewport.addEventListener("resize", resize);
  //   return () => document.removeEventListener("resize", resize);
  // }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <div id="spacer" style={{ height }}></div>
      <div id="app" className="flex flex-col">
        {/* <div className="flex-grow overflow-y-auto"> */}
        <Component {...pageProps} />
        {/* </div> */}
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
};

export default App;

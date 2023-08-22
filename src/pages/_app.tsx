import "../global.css";
import BottomNav from "../components/BottomNav";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const App = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div id="app" className="flex flex-col">
        <Component {...pageProps} />
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
};

export default App;

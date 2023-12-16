import "../global.css";
import BottomNav from "../components/BottomNav";
import { QueryClient, QueryClientProvider } from "react-query";
import { CreateModal } from "@/components/createModal";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

const queryClient = new QueryClient();

const App = ({ Component, pageProps }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <div id="app" className="flex flex-col">
        <header>
          <Sidebar openModal={() => setIsModalOpen(true)} />
        </header>
        <main>
          <Component {...pageProps} />
        </main>
        <CreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <BottomNav openModal={() => setIsModalOpen(true)} />
      </div>
    </QueryClientProvider>
  );
};

export default App;

import "../global.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { CreateModal } from "@/components/createModal";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Head from "next/head";

const queryClient = new QueryClient();

const App = ({ Component, pageProps }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col min-h-screen min-w-screen">
          <header>
            <Sidebar openModal={() => setIsModalOpen(true)} />
          </header>
          <main>
            <Component {...pageProps} />
          </main>
          <CreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          <button
            className="fixed bottom-4 right-4 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center"
            onClick={() => setIsModalOpen(true)}
          >
            +
          </button>
        </div>
      </QueryClientProvider>
    </>
  );
};

export default App;

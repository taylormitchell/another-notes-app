import "../global.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { CreateNoteModal } from "@/components/CreateNoteModal";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Head from "next/head";
import { useRouter } from "next/router";
import { CreateListModal } from "@/components/CreateListModal";

const queryClient = new QueryClient();

function pathToViewType(path: string) {
  switch (path) {
    case "/":
      return {
        type: "home",
        title: "Home",
      };
    case "/lists":
      return {
        type: "lists",
        title: "Lists",
      };
    case "/notes":
      return {
        type: "notes",
        title: "Notes",
      };
    default:
      return {
        type: "none",
        title: "",
      };
  }
}

const App = ({ Component, pageProps }) => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const router = useRouter();
  const viewType = pathToViewType(router.pathname);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col min-h-screen min-w-screen">
          <header className="flex flex-row">
            <div className="flex flex-row align-center">
              <Sidebar openModal={() => setIsNoteModalOpen(true)} />
              <div className="flex flex-col justify-center">
                <h1>{viewType.title}</h1>
              </div>
            </div>
            <div className="flex flex-row flex-grow justify-end items-center">
              {viewType.type === "lists" && (
                <button className="p-2" onClick={() => setIsListModalOpen(true)}>
                  Create List
                </button>
              )}
            </div>
          </header>
          <main>
            <Component {...pageProps} />
          </main>
          <CreateNoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} />
          {isListModalOpen && <CreateListModal onClose={() => setIsListModalOpen(false)} />}
          <button
            className="fixed bottom-4 right-4 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center"
            onClick={() => setIsNoteModalOpen(true)}
          >
            +
          </button>
        </div>
      </QueryClientProvider>
    </>
  );
};

export default App;

import "../global.css";
import { CreateNoteModal } from "@/components/CreateNoteModal";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Head from "next/head";
import { useRouter } from "next/router";
import { CreateListModal } from "@/components/CreateListModal";
import { StoreContext, useStore } from "@/lib/store";
import { CreateButton } from "@/components/CreateButton";
import { ModalsContext, ModalsProvider } from "@/lib/modalContext";

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
  const { store, isLoading } = useStore();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <StoreContext.Provider value={store}>
        <ModalsProvider>
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
            <CreateNoteModal />
            <CreateListModal />
          </div>
        </ModalsProvider>
      </StoreContext.Provider>
    </>
  );
};

export default App;

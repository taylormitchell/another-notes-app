import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Notes from "./pages/Notes";
import { useStore, StoreContext } from "./lib/store";
import { ModalsProvider, useModalsContext } from "./lib/modalContext";
import { CreateNoteModal } from "./components/CreateNoteModal";
import { ErrorBoundary } from "react-error-boundary";
import Lists from "./pages/Lists";
import List from "./pages/List";
import Search from "./pages/Search";
import Note from "./pages/Note";
import Home from "./pages/Home";
import { CommandBar } from "./components/CommandBar";
import { useHotkey } from "./lib/utils";
import { SearchProvider, useSearchContext } from "./lib/SearchContext";
import { Command } from "react-feather";
import { MiniSearchBar } from "./components/MiniSearchBar";
import { Sidebar } from "./components/Sidebar";

const App = () => {
  const { store, isLoading } = useStore();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <StoreContext.Provider value={store}>
        <SearchProvider>
          <ModalsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/notes/:id" element={<Note />} />
                  <Route path="/lists" element={<Lists />} />
                  <Route path="/lists/:id" element={<List />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="*" element={<div>Page not found</div>} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ModalsProvider>
        </SearchProvider>
      </StoreContext.Provider>
    </ErrorBoundary>
  );
};

function Layout() {
  const modals = useModalsContext();
  const { search, setSearch } = useSearchContext();
  useHotkey(
    (e) => e.metaKey && e.key === "k",
    () => modals.commandbar.open()
  );

  return (
    <div>
      <header className="flex justify-between p-4 items-center">
        <Sidebar />
        <div className="flex items-center gap-4">
          <MiniSearchBar search={search} setSearch={setSearch} />
          <button onClick={modals.commandbar.open}>
            <Command />
          </button>
        </div>
      </header>
      <main>
        <Outlet />
        <CreateNoteModal />
        {modals.commandbar.isOpen && <CommandBar />}
      </main>
    </div>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Outlet, useNavigate } from "react-router-dom";
import Notes from "./pages/Notes";
import { useStore, StoreContext, useStoreContext } from "./lib/store";
import { ModalsProvider, useModalsContext } from "./lib/modalContext";
import { CreateNoteModal } from "./components/CreateNoteModal";
import { ErrorBoundary } from "react-error-boundary";
import Lists from "./pages/Lists";
import List from "./pages/List";
import Search from "./pages/Search";
import Note from "./pages/Note";
import Home from "./pages/Home";
import { CommandBar } from "./components/CommandBar";
import { inputFocused, useHotkey } from "./lib/utils";
import { SearchProvider, useSearchContext } from "./lib/SearchContext";
import { AlignJustify, Command, Square } from "react-feather";
import { MiniSearchBar } from "./components/MiniSearchBar";
import { Sidebar } from "./components/Sidebar";
import { DisplayProvider, useDisplayContext } from "./lib/DisplayContext";

const App = () => {
  const { store, isLoading } = useStore();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <StoreContext.Provider value={store}>
        <SearchProvider>
          <DisplayProvider>
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
          </DisplayProvider>
        </SearchProvider>
      </StoreContext.Provider>
    </ErrorBoundary>
  );
};

function Layout() {
  const navigate = useNavigate();
  const store = useStoreContext();
  const modals = useModalsContext();
  const { view, setView } = useDisplayContext();
  const { search, setSearch } = useSearchContext();
  useHotkey(
    (e) => e.metaKey && e.key === "k",
    () => modals.commandbar.open()
  );

  useHotkey("c", () => {
    if (inputFocused()) return false;
    modals.createNote.open();
  });

  // create a new note and navigate to it at /notes/:id
  // when the user presses shift + c
  useHotkey(
    (e) => e.shiftKey && e.key.toLocaleLowerCase() === "c",
    () => {
      console.log("shift + c");
      if (inputFocused()) return false;
      const note = store.addNote();
      navigate(`/notes/${note.id}`);
    }
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
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setView("card")}
              className={`p-1 rounded-full ${view === "card" ? "bg-white" : "bg-transparent"}`}
            >
              <Square size={16} />
            </button>
            <button
              onClick={() => setView("document")}
              className={`p-1 rounded-full ${view === "document" ? "bg-white" : "bg-transparent"}`}
            >
              <AlignJustify size={16} />
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
        {modals.createNote.isOpen && <CreateNoteModal />}
        {modals.commandbar.isOpen && <CommandBar />}
      </main>
    </div>
  );
}

export default App;

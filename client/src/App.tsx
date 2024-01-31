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
import { AlignJustify, ChevronDown, Command, Square } from "react-feather";
import { MiniSearchBar } from "./components/MiniSearchBar";
import { Sidebar } from "./components/Sidebar";
import { DisplayProvider, useDisplayContext } from "./lib/DisplayContext";
import { useState, useRef } from "react";
import useEventListener from "./lib/useEventListener";

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
  const { view, setView, sort, setSort } = useDisplayContext();
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
      if (inputFocused()) return false;
      const note = store.addNote();
      navigate(`/notes/${note.id}`);
    }
  );

  useHotkey(
    (e) => e.shiftKey && e.key.toLocaleLowerCase() === "l",
    () => {
      if (inputFocused()) return false;
      const list = store.addList({ name: "Untitled" });
      store.addNote({ listPositions: [{ id: list.id }] });
      navigate(`/lists/${list.id}`);
    }
  );

  useHotkey(
    (e) => e.key === "Escape" && !inputFocused(),
    () => navigate("/")
  );

  return (
    <>
      <header className="flex justify-between p-1 items-center">
        <Sidebar />
        <div className="flex items-center gap-4">
          <MiniSearchBar search={search} setSearch={setSearch} />
          <button onClick={modals.commandbar.open}>
            <Command />
          </button>
          <Dropdown title="Display">
            <div className="flex flex-row gap-1 w-48">
              <label htmlFor="sort">Sort by</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as any);
                }}
              >
                <option value="position">Position</option>
                <option value="upvotes">Upvotes</option>
              </select>
            </div>
            <div className="flex flex-row gap-1 w-48">
              <label htmlFor="view">View</label>
              <div id="view" className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setView("card")}
                  className={`p-1 rounded-full ${view === "card" ? "bg-white" : "bg-transparent"}`}
                >
                  <Square size={16} />
                </button>
                <button
                  onClick={() => setView("document")}
                  className={`p-1 rounded-full ${
                    view === "document" ? "bg-white" : "bg-transparent"
                  }`}
                >
                  <AlignJustify size={16} />
                </button>
              </div>
            </div>
          </Dropdown>
          {/* dropdown to select sort option */}
        </div>
      </header>
      {/* <main className="flex flex-1 basis-0"> */}
      <main className="flex flex-col flex-1 items-center">
        <Outlet />
        {modals.createNote.isOpen && <CreateNoteModal />}
        {modals.commandbar.isOpen && <CommandBar />}
      </main>
    </>
  );
}

/**
 * A button which opens a dropdown menu when clicked.
 * The content of the dropdown menu is passed as children.
 */
function Dropdown({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEventListener(document, "mousedown", (event) => {
    if (!event.target) return;
    if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
      setIsOpen(false);
    }
  });
  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center gap-1"
        onClick={() => {
          setIsOpen((v) => !v);
        }}
      >
        {title}
        <ChevronDown />
      </button>
      {isOpen && (
        <div className="absolute top-8 right-0 bg-white shadow-lg rounded-lg p-2">{children}</div>
      )}
    </div>
  );
}

export default App;

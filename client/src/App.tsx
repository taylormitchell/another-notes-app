import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Notes from "./pages/Notes";
import { useStore, StoreContext } from "./lib/store";
import Sidebar from "./components/Sidebar";
import { ModalsProvider } from "./lib/modalContext";
import { CreateNoteModal } from "./components/CreateNoteModal";
import { ErrorBoundary } from "react-error-boundary";
import Lists from "./pages/Lists";
import List from "./pages/List";

const App = () => {
  const { store, isLoading } = useStore();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <StoreContext.Provider value={store}>
        <ModalsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<div>Home</div>} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/lists" element={<Lists />} />
                <Route path="/lists/:id" element={<List />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ModalsProvider>
      </StoreContext.Provider>
    </ErrorBoundary>
  );
};

function Layout() {
  return (
    <div>
      <header>
        <Sidebar />
      </header>
      <main>
        <Outlet />
        <CreateNoteModal />
        {/* <CreateListModal />  */}
      </main>
    </div>
  );
}

export default App;

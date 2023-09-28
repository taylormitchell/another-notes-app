import "../global.css";
import BottomNav from "../components/BottomNav";
import { QueryClient, QueryClientProvider } from "react-query";
import { Sheet, SheetTrigger, SheetContent, SheetHeader } from "@/components/ui/sheet";
import Link from "next/link";
import { Sidebar } from "react-feather";

const queryClient = new QueryClient();

const App = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div id="app" className="flex flex-col">
        <header>
          <Sheet>
            <SheetTrigger>
              <Sidebar />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <Link href="/lists">Lists</Link>
                <Link href="/create">Create</Link>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </header>
        <main>
          <Component {...pageProps} />
        </main>

        <BottomNav />
      </div>
    </QueryClientProvider>
  );
};

export default App;

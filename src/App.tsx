import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Prompt from "./pages/Prompt";
import ActualitesGenerales from "./pages/ActualitesGenerales";
import ActualitesSportives from "./pages/ActualitesSportives";
import OffresGenerales from "./pages/OffresGenerales";
import OffresSportives from "./pages/OffresSportives";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-12 flex items-center border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <SidebarTrigger className="ml-2" />
              </header>
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/prompt" element={<Prompt />} />
                  <Route path="/actualites/generales" element={<ActualitesGenerales />} />
                  <Route path="/actualites/sportives" element={<ActualitesSportives />} />
                  <Route path="/offres/generales" element={<OffresGenerales />} />
                  <Route path="/offres/sportives" element={<OffresSportives />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

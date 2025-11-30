import { Link, useLocation } from "react-router-dom";
import { Upload, MessageSquare } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,200,255,0.3)]">
              <span className="text-xl font-bold text-background">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ScrapReform
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === "/"
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,200,255,0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Import</span>
            </Link>
            <Link
              to="/prompt"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === "/prompt"
                  ? "bg-accent/20 text-accent shadow-[0_0_15px_rgba(255,153,0,0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Prompt</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

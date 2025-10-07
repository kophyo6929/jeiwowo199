import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Film, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ADMIN_EMAIL = "thewayofthedragg@gmail.com";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(mobileSearchQuery)}`);
      setIsOpen(false);
      setMobileSearchQuery("");
    }
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold text-gradient">CINEVERSE</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/?filter=movies" className="text-sm font-medium transition-colors hover:text-primary">
              Movies
            </Link>
            <Link to="/?filter=series" className="text-sm font-medium transition-colors hover:text-primary">
              Series
            </Link>
            <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact Us
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search movies, TV shows..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {isAdmin && (
            <Button asChild variant="default" size="sm" className="hidden md:flex">
              <Link to="/admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <div className="flex flex-col gap-6 mt-8">
                <form onSubmit={handleMobileSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search movies, TV shows..."
                    className="pl-9 bg-muted/50"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                  />
                </form>

                <nav className="flex flex-col gap-4">
                  <Link 
                    to="/" 
                    className="text-2xl font-medium transition-colors hover:text-primary"
                    onClick={handleNavClick}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/?filter=movies" 
                    className="text-2xl font-medium transition-colors hover:text-primary"
                    onClick={handleNavClick}
                  >
                    Movies
                  </Link>
                  <Link 
                    to="/?filter=series" 
                    className="text-2xl font-medium transition-colors hover:text-primary"
                    onClick={handleNavClick}
                  >
                    Series
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-2xl font-medium transition-colors hover:text-primary"
                    onClick={handleNavClick}
                  >
                    Contact
                  </Link>
                  <Link 
                    to="/policy" 
                    className="text-2xl font-medium transition-colors hover:text-primary"
                    onClick={handleNavClick}
                  >
                    Policy
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-2xl font-medium transition-colors hover:text-primary"
                      onClick={handleNavClick}
                    >
                      Admin Panel
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Film, Shield } from "lucide-react";
import NewsTicker from "./NewsTicker";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "الرئيسية" },
    { path: "/movies", label: "الأفلام" },
    { path: "/artists", label: "الفنانون" },
    { path: "/years", label: "السنوات" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gold/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center glow-gold group-hover:scale-110 transition-transform">
                <Film className="w-6 h-6 text-background" />
              </div>
              <span className="text-2xl font-amiri font-bold text-gradient-gold hidden sm:block">
                الأرشيف السينمائي
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-2 text-lg font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-gold"
                      : "text-foreground/80 hover:text-gold"
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Admin Link */}
              <Link
                to="/admin"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-gold/20 transition-colors"
                title="لوحة التحكم"
              >
                <Shield className="w-5 h-5 text-gold" />
              </Link>

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                <Search className="w-5 h-5 text-gold" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-gold" />
                ) : (
                  <Menu className="w-5 h-5 text-gold" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="pb-4 animate-fade-in">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن فيلم أو فنان..."
                  className="w-full bg-secondary border border-gold/30 rounded-xl px-5 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-gold/20 animate-fade-in">
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-gold/20 text-gold"
                      : "text-foreground/80 hover:bg-gold/10 hover:text-gold"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`py-3 px-4 rounded-lg text-lg font-medium transition-colors flex items-center gap-2 ${
                  isActive("/admin")
                    ? "bg-gold/20 text-gold"
                    : "text-foreground/80 hover:bg-gold/10 hover:text-gold"
                }`}
              >
                <Shield className="w-5 h-5" />
                لوحة التحكم
              </Link>
            </nav>
          </div>
        )}
      </header>
      
      {/* News Ticker - Below Header */}
      <div className="fixed top-20 left-0 right-0 z-40">
        <NewsTicker />
      </div>
    </>
  );
};

export default Header;

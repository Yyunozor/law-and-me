import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "// Accueil" },
    { href: "/analyser", label: "// Analyser" },
    { href: "/comment", label: "// Comment ça marche" },
    { href: "/apropos", label: "// À propos" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <span className="font-sans font-bold text-2xl tracking-tighter cursor-pointer">
                <span className="text-white">Law</span>
                <span className="text-primary">&Me</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center font-mono text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`cursor-pointer transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:text-primary focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 font-mono text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 cursor-pointer transition-colors ${location === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

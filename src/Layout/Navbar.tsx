import { Book, Home, Menu, Puzzle, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Plugins", icon: Puzzle, href: "/plugins" },
    { name: "Documentation", icon: Book, href: "https://docs.blitz-bots.com" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Navbar - Hamburger Button */}
      <nav
        className={`fixed top-[30px] pt-2 pb-2 w-full z-50 transition-colors duration-300 z-998 ${
          isScrolled
            ? "bg-white/02 backdrop-blur-md shadow-lg"
            : "bg-black/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img
                  src="https://assets.blitz-bots.com/blitz.svg"
                  alt="Blitz Icon"
                  className="h-8 w-8"
                />

                <div className="w-px h-6 bg-white/20 mx-3"></div>
                <span className="text-white font-bold text-xl">BLITZ BOTS</span>
              </a>
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen
                ? <X className="h-6 w-6" />
                : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 min-h-screen w-64 bg-black/95 backdrop-blur-md transition-transform duration-300 ease-in-out border-l border-white/10 shadow-2xl ${
          isOpen ? "translate-x-0 mt-[30px]" : "translate-x-full mt-[30px]"
        } z-50`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center">
            <img
              src="https://assets.blitz-bots.com/blitz.svg"
              alt="Blitz Icon"
              className="h-8 w-8"
            />

            <div className="w-px h-4 bg-white/20 mx-2"></div>
            <span className="text-white font-bold">BLITZ BOTS</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-300 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col py-6 px-4 space-y-4">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 text-gray-300 hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } z-40`}
        onClick={() => setIsOpen(false)}
      >
      </div>
    </>
  );
}

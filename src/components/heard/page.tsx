"use client";

export default function Header() {
  const menuItems = [
    { label: "Intro", href: "#start" },
    { label: "Sobre", href: "#meio" },
    { label: "Tech", href: "#Tecnologia" },
    { label: "Projeto", href: "#Projeto" },
    { label: "Contato", href: "#Contato" },
    { label: "3D", href: "#Destaque" },
  ];

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:w-[85%] max-w-4xl">
      {/* Neon glow */}
      <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 opacity-70" />

      {/* Navbar */}
      <nav className="navbar bg-neutral-900/90 text-white rounded-full shadow-xl border border-neutral-800 backdrop-blur-md relative">
        <ul className="menu menu-horizontal gap-1 sm:gap-2 md:gap-3 mx-auto">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="btn btn-ghost btn-xs sm:btn-sm md:btn-md text-white hover:text-black hover:bg-cyan-400 transition-all duration-300 rounded-full"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

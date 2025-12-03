"use client";

export default function Header() {
  const menuItems = [
    { label: "Intro", href: "#start" },
    { label: "Sobre", href: "#meio" },
    { label: "Tech", href: "#Tecnologia" },
    // { label: "Local", href: "#location" },
    { label: "Projeto", href: "#Projeto" },
    { label: "Contato", href: "#Contato" },
  ];

  return (
    <section className="w-full">
      <header className="bg-white text-black rounded-full fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:w-[85%] max-w-4xl mx-auto shadow-lg border border-gray-100 backdrop-blur-sm bg-white/95">
        <nav className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex justify-center items-center">
          {/* Menu Items */}
          <div className="w-full flex justify-center overflow-auto">
            <ul className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5 flex-nowrap scrollbar-hide">
              {menuItems.map((item, index) => (
                <li key={index} className="flex-shrink-0">
                  <a
                    href={item.href}
                    className="hover:text-gray-600 transition-colors duration-200 capitalize font-medium whitespace-nowrap px-1 sm:px-2 md:px-3 text-xs sm:text-sm md:text-base lg:text-lg"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>
    </section>
  );
}

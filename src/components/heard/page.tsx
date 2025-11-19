"use client";

export default function Header() {
  const menuItems = [
    { label: "Início", href: "#" },
    { label: "Meio", href: "#" },
    { label: "Fim", href: "#" },
  ];

  return (
    <header className="bg-white text-black rounded-full fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] sm:w-[85%] md:w-[80%] max-w-4xl mx-auto shadow-lg border border-gray-100">
      <nav className="px-3 sm:px-6 md:px-8 py-2 sm:py-3 flex justify-between items-center gap-2 sm:gap-4">
        {/* Logo */}
        <h5 className="text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap flex-shrink-0">
          odilon
        </h5>

        {/* Menu Items */}
        <div className="flex-1 flex justify-end overflow-auto">
          <ul className="flex gap-1 sm:gap-3 md:gap-5 lg:gap-7 flex-nowrap">
            {menuItems.map((item, index) => (
              <li key={index} className="flex-shrink-0">
                <a
                  href={item.href}
                  className="hover:text-gray-600 transition-colors duration-200 capitalize text-xs sm:text-sm md:text-base whitespace-nowrap px-1 sm:px-2"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

"use client";

export default function Header() {
  const menuItems = [
    { label: "Início", href: "#start" },
    { label: "Meio", href: "#meio" },
    { label: "Fim", href: "#fim" },
  ];

  return (
    <header className="bg-white text-black rounded-full fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:w-[85%] max-w-4xl mx-auto shadow-lg border border-gray-100">
      <nav className="px-3 sm:px-6 md:px-8 py-2 sm:py-3 flex justify-between items-center gap-2 sm:gap-4">
        {/* Logo */}
        <h5 className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap flex-shrink-0 tracking-wide">
          odilon
        </h5>

        {/* Menu Items */}
        <div className="flex-1 flex justify-end overflow-auto">
          <ul className="flex gap-1 sm:gap-3 md:gap-5 lg:gap-7 flex-nowrap">
            {menuItems.map((item, index) => (
              <li key={index} className="flex-shrink-0">
                <a
                  href={item.href}
                  className="hover:text-gray-600 transition-colors duration-200 capitalize font-semibold whitespace-nowrap px-2 sm:px-3 text-base sm:text-lg md:text-xl"
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

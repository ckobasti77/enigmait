import React from "react";
import clsx from "clsx";

type BurgerProps = {
  navOpen: boolean;
  toggleNav: () => void;
};

const Burger = ({ navOpen, toggleNav }: BurgerProps) => {
  return (
    <button
      type="button"
      onClick={toggleNav}
      aria-label={navOpen ? "Zatvori meni" : "Otvori meni"}
      aria-expanded={navOpen}
      className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[6px] cursor-pointer lg:hidden"
    >
      <span
        className={clsx(
          "block h-[2px] w-6 rounded-full bg-white transition-all duration-300 ease-in-out origin-center",
          navOpen && "translate-y-[8px] rotate-45"
        )}
      />
      <span
        className={clsx(
          "block h-[2px] rounded-full bg-white transition-all duration-300 ease-in-out origin-center",
          navOpen ? "w-0 opacity-0" : "w-4"
        )}
      />
      <span
        className={clsx(
          "block h-[2px] w-6 rounded-full bg-white transition-all duration-300 ease-in-out origin-center",
          navOpen && "-translate-y-[8px] -rotate-45"
        )}
      />
    </button>
  );
};

export default Burger;

import * as React from "react";
import { ArrowSmallUpIcon } from "@heroicons/react/20/solid";
import useEventListener from "hooks/useEventListener";

export const ScrollTop = () => {
  const [visible, setVisible] = React.useState(false);
  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 1200) {
      setVisible(true);
      return;
    }
    setVisible(false);
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEventListener("scroll", toggleVisible);
  return (
    <button
      type="button"
      className={`fixed right-5 ${
        visible ? "bottom-4 opacity-100 visible" : "bottom-4 opacity-0 invisible"
      } p-2 bg-[#4a84b2]/90 text-white font-medium text-xs leading-tight uppercase rounded-full shadow-md hover:bg-[#4a84b2] hover:shadow-lg focus:bg-[#4a84b2] focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg duration-150 ease-in-out transition-all`}
      onClick={scrollToTop}
    >
      <ArrowSmallUpIcon className="h-7 w-7" />
    </button>
  );
};

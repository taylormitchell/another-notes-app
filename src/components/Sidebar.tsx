import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

const Sidebar = ({ openModal }: { openModal: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close the sidebar if clicked outside
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <button className="p-2 text-white bg-blue-500 rounded" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close" : "Menu"}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" aria-hidden="true"></div>
      )}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-20 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col w-64 items-left">
          <Link href="/lists" onClick={() => setIsOpen(false)}>
            Lists
          </Link>
          <Link href="/notes" onClick={() => setIsOpen(false)}>
            Notes
          </Link>
          <button
            className="text-left"
            onClick={() => {
              openModal();
              setIsOpen(false);
            }}
          >
            Create Modal
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

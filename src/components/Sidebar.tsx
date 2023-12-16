import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Sidebar = ({ openModal }: { openModal: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const router = useRouter();

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
          {[
            { name: "Home", handler: () => router.push("/") },
            { name: "Lists", handler: () => router.push("/lists") },
            { name: "Notes", handler: () => router.push("/notes") },
            { name: "Create Modal", handler: openModal },
          ].map(({ name, handler }) => (
            <button
              key={name}
              className="text-left hover:bg-gray-100 h-8 text-xl"
              onClick={() => {
                handler();
                setIsOpen(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

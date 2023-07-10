import Link from "next/link";

const navItems = [
  { name: "Lists", path: "/lists" },
  { name: "Create Note", path: "/createnote" },
  { name: "Search", path: "/search" },
];

const BottomNav = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-white shadow-lg">
      <div className="px-2 py-3 mx-auto max-w-screen-xl">
        <div className="flex justify-between">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

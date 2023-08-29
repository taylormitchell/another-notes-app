import Link from "next/link";
import { useRouter } from "next/router";

const BottomNav = () => {
  const router = useRouter();

  return (
    <>
      {/* equally spaced, buttons, grey */}
      {/* <div className="w-full h-16 bg-gray-100 fixed bottom-0 left-0"> */}
      <div className="w-full h-16 bg-gray-100">
        <div className="flex justify-between items-center h-full px-4">
          <Link href="/lists">Lists</Link>
          <button
            onClick={() => {
              router.push(`/create`);
            }}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomNav;

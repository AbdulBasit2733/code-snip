import { useState } from "react";
import { Menu, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-end px-4 shadow-sm">
      {/* Left section with mobile menu toggle */}
      <div className="flex items-center lg:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {(!sidebarOpen || window.innerWidth < 1024) && (
        <Link
          to="/dashboard"
          className="font-bold text-xl text-slate-800 ml-2 mr-2"
        >
          CodeSnip
        </Link>
      )}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <User size={18} />
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200">
              <h1 className="text-xl font-semibold text-slate-600">{user?.name}</h1>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                onClick={() => console.log("Logout")}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

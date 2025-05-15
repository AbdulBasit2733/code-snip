import { useState } from 'react';
import { Menu, Bell, Search, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 shadow-sm">
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

      {/* Logo - visible on mobile when sidebar is closed or always visible on desktop when sidebar is collapsed */}
      {(!sidebarOpen || window.innerWidth < 1024) && (
        <Link to="/dashboard" className="font-bold text-xl text-slate-800 ml-2">
          CodeSnip
        </Link>
      )}

      {/* Search bar */}
      <div className="hidden md:block flex-grow max-w-xl mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full py-2 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search snippets..."
          />
        </form>
      </div>

      {/* Right section with notifications and user menu */}
      <div className="flex items-center space-x-4">
        {/* Notification bell */}
        <button className="p-2 rounded-full hover:bg-slate-100 relative">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <Link to="/settings" className="p-2 rounded-full hover:bg-slate-100">
          <Settings size={20} className="text-slate-600" />
        </Link>

        {/* User profile */}
        <div className="relative">
          <button 
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <User size={18} />
            </div>
          </button>

          {/* User dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200">
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Your Profile
              </Link>
              <Link 
                to="/settings" 
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Settings
              </Link>
              <div className="border-t border-slate-200 my-1"></div>
              <button 
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                onClick={() => console.log('Logout')}
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
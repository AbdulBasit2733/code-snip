import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Code,
  LayoutDashboard,
  Share2,
  ChevronLeft,
  ChevronRight,
  Library,
  SquareDashedBottomCode,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const location = useLocation();

  // Navigation items with icons and paths
  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/",
    },
  ];

  return (
    <div
      className={`${
        open ? "w-64" : "w-16"
      } bg-slate-800 text-white transition-all duration-300 ease-in-out h-full flex flex-col`}
    >
      {/* Sidebar header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {open && <span className="font-semibold">CodeSnip</span>}
        <button
          onClick={onToggle}
          className="p-1 rounded-full hover:bg-slate-700 transition-colors"
        >
          {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 pt-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 ${
                    isActive
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  } transition-colors rounded-lg mx-2`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {open && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

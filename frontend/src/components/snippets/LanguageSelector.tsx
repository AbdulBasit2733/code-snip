// src/components/snippets/LanguageSelector.jsx

import { useState } from 'react';
import { Check, ChevronDown, Code } from 'lucide-react';

const languages = [
  { id: 'javascript', name: 'JavaScript', icon: 'js' },
  { id: 'python', name: 'Python', icon: 'py' },
  { id: 'html', name: 'HTML', icon: 'html' },
  { id: 'css', name: 'CSS', icon: 'css' },
  { id: 'cpp', name: 'C++', icon: 'cpp' },
];

const LanguageSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = languages.find(lang => lang.id === value) || languages[0];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (language) => {
    onChange(language.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm"
      >
        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-background">
          {selectedLanguage.icon}
        </span>
        <span>{selectedLanguage.name}</span>
        <ChevronDown size={14} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 rounded-md bg-secondary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.id}
                onClick={() => handleSelect(language)}
                className={`flex items-center justify-between w-full text-left px-4 py-2 text-sm ${
                  language.id === value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-secondary-foreground hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-background text-foreground">
                    {language.icon}
                  </span>
                  <span>{language.name}</span>
                </div>
                {language.id === value && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
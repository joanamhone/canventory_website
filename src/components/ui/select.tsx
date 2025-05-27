// src/components/ui/select.tsx
import React from 'react';

// Select Context
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  name?: string; // Added name to context
}
const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

// Select Component
export const Select: React.FC<{ children: React.ReactNode; value: string; onValueChange: (value: string) => void; name?: string; required?: boolean }> = ({ children, value, onValueChange, name, required }) => {
  const [open, setOpen] = React.useState(false);

  // Pass name to context
  const contextValue = React.useMemo(() => ({ value, onValueChange, open, setOpen, name }), [value, onValueChange, open, setOpen, name]);

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
        {/* Hidden input to handle form submission for name and required attributes */}
        <input type="hidden" name={name} value={value} required={required} />
      </div>
    </SelectContext.Provider>
  );
};

// SelectTrigger Component
export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within a Select");

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-400 ${className || ''}`}
      onClick={() => context.setOpen(!context.open)}
    >
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down opacity-50 transition-transform duration-200 ${context.open ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
    </button>
  );
};

// SelectValue Component
export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within a Select");

  return (
    <span>{context.value || placeholder}</span>
  );
};

// SelectContent Component
export const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within a Select");

  if (!context.open) return null;

  return (
    <div className={`absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-950 ${className || ''}`}>
      <div className="max-h-60 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// SelectItem Component
export const SelectItem: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({ children, value, className }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within a SelectContent");

  const handleClick = () => {
    context.onValueChange(value);
    context.setOpen(false);
  };

  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 ${className || ''} ${context.value === value ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
      onClick={handleClick}
    >
      {context.value === value && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M18 6 7 17l-5-5"/></svg>
        </span>
      )}
      {children}
    </div>
  );
};

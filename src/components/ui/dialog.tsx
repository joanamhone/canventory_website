// src/components/ui/dialog.tsx
import React from 'react';

// Basic Dialog Context for open/close state
interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

// Dialog Component
export const Dialog: React.FC<{ children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = controlledOpen !== undefined ? onOpenChange || (() => {}) : setUncontrolledOpen;

  const contextValue = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
};

// DialogTrigger Component
export const DialogTrigger: React.FC<{ children: React.ReactElement; asChild?: boolean }> = ({ children, asChild }) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogTrigger must be used within a Dialog");

  const child = React.Children.only(children);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default button behavior if it's a button
    context.setOpen(!context.open);
  };

  if (asChild) {
    return React.cloneElement(child, { onClick: handleClick });
  }

  return <button onClick={handleClick}>{children}</button>;
};

// DialogContent Component
export const DialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within a Dialog");

  if (!context.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative max-w-lg w-full ${className || ''}`}>
        {children}
        <button
          onClick={() => context.setOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
  );
};

// DialogHeader Component
export const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}>{children}</div>;
};

// DialogTitle Component
export const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>{children}</h2>;
};

// DialogDescription Component (optional, but good practice if used)
export const DialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <p className={`text-sm text-gray-500 dark:text-gray-400 ${className || ''}`}>{children}</p>;
};

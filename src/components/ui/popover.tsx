// src/components/ui/popover.tsx
import React from 'react';

// Popover Context
interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLButtonElement>; // Corrected to HTMLButtonElement
}
const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

// Popover Component
export const Popover: React.FC<{ children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = controlledOpen !== undefined ? onOpenChange || (() => {}) : setUncontrolledOpen;
  const anchorRef = React.useRef<HTMLButtonElement>(null); // Corrected to HTMLButtonElement

  const contextValue = React.useMemo(() => ({ open, setOpen, anchorRef }), [open, setOpen, anchorRef]);

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

// PopoverTrigger Component
export const PopoverTrigger: React.FC<{ children: React.ReactElement; asChild?: boolean }> = ({ children, asChild }) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used within a Popover");

  const child = React.Children.only(children);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    context.setOpen(!context.open);
  };

  if (asChild) {
    return React.cloneElement(child, { onClick: handleClick, ref: context.anchorRef });
  }

  return <button onClick={handleClick} ref={context.anchorRef}>{children}</button>;
};

// PopoverContent Component
export const PopoverContent: React.FC<{ children: React.ReactNode; className?: string; align?: 'start' | 'center' | 'end'; sideOffset?: number }> = ({ children, className, align = 'center', sideOffset = 4 }) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used within a Popover");

  if (!context.open) return null;

  // Basic positioning for demonstration. For full functionality, a positioning library would be used.
  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex: 50,
    marginTop: sideOffset,
  };

  // Apply alignment styles
  if (align === 'start') {
    style.left = 0;
  } else if (align === 'end') {
    style.right = 0;
  } else { // 'center'
    style.left = '50%';
    style.transform = 'translateX(-50%)';
  }


  return (
    <div
      className={`rounded-md border border-gray-200 bg-white p-4 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-gray-700 dark:bg-gray-950 ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  );
};

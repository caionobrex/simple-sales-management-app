import React, { useContext, useState } from 'react';

const Context = React.createContext({ isOpen: false });

export default function SideNavStateProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Context.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </Context.Provider>
  );
};

export function useSideNav() { return useContext(Context); }
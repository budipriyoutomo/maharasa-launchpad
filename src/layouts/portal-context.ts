import { createContext, useContext } from "react";

export interface PortalContextValue {
  openCommandPalette: () => void;
}

export const PortalContext = createContext<PortalContextValue>({
  openCommandPalette: () => {},
});

export const usePortal = () => useContext(PortalContext);

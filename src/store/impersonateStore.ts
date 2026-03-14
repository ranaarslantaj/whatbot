import { create } from 'zustand';

interface ImpersonateState {
  isImpersonating: boolean;
  clientId: string | null;
  clientName: string | null;
  startImpersonation: (clientId: string, clientName: string) => void;
  stopImpersonation: () => void;
}

export const useImpersonateStore = create<ImpersonateState>((set) => ({
  isImpersonating: false,
  clientId: null,
  clientName: null,
  startImpersonation: (clientId, clientName) =>
    set({ isImpersonating: true, clientId, clientName }),
  stopImpersonation: () =>
    set({ isImpersonating: false, clientId: null, clientName: null }),
}));

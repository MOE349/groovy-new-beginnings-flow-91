import { create } from 'zustand';

interface Modal {
  id: string;
  title?: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose?: () => void;
}

interface Drawer {
  id: string;
  title?: string;
  content: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  onClose?: () => void;
}

interface UIState {
  // Loading states
  globalLoading: boolean;
  loadingMessage?: string;
  
  // Modal management
  modals: Modal[];
  activeModalId: string | null;
  
  // Drawer management
  drawers: Drawer[];
  activeDrawerId: string | null;
  
  // Breadcrumbs
  breadcrumbs: Array<{ label: string; href?: string }>;
  
  // Selected items (for bulk operations)
  selectedItems: Map<string, Set<string>>; // entity type -> selected IDs
  
  // Filters
  activeFilters: Map<string, Record<string, any>>; // page -> filters
  
  // Actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Modal actions
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  
  // Drawer actions
  openDrawer: (drawer: Omit<Drawer, 'id'>) => string;
  closeDrawer: (id?: string) => void;
  closeAllDrawers: () => void;
  
  // Breadcrumb actions
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void;
  addBreadcrumb: (breadcrumb: { label: string; href?: string }) => void;
  
  // Selection actions
  selectItem: (entityType: string, id: string) => void;
  deselectItem: (entityType: string, id: string) => void;
  toggleItemSelection: (entityType: string, id: string) => void;
  clearSelection: (entityType: string) => void;
  getSelectedItems: (entityType: string) => string[];
  
  // Filter actions
  setFilters: (page: string, filters: Record<string, any>) => void;
  getFilters: (page: string) => Record<string, any>;
  clearFilters: (page: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  globalLoading: false,
  loadingMessage: undefined,
  modals: [],
  activeModalId: null,
  drawers: [],
  activeDrawerId: null,
  breadcrumbs: [],
  selectedItems: new Map(),
  activeFilters: new Map(),
  
  setGlobalLoading: (loading, message) =>
    set({ globalLoading: loading, loadingMessage: message }),
  
  // Modal management
  openModal: (modal) => {
    const id = `modal-${Date.now()}`;
    set((state) => ({
      modals: [...state.modals, { ...modal, id }],
      activeModalId: id,
    }));
    return id;
  },
  
  closeModal: (id) => {
    set((state) => {
      const modalId = id || state.activeModalId;
      const modal = state.modals.find((m) => m.id === modalId);
      modal?.onClose?.();
      
      const newModals = state.modals.filter((m) => m.id !== modalId);
      return {
        modals: newModals,
        activeModalId: newModals.length > 0 ? newModals[newModals.length - 1].id : null,
      };
    });
  },
  
  closeAllModals: () => {
    const state = get();
    state.modals.forEach((modal) => modal.onClose?.());
    set({ modals: [], activeModalId: null });
  },
  
  // Drawer management
  openDrawer: (drawer) => {
    const id = `drawer-${Date.now()}`;
    set((state) => ({
      drawers: [...state.drawers, { ...drawer, id }],
      activeDrawerId: id,
    }));
    return id;
  },
  
  closeDrawer: (id) => {
    set((state) => {
      const drawerId = id || state.activeDrawerId;
      const drawer = state.drawers.find((d) => d.id === drawerId);
      drawer?.onClose?.();
      
      const newDrawers = state.drawers.filter((d) => d.id !== drawerId);
      return {
        drawers: newDrawers,
        activeDrawerId: newDrawers.length > 0 ? newDrawers[newDrawers.length - 1].id : null,
      };
    });
  },
  
  closeAllDrawers: () => {
    const state = get();
    state.drawers.forEach((drawer) => drawer.onClose?.());
    set({ drawers: [], activeDrawerId: null });
  },
  
  // Breadcrumb management
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  addBreadcrumb: (breadcrumb) =>
    set((state) => ({
      breadcrumbs: [...state.breadcrumbs, breadcrumb],
    })),
  
  // Selection management
  selectItem: (entityType, id) =>
    set((state) => {
      const selected = new Map(state.selectedItems);
      const entitySet = selected.get(entityType) || new Set();
      entitySet.add(id);
      selected.set(entityType, entitySet);
      return { selectedItems: selected };
    }),
  
  deselectItem: (entityType, id) =>
    set((state) => {
      const selected = new Map(state.selectedItems);
      const entitySet = selected.get(entityType);
      if (entitySet) {
        entitySet.delete(id);
        if (entitySet.size === 0) {
          selected.delete(entityType);
        } else {
          selected.set(entityType, entitySet);
        }
      }
      return { selectedItems: selected };
    }),
  
  toggleItemSelection: (entityType, id) => {
    const state = get();
    const entitySet = state.selectedItems.get(entityType);
    if (entitySet?.has(id)) {
      state.deselectItem(entityType, id);
    } else {
      state.selectItem(entityType, id);
    }
  },
  
  clearSelection: (entityType) =>
    set((state) => {
      const selected = new Map(state.selectedItems);
      selected.delete(entityType);
      return { selectedItems: selected };
    }),
  
  getSelectedItems: (entityType) => {
    const state = get();
    const entitySet = state.selectedItems.get(entityType);
    return entitySet ? Array.from(entitySet) : [];
  },
  
  // Filter management
  setFilters: (page, filters) =>
    set((state) => {
      const newFilters = new Map(state.activeFilters);
      newFilters.set(page, filters);
      return { activeFilters: newFilters };
    }),
  
  getFilters: (page) => {
    const state = get();
    return state.activeFilters.get(page) || {};
  },
  
  clearFilters: (page) =>
    set((state) => {
      const newFilters = new Map(state.activeFilters);
      newFilters.delete(page);
      return { activeFilters: newFilters };
    }),
}));
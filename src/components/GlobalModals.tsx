import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useUIStore } from '@/stores/uiStore';

export const GlobalModals: React.FC = () => {
  const { modals, activeModalId, closeModal } = useUIStore();
  
  const activeModal = modals.find((modal) => modal.id === activeModalId);
  
  if (!activeModal) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  
  return (
    <Dialog open={true} onOpenChange={() => closeModal()}>
      <DialogContent className={sizeClasses[activeModal.size || 'md']}>
        {activeModal.title && (
          <DialogHeader>
            <DialogTitle>{activeModal.title}</DialogTitle>
          </DialogHeader>
        )}
        {activeModal.content}
      </DialogContent>
    </Dialog>
  );
};

export const GlobalDrawers: React.FC = () => {
  const { drawers, activeDrawerId, closeDrawer } = useUIStore();
  
  const activeDrawer = drawers.find((drawer) => drawer.id === activeDrawerId);
  
  if (!activeDrawer) return null;
  
  const sizeClasses = {
    sm: activeDrawer.position === 'left' || activeDrawer.position === 'right' ? 'w-80' : 'h-80',
    md: activeDrawer.position === 'left' || activeDrawer.position === 'right' ? 'w-96' : 'h-96',
    lg: activeDrawer.position === 'left' || activeDrawer.position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
  };
  
  return (
    <Drawer open={true} onOpenChange={() => closeDrawer()}>
      <DrawerContent className={sizeClasses[activeDrawer.size || 'md']}>
        {activeDrawer.title && (
          <DrawerHeader>
            <DrawerTitle>{activeDrawer.title}</DrawerTitle>
          </DrawerHeader>
        )}
        {activeDrawer.content}
      </DrawerContent>
    </Drawer>
  );
};

// Global loading overlay
export const GlobalLoadingOverlay: React.FC = () => {
  const { globalLoading, loadingMessage } = useUIStore();
  
  if (!globalLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {loadingMessage && (
          <p className="text-sm font-medium text-muted-foreground">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
};
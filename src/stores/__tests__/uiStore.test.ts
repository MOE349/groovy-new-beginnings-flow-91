import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUIStore } from '@/stores/uiStore';

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useUIStore());
    act(() => {
      result.current.closeAllModals();
      result.current.closeAllDrawers();
      result.current.setBreadcrumbs([]);
      result.current.setGlobalLoading(false);
    });
  });

  describe('Global Loading', () => {
    it('sets global loading state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setGlobalLoading(true, 'Loading data...');
      });

      expect(result.current.globalLoading).toBe(true);
      expect(result.current.loadingMessage).toBe('Loading data...');

      act(() => {
        result.current.setGlobalLoading(false);
      });

      expect(result.current.globalLoading).toBe(false);
    });
  });

  describe('Modal Management', () => {
    it('opens and closes modals', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.modals).toHaveLength(0);

      let modalId: string = '';
      act(() => {
        modalId = result.current.openModal({
          title: 'Test Modal',
          content: 'Modal content',
        });
      });

      expect(result.current.modals).toHaveLength(1);
      expect(result.current.activeModalId).toBe(modalId);
      expect(result.current.modals[0].title).toBe('Test Modal');

      act(() => {
        result.current.closeModal(modalId);
      });

      expect(result.current.modals).toHaveLength(0);
      expect(result.current.activeModalId).toBeNull();
    });

    it('manages multiple modals', () => {
      const { result } = renderHook(() => useUIStore());

      let modal1Id: string = '';
      let modal2Id: string = '';

      act(() => {
        modal1Id = result.current.openModal({ content: 'Modal 1' });
        modal2Id = result.current.openModal({ content: 'Modal 2' });
      });

      expect(result.current.modals).toHaveLength(2);
      expect(result.current.activeModalId).toBe(modal2Id);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.modals).toHaveLength(1);
      expect(result.current.activeModalId).toBe(modal1Id);
    });

    it('closes all modals', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal({ content: 'Modal 1' });
        result.current.openModal({ content: 'Modal 2' });
        result.current.openModal({ content: 'Modal 3' });
      });

      expect(result.current.modals).toHaveLength(3);

      act(() => {
        result.current.closeAllModals();
      });

      expect(result.current.modals).toHaveLength(0);
      expect(result.current.activeModalId).toBeNull();
    });

    it('calls onClose callback when closing modal', () => {
      const { result } = renderHook(() => useUIStore());
      const onClose = vi.fn();

      let modalId: string = '';
      act(() => {
        modalId = result.current.openModal({
          content: 'Test',
          onClose,
        });
      });

      act(() => {
        result.current.closeModal(modalId);
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Breadcrumb Management', () => {
    it('sets and adds breadcrumbs', () => {
      const { result } = renderHook(() => useUIStore());

      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Assets', href: '/assets' },
      ];

      act(() => {
        result.current.setBreadcrumbs(breadcrumbs);
      });

      expect(result.current.breadcrumbs).toEqual(breadcrumbs);

      act(() => {
        result.current.addBreadcrumb({ label: 'Details' });
      });

      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[2]).toEqual({ label: 'Details' });
    });
  });

  describe('Selection Management', () => {
    it('manages item selection', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.selectItem('assets', '1');
        result.current.selectItem('assets', '2');
        result.current.selectItem('workorders', 'WO-1');
      });

      expect(result.current.getSelectedItems('assets')).toEqual(['1', '2']);
      expect(result.current.getSelectedItems('workorders')).toEqual(['WO-1']);

      act(() => {
        result.current.deselectItem('assets', '1');
      });

      expect(result.current.getSelectedItems('assets')).toEqual(['2']);

      act(() => {
        result.current.clearSelection('assets');
      });

      expect(result.current.getSelectedItems('assets')).toEqual([]);
    });

    it('toggles item selection', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleItemSelection('assets', '1');
      });

      expect(result.current.getSelectedItems('assets')).toEqual(['1']);

      act(() => {
        result.current.toggleItemSelection('assets', '1');
      });

      expect(result.current.getSelectedItems('assets')).toEqual([]);
    });
  });

  describe('Filter Management', () => {
    it('manages page filters', () => {
      const { result } = renderHook(() => useUIStore());

      const filters = {
        status: 'active',
        category: 'equipment',
      };

      act(() => {
        result.current.setFilters('assets', filters);
      });

      expect(result.current.getFilters('assets')).toEqual(filters);

      act(() => {
        result.current.setFilters('assets', { status: 'inactive' });
      });

      expect(result.current.getFilters('assets')).toEqual({ status: 'inactive' });

      act(() => {
        result.current.clearFilters('assets');
      });

      expect(result.current.getFilters('assets')).toEqual({});
    });
  });
});
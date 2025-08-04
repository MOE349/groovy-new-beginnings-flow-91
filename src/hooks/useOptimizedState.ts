import { useReducer, useCallback } from 'react';

interface StateAction<T> {
  type: 'SET' | 'UPDATE' | 'RESET';
  payload?: Partial<T> | T;
}

export function useOptimizedState<T extends Record<string, any>>(
  initialState: T
) {
  const reducer = useCallback((state: T, action: StateAction<T>): T => {
    switch (action.type) {
      case 'SET':
        return action.payload as T;
      case 'UPDATE':
        return { ...state, ...action.payload };
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  }, [initialState]);

  const [state, dispatch] = useReducer(reducer, initialState);

  const setState = useCallback((payload: T) => {
    dispatch({ type: 'SET', payload });
  }, []);

  const updateState = useCallback((payload: Partial<T>) => {
    dispatch({ type: 'UPDATE', payload });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { state, setState, updateState, resetState };
}
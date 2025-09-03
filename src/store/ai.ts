import { create } from 'zustand';
import { AIAssistant } from '../types';

interface AIStore extends AIAssistant {
  toggleAI: () => void;
  setSuggestions: (suggestions: string[]) => void;
  setCurrentQuery: (query: string) => void;
  clearSuggestions: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  isActive: false,
  suggestions: [],
  currentQuery: '',

  toggleAI: () => {
    set((state) => ({ isActive: !state.isActive }));
  },

  setSuggestions: (suggestions) => {
    set({ suggestions });
  },

  setCurrentQuery: (query) => {
    set({ currentQuery: query });
  },

  clearSuggestions: () => {
    set({ suggestions: [], currentQuery: '' });
  },
}));
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import { PersonDTO } from '../api/dto/PersonDTO';

interface IFamilyStore {
    persons: PersonDTO[];
    actions: {
        setPersons: (persons: PersonDTO[]) => void;
    };
}

const useFamilyStore = create<IFamilyStore>((set) => ({
    persons: [],
    actions: {
        setPersons: (persons: PersonDTO[]) => set(() => ({ persons: persons })),
    },
}));

export const usePersons = () => useFamilyStore((state) => state.persons);
export const usefamilyStoreActions = () => useFamilyStore((state) => state.actions);

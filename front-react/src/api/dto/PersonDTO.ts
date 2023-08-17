export interface PersonDTO {
    birthDate: {
        year: number;
        month: number;
        day: number;
    };
    deathDate?: {
        year: number;
        month: number;
        day: number;
    };
    firstName: string;
    lastName: string;
    motherId: string;
    fatherId: string;
    childrenIds: string[];
    spouseIds: string[];
    id: string;
    gender: string;
}

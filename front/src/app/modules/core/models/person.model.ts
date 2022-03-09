
export interface PersonV2 
{
    projectId: string,
    id: string,
    firstName: string,
    lastName: string,
    gender: string,
    birthDate: {
        year: number,
        month?: number,
        day?: number,
    },
    deathDate?: {
        year: number,
        month?: number,
        day?:number,
    }
    
    motherId?: string,
    fatherId?: string,
    spouseIds?: string[],
    childrenIds?: string[]
}
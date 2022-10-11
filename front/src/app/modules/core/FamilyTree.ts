import { PersonV2 } from "./models/person.model";

export class FamilyTree {

    private members: PersonV2[];

    constructor(members: PersonV2[]) {
        this.members = members;
    }

    getOrigins(): PersonV2[] {
        let origins = this.members
            .filter(x => x.fatherId == null && x.motherId == null)
            .filter(z => this.members.filter(qq => qq.spouseIds?.includes(z.id)).every(s => s.fatherId == null && s.motherId == null));

        return origins;
    }

    getOldestMemberYear(): number {
        let origins = this.getOrigins();
        let year = Math.min.apply(null, origins.map(x => x.birthDate.year));

        return year;
    }

    getSpouses(person: PersonV2): PersonV2[] {
        return this.members.filter(x => person.spouseIds?.includes(x.id));
    }

    getChildren(person: PersonV2): PersonV2[] {
        return this.members.filter(x => x.fatherId == person.id || x.motherId == person.id);
    }
}
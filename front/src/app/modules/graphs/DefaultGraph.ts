
import { Svg } from '@svgdotjs/svg.js';
import { PersonV2 } from 'src/app/modules/core/models/person.model';
import { IGlyph } from './elements/glyphs/IGlyph';
import { PersonGlyph } from './elements/glyphs/PersonGlyph';
import { RelationGlyph } from './elements/glyphs/RelationGlyph';

export class DefaultGraph {

    config = {
        segmentLength: 100,
        segmentHeight: 14,
        segmentSpacing: 3,
        resolution: 10,

        timeAxisBackground: "#f9f9f9",
        timeAxisForeground: "black",

        graphBackground: "white",
        graphNames: "#000D",
        graphRelations: "#777",

        segmentColorMale: "#07698a88",
        segmentColorFemale: "#ff666e88",

        gridLines: "#00000008",
    }

    private startYear = 0;
    private members: PersonV2[];
    private xOffset = 10;
    private yOffset = 10;
    private glyphs: IGlyph[] = [];

    constructor(members: PersonV2[]) {
        this.members = members;
        this.build();
    }

    draw(context: Svg) {
        this.glyphs.forEach(x => x.draw(context));
    }

    private build() {
        let origins = this.members
            .filter(x => x.fatherId == null && x.motherId == null)
            .filter(z => this.members.filter(qq => qq.spouseIds?.includes(z.id)).every(s => s.fatherId == null && s.motherId == null))

        this.startYear = origins[0].birthDate.year;
        this.buildPerson(origins[0])
    }

    private buildPerson(person: PersonV2) {
        if (person == null)
            return;

        // build for current person
        let personGlyph = new PersonGlyph(this.xOffset + this.getLifespanOffset(person), this.yOffset, person, this.config)
        this.glyphs.push(personGlyph);

        // build for spouse
        this.members
            .filter(x => person.spouseIds?.includes(x.id))
            .map(spouse => {
                this.yOffset += this.config.segmentHeight + this.config.segmentSpacing;
                this.glyphs.push(new PersonGlyph(this.xOffset + this.getLifespanOffset(spouse), this.yOffset, spouse, this.config))
            })

        // build relations
        let parentsGlyph = (this.glyphs.filter(x => x instanceof PersonGlyph) as PersonGlyph[])
            .filter(x => x.person.id == person.motherId || x.person.id == person.fatherId);
        if (parentsGlyph?.length > 0)
            this.glyphs.push(new RelationGlyph(personGlyph, parentsGlyph, this.config.graphRelations))

        // build for children
        this.yOffset += 40;
        this.members
            .filter(x => x.fatherId == person.id || x.motherId == person.id)
            .sort((a, b) => a.birthDate.year < b.birthDate.year ? 1 : -1)
            .map(y => this.buildPerson(y))
    }

    private getLifespanOffset(person: PersonV2) {
        let resolution = this.config.resolution;
        let segmentLength = this.config.segmentLength;
        let segmentSpacing = this.config.segmentSpacing;

        return (person.birthDate.year - this.startYear) / resolution * segmentLength + segmentSpacing * (Math.floor((person.birthDate.year - (Math.floor(this.startYear / resolution) * resolution)) / resolution)) + 5;
    }
}
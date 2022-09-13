import { Svg } from "@svgdotjs/svg.js";
import { IGlyph } from "./IGlyph";
import { PersonGlyph } from "./PersonGlyph";

export class RelationGlyph implements IGlyph {

    private parentsGlyph: PersonGlyph[];
    private personGlyph: PersonGlyph;
    private color: string;

    constructor(personGlyph: PersonGlyph, parentsGlyph: PersonGlyph[], color: string) {
        this.personGlyph = personGlyph;
        this.parentsGlyph = parentsGlyph;
        this.color = color;
    }

    draw(context: Svg): void 
    {
        let yMin = Math.min(...this.parentsGlyph.map(x => x.y)) + 6;

        for (let parent of this.parentsGlyph)
        {
            context.circle(6).move(this.personGlyph.x - 3, parent.y + 4).fill(this.color);
        }

        context.line(this.personGlyph.x, this.personGlyph.y, this.personGlyph.x, yMin).stroke({ color: this.color, width: 1, linecap: 'round' });
    }

}
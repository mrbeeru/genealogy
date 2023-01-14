import { G } from "@svgdotjs/svg.js";
import { Shape, Svg } from "@svgdotjs/svg.js";
import { IGlyph } from "./IGlyph";
import { PersonGlyph } from "./PersonGlyph";

export class RelationGlyph implements IGlyph {

    private parentsGlyph: PersonGlyph[];
    private personGlyph: PersonGlyph;
    private color: string;

    private shapeGroup!: G;

    constructor(personGlyph: PersonGlyph, parentsGlyph: PersonGlyph[], color: string) {
        this.personGlyph = personGlyph;
        this.parentsGlyph = parentsGlyph;
        this.color = color;
    }

    draw(context: G): void 
    {
        let yMin = Math.min(...this.parentsGlyph.map(x => x.y)) + 6;

        this.shapeGroup = context.group();

        for (let parent of this.parentsGlyph)
        {
            let shape = context.circle(6).move(this.personGlyph.x - 3, parent.y + 4).fill(this.color);
            this.shapeGroup.add(shape)
        }

        let shape = context.line(this.personGlyph.x, this.personGlyph.y, this.personGlyph.x, yMin).stroke({ color: this.color, width: 1, linecap: 'round' });
        this.shapeGroup.add(shape);
    }

    dragMove(x: number, y: number)
    {
        this.shapeGroup.translate(x, y)
    }

    scaleX(scalex: number)
    {
        this.shapeGroup.move(this.personGlyph.x * scalex - 3, this.shapeGroup.bbox().y)
    }
}
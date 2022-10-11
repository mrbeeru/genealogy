import { Rect } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { PersonV2 } from "src/app/modules/core/models/person.model";
import { IGlyph } from "./IGlyph";

export class LifespanGlyph implements IGlyph{

    private person: PersonV2;
    private x: number;
    private y: number;
    private segmentLength: any;
    private segmentHeight: any;
    private resolution: any;
    private segmentColorFemale: any;
    private segmentColorMale: any;
    private group: any;
    private svgSegment!: Rect;

    constructor(x: number, y: number, person: PersonV2, config: any) {
        this.x = x;
        this.y = y;
        this.person = person;

        this.segmentLength = config.segmentLength;
        this.segmentHeight = config.segmentHeight;
        this.resolution = config.resolution;
    }


    draw(context: Svg): void {
        throw new Error("Method not implemented.");
    }

    dragMove(x: number, y: number): void {
        throw new Error("Method not implemented.");
    }

    private drawLifeSegments(context: Svg): void {
        const presentYear: number = new Date().getUTCFullYear();
        const fillColor = this.person.gender == "f" ? this.segmentColorFemale : this.segmentColorMale;
        const birthYear = this.person.birthDate.year;
        const endYear = this.person.deathDate?.year ?? presentYear;
        const age = endYear - birthYear;

        let length = age / this.resolution * this.segmentLength

        this.svgSegment = context.rect(length, this.segmentHeight)
            .move(this.x, this.y)
            .fill(fillColor)
            .stroke({ color: fillColor, opacity: 1, width: 1 });

        this.group.add(this.svgSegment);
        //this.group.on("click", (x) => this.svgSegment.stroke({ color: "black", opacity: 0.5, width: 2 }))
    }
}
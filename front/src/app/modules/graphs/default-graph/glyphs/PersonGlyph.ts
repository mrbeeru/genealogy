import { G, Rect, Shape, Svg, Text } from "@svgdotjs/svg.js";
import { PersonV2 } from "src/app/modules/core/models/person.model";
import { IGlyph } from "./IGlyph";
import '@svgdotjs/svg.draggable.js'

export class PersonGlyph implements IGlyph {

    x: number;
    y: number;
    person: PersonV2;

    private resolution: number;
    private textColor: string = "#000D";
    private textSize: number = 11;
    private textWeight: string = "500";

    private segmentLength: number;
    private segmentHeight: number;
    private segmentColorMale: string = "#07698a88";
    private segmentColorFemale: string = "#ff666e88";

    private svgSegment!: Rect;
    private svgText!: Text;
    private group!: G;

    constructor(x: number, y: number, person: PersonV2, config: any) {
        this.x = x;
        this.y = y;
        this.person = person;

        this.segmentLength = config.segmentLength;
        this.segmentHeight = config.segmentHeight;
        this.resolution = config.resolution;
    }

    draw(context: Svg): void {
        this.group = context.group();

        this.drawLifeSegments(context);
        this.drawText(context);
    }

    dragMove(x: number, y: number) {
        this.svgSegment.translate(x, y);
        this.svgText.translate(x, y);
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

    private drawText(context: Svg): void {
        let name = `${this.person.lastName} ${this.person.firstName}`;

        if (this.person.firstName == null || this.person.firstName === "")
            name = "<Child of " + this.person.lastName + ">";

        this.svgText = context.text(name)
            .move(this.x + 5, this.y + this.segmentHeight / 2 - this.textSize + 2)
            .font({ fill: this.textColor, size: this.textSize, weight: this.textWeight })

        this.group.add(this.svgText);
    }
}
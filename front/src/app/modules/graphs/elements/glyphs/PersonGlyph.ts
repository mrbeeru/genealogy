import { Rect, Svg, Text } from "@svgdotjs/svg.js";
import { PersonV2 } from "src/app/modules/core/models/person.model";
import { IGlyph } from "./IGlyph";

export class PersonGlyph implements IGlyph{

    x: number;
    y: number;
    person: PersonV2;

    private lifeSegments: Rect[] = [];
    private text!: Text;

    private resolution: number;

    private textColor: string = "#000D";
    private textSize: number = 11;
    private textWeight: string = "500";

    private segmentLength: number;
    private segmentHeight: number;
    private segmentSpacing: number;
    private segmentColorMale: string = "#07698a88";
    private segmentColorFemale: string = "#ff666e88";

    private relationColor: string = "#777"

    private presentYear: number = new Date().getUTCFullYear();

    constructor(x: number, y: number, person: PersonV2, config: any) {
        this.x = x;
        this.y = y;
        this.person = person;

        this.segmentLength = config.segmentLength;
        this.segmentHeight = config.segmentHeight;
        this.segmentSpacing = config.segmentSpacing;
        this.resolution = config.resolution;
    }

    draw(context: Svg): void {
        this.drawLifeSegments(context);
        this.drawText(context);
    }

    private drawLifeSegments(context: Svg) : void
    {
        const fillColor = this.person.gender == "f" ? this.segmentColorFemale : this.segmentColorMale;
        const birthYear = this.person.birthDate.year;
        const endYear = this.person.deathDate?.year ?? this.presentYear;
        const age = endYear - birthYear;

        let xOffset = 0;
        let year = birthYear;

        while (year < endYear)
        {
            let increment = 0;

            if ((endYear % this.resolution == 0 ? this.resolution : endYear % this.resolution) > age){
                // case when lifespan fits into 1 segment
                increment = age;
            } else if (year % this.resolution != 0 && year == birthYear ){
                // first segment, when lifespan is greater than a segment 
                increment = (this.resolution - (year % this.resolution))
            }
            else {
                // case when full segment (the middle segments)
                increment = year + this.resolution <= endYear ? this.resolution : (endYear % this.resolution);
            }

            let length = increment / this.resolution * this.segmentLength;

            if (length <= 0)
                throw new Error(`Found segment of length <= 0 (${length}) for person 
                                ${this.person.firstName} ${this.person.lastName} - born ${this.person.birthDate.year}`);

            let rect = context.rect(length, this.segmentHeight)
                .move(this.x + xOffset, this.y)
                .fill(fillColor);
            
            this.lifeSegments.push(rect);

            xOffset += length + this.segmentSpacing;
            year += increment;
        }
    }

    private drawRelations(context: Svg) : void 
    {
        let cnt = this.person.motherId == null || this.person.fatherId == null ? 1 : 2;
        
        //draw bumps
        context.circle(6).move(this.x - 3, this.y - 30).fill(this.relationColor)

        if (cnt == 2)
            context.circle(6).move(this.x - 3, this.y - 30 - this.segmentHeight - this.segmentSpacing).fill(this.relationColor)

        //draw relation line
        context.line(this.x, this.y, this.x, this.y - 30).stroke({ color: this.relationColor, width: 1, linecap: 'round' })
    }

    private drawText(context: Svg) : void
    {
        let name = `${this.person.lastName} ${this.person.firstName}`;
        this.text = context.text(name)
            .move(this.x + 5, this.y + this.segmentHeight/2 - this.textSize + 2)
            .font({ fill: this.textColor, size: this.textSize, weight: this.textWeight})
    }

}
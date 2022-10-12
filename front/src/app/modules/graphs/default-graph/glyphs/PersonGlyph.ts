import { G, Image, Rect, Shape, Svg, Text } from "@svgdotjs/svg.js";
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
    private svgImage!: Image;
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
        this.drawImage(context);
    }

    dragMove(x: number, y: number) {
        this.svgSegment.translate(x, y);
        this.svgText.translate(x, y);
        this.svgImage.translate(x, y)
    }


    private drawLifeSegments(context: Svg): void {
        const fillColor = this.person.gender == "f" ? this.segmentColorFemale : this.segmentColorMale;
        let length = this.getLifespanLengthInPixels();

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

        let xPos = this.getLifespanLengthInPixels() < this.segmentHeight + 20 ?
            this.x : 
            this.x + this.segmentHeight;

        xPos += 5;

        this.svgText = context.text(name)
            .move(xPos, this.y + this.segmentHeight / 2 - this.textSize + 2)
            .font({ fill: this.textColor, size: this.textSize, weight: this.textWeight })

        this.group.add(this.svgText);
    }

    private drawImage(context: Svg): void {
        let padding = 4;
        let xPos = this.x;
        let length = this.getLifespanLengthInPixels()

        if (length < this.segmentHeight + 20)
            xPos -= this.segmentHeight - padding/2;
        else 
            xPos += padding/2;


        //this.svgImage = context.image("https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png")
        //this.svgImage = context.image("https://lh3.googleusercontent.com/x1L98H2-cWERI4uBPlrhNmyZGy-dBpg8DCSBxZCgJqfFfzmj2VjdD2K2u1vdZc7DbKanyUu4_SkB2-naof2WwLcRwA=w128-h128-e365-rj-sc0x00ffffff")
        this.svgImage = context.image("https://nearmeplus.com/images/blogs/thumb/8467bc26f05dfb20ba1a169ebc0e5791.jpg")
            .size(this.segmentHeight - padding, this.segmentHeight - padding)
            .move(xPos , this.y + padding/2)
            .attr('background', "black")
            .attr('clip-path', "inset(0% round 20px)")

        this.group.add(this.svgImage);
    }

    private getLifespanLengthInPixels(): number{
        const presentYear: number = new Date().getUTCFullYear();
        const birthYear = this.person.birthDate.year;
        const endYear = this.person.deathDate?.year ?? presentYear;
        const age = endYear - birthYear;
        let length = age / this.resolution * this.segmentLength
        return length;
    }
}
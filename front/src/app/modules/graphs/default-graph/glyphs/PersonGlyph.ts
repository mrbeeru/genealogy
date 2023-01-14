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

    private svgImagePadding = 4;


    private segmentLength: number;
    private segmentHeight: number;
    private segmentColorMale: string = "#07698a88";
    private segmentColorFemale: string = "#ff666e88";
    private segmentScaleX: number = 1;

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

    draw(context: G): void {
        this.group = context.group();

        this.drawLifeSegments(this.group);
        this.drawText(this.group);
        this.drawImage(this.group);

        this.group.on("mouseover", (x) => {
            this.highlight();
        })

        this.group.on("mouseleave", (x) => {
            this.clearHighlight();
        })
    }

    dragMove(x: number, y: number) {
        this.svgSegment.translate(x, y);
        this.svgText.translate(x, y);
        this.svgImage.translate(x, y)
    }

    scaleX(scalex: number)
    {
        this.segmentScaleX = scalex;

        var newLength = this.getLifespanLengthInPixels() * this.segmentScaleX ;
        this.svgSegment.size(newLength, this.segmentHeight).move(this.x  * this.segmentScaleX , this.y);

        let [xPosText, yPosText] = this.getTextPosition();
        this.svgText.move(xPosText, yPosText);

        let [xPosIcon, yPosIcon] = this.getIconPosition();
        this.svgImage.move(xPosIcon, yPosIcon);
    }


    private drawLifeSegments(context: G): void {
        const fillColor = this.person.gender == "f" ? this.segmentColorFemale : this.segmentColorMale;
        let length = this.getLifespanLengthInPixels();

        this.svgSegment = context.rect(length, this.segmentHeight)
            .move(this.x, this.y)
            .fill(fillColor)
            .stroke({ color: fillColor, opacity: 1, width: 1 })
            .attr({'matTooltip': 'test'});

        this.group.add(this.svgSegment);
    }

    private drawText(context: G): void {
        let name = `${this.person.lastName} ${this.person.firstName}`;

        if (this.person.firstName == null || this.person.firstName === "")
            name = "<Child of " + this.person.lastName + ">";

        let [xpos, ypos] = this.getTextPosition();

        this.svgText = context.text(name)
            .move(xpos, ypos)
            .font({ fill: this.textColor, size: this.textSize, weight: this.textWeight })

        this.group.add(this.svgText);
    }

    private drawImage(context: G): void {
        let [xpos, ypos] = this.getIconPosition();

        //this.svgImage = context.image("https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png")
        //this.svgImage = context.image("https://lh3.googleusercontent.com/x1L98H2-cWERI4uBPlrhNmyZGy-dBpg8DCSBxZCgJqfFfzmj2VjdD2K2u1vdZc7DbKanyUu4_SkB2-naof2WwLcRwA=w128-h128-e365-rj-sc0x00ffffff")
        this.svgImage = context.image("https://nearmeplus.com/images/blogs/thumb/8467bc26f05dfb20ba1a169ebc0e5791.jpg")
            .size(this.segmentHeight - this.svgImagePadding, this.segmentHeight - this.svgImagePadding)
            .move(xpos , ypos)
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

    private highlight(){
        const fillColor = this.person.gender == "f" ? this.segmentColorFemale : this.segmentColorMale;

        this.svgSegment
            .attr("cursor", "pointer")
            //.attr("filter", "drop-shadow(0 0 0.6rem rgba(0, 0, 0, 0.5)"); 
            .stroke({ color: fillColor, opacity: 1, width: 4 })
    }

    private clearHighlight(){
        this.svgSegment.stroke({ width: 1 })
    }

    private getTextPosition(){
        let xPos = this.x * this.segmentScaleX;
        xPos += this.getLifespanLengthInPixels() < this.segmentHeight + 20 ?
        0 : 
        this.segmentHeight;



        let yPos = this.y + this.segmentHeight / 2 - this.textSize + 2

        return [xPos, yPos]
    }

    private getIconPosition() {

        let ypos = this.y + this.svgImagePadding/2
        let xpos = this.x * this.segmentScaleX;

        let length = this.getLifespanLengthInPixels()
        if (length < this.segmentHeight + 20)
            xpos -= this.segmentHeight - this.svgImagePadding/2;
        else 
            xpos += this.svgImagePadding/2;

        return [xpos, ypos];
    }
}
import { Line } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { GridLineGlyph } from "./GridLineGlyph";
import { IGlyph } from "./IGlyph";

export class GridGlyph implements IGlyph
{
    private startYear: number; 
    private presentYear: number;
    private resolution: number; 
    private segmentLength: number;
    private xOffset: number;
    private lineGlyphs: GridLineGlyph[] = [];

    private colors: {
        gridLines: "#000",
        gridIndicator: "#000"
    }

    private indicatorLine!: Line;

    constructor(startYear: number, presentYear: number, resolution: number, segmentLength: number, xOffset: number, colors: any) {
        this.startYear = startYear;
        this.resolution = resolution;
        this.segmentLength = segmentLength;
        this.presentYear = presentYear;
        this.xOffset = xOffset
        this.colors = colors;
    }

    draw(context: G): void {
        let height = 2000;
        let endYear = this.presentYear;
        let numIterations = (endYear - this.startYear) / this.resolution
        let diff = (this.startYear % this.resolution) / this.resolution * this.segmentLength
    
        for (let i = 0; i < numIterations + 1; i++) {
            const xPos = i * this.segmentLength - diff + this.xOffset;
            this.lineGlyphs.push(new GridLineGlyph(xPos, height, this.colors));
        }

        this.lineGlyphs.map(x => x.draw(context));

        this.indicatorLine = context.line(0 , 0, 0, 2000).stroke({ color: this.colors.gridIndicator, width: 2 })
        this.indicatorLine.attr({"stroke-dasharray": 5})
    }

    moveIndicator(x: number, dx: number, scale: number){
        var xpos = (x - dx) / scale;
        let maxXpos = Math.ceil((this.presentYear - this.startYear) / this.resolution) * this.segmentLength;
        
        xpos = xpos < 0 ? 0 : xpos > maxXpos ? maxXpos : xpos;
        
        this.indicatorLine.transform({translateX: xpos})
    }
}
import { Line } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { IGlyph } from "./IGlyph";

export class GridGlyph implements IGlyph
{
    private startYear: number; 
    private presentYear: number;
    private resolution: number; 
    private segmentLength: number;
    private xOffset: number;


    private colors: {
        gridLines: "#000",
        gridIndicator: "#000"
    }

    private gridLineWidth: number = 1;

    private gridLines: Line[] = [];
    private indicatorLine!: Line;

    constructor(startYear: number, presentYear: number, resolution: number, segmentLength: number, xOffset: number, colors: any) {
        this.startYear = startYear;
        this.resolution = resolution;
        this.segmentLength = segmentLength;
        this.presentYear = presentYear;
        this.xOffset = xOffset

        this.colors = colors;
    }

    draw(context: Svg): void {
        let height = 2000;
        let endYear = this.presentYear;
        let numIterations = (endYear - this.startYear) / this.resolution
        let diff = (this.startYear % this.resolution) / this.resolution * this.segmentLength
    
        for (let i = 0; i < numIterations + 1; i++) {
          const xPos = i * this.segmentLength - diff + this.xOffset;
          let line = context.line(xPos , 0, xPos, height).stroke({ color: this.colors.gridLines, width: this.gridLineWidth })
          this.gridLines.push(line)
        }

        this.indicatorLine = context.line(0 , 0, 0, 2000).stroke({ color: this.colors.gridIndicator, width: 2 })
        this.indicatorLine.attr({"stroke-dasharray": 5})
    }

    dragMove(x: number, y: number)
    {
        for (let line of this.gridLines)
            line.translate(x, 0)

        this.indicatorLine.translate(x, 0)
    }

    moveIndicator(x: number){
        this.indicatorLine.transform({translateX: x})
    }
    
}
import { Line } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { IGlyph } from "./IGlyph";

export class GridGlyph implements IGlyph
{
    startYear: number; 
    presentYear: number;
    resolution: number; 
    segmentLength: number;

    private gridLineColor: string = "#0000001F";
    private gridLineWidth: number = 1;

    private gridLines: Line[] = [];

    constructor(startYear: number, presentYear: number, resolution: number, segmentLength: number) {
        this.startYear = startYear;
        this.resolution = resolution;
        this.segmentLength = segmentLength;
        this.presentYear = presentYear;   
    }

    draw(context: Svg): void {
        let height = 2000;
        let endYear = this.presentYear;
        let numIterations = (endYear - this.startYear) / this.resolution
        let diff = (this.startYear % this.resolution) / this.resolution * this.segmentLength
    
        for (let i = 0; i < numIterations + 1; i++) {
          const xPos = i * this.segmentLength - diff;
          let line = context.line(xPos , 0, xPos, height).stroke({ color: this.gridLineColor, width: this.gridLineWidth })
          this.gridLines.push(line)
        }
    }

    dragMove(x: number, y: number)
    {
        for (let line of this.gridLines)
        {
            line.translate(x, 0)
        }
    }
    
}
import { Line, Text } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";

export class TimeAxis
{
    private startYear: number;
    private endYear: number;
    private resolution: number;
    private segmentLength: number;
    private xOffset: number;

    private group!: G;
    private line!: Line;
    private txt!: Text;

    private colors: {
        gridIndicator: "#000",
        timeAxisForeground: "#000"
    };

    constructor(config: any, colors: any) {
        this.resolution = config.resolution;
        this.segmentLength = config.segmentLength;
        this.startYear = config.startYear;
        this.endYear = config.endYear;
        this.colors = colors;
        this.xOffset = config.xOffset;
    }

    move(x: number)
    {
        this.group.translate(x, 0);
        this.line.translate(x, 0)
        this.txt.translate(x, 0)
    }

    moveIndicator(x: number, dragX: number)
    {
        this.line.transform({translateX: x})
        this.txt.transform({translateX: x})

        //update year indicator
        let year = (x-dragX) / (this.segmentLength/this.resolution) + this.startYear - this.startYear%this.resolution
        this.txt.text(`${year}`)
    }

    draw(context: Svg)
    {
        this.group = context.group();

        let year = this.startYear - this.startYear % this.resolution;
        let iterations = (this.endYear - this.startYear) / this.resolution + 1;
        let diff = (this.startYear % this.resolution) / this.resolution * this.segmentLength;
        let textWidth = 28;


        for (let i = 0; i < iterations; i++)
        {
            let txt = context.text(`${year + i * this.resolution}`).move( (i)* this.segmentLength - textWidth / 2 - diff + this.xOffset , 16).font({ fill: this.colors.timeAxisForeground, size: 12, weight: '500' });
            this.group.add(txt);
        }

        this.line = context.line(0, 0, 0, 40).stroke({ color: this.colors.gridIndicator, width: 6 })
        this.txt = context.text("0000").font({ fill: this.colors.timeAxisForeground, size: 14, weight: '500' }).move(-16, 0);
    }

    drag!: { x: any; y: any; isDragging: boolean; };

    resizeTimeAxis(resizeX: number)
    {
        
    }
}
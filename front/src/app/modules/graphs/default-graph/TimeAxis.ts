import { G } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";

export class TimeAxis
{
    timeAxisForeground = "black";

    private startYear: number;
    private endYear: number;
    private resolution: number;
    private segmentLength: number;

    private group!: G 

    constructor(config: any) {
        this.resolution = config.resolution;
        this.segmentLength = config.segmentLength;
        this.startYear = config.startYear;
        this.endYear = config.endYear;
    }

    move(x: number)
    {
        this.group.translate(x, 0);
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
            let txt = context.text(`${year + i * this.resolution}`).move( (i)* this.segmentLength - textWidth / 2 - diff , 10).font({ fill: this.timeAxisForeground, size: 12, weight: '500' });
            this.group.add(txt);
        }
    }
}
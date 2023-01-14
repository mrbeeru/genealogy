import { Line } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { IGlyph } from "./IGlyph";

export class GridLineGlyph implements IGlyph
{
    private x: number;
    private height: number = 2000;
    private gridLineWidth: number = 1;

    private svgLine!: Line;

    private colors = {
        gridLines: "#000",
        gridIndicator: "#000"
    }

    constructor(x: number, height: number, colors: any) {
        this.x = x;
        this.height = height;
        this.colors = colors
    }

    draw(context: G): void {

        this.svgLine = context.line(this.x , 0, this.x, this.height)
                          .stroke({ color: this.colors.gridLines, width: this.gridLineWidth })
    }

    dragMove(x: number, y: number): void {
        this.svgLine.translate(x, 0)
    }

    scaleX(scalex: number)
    {
        this.svgLine.move(this.x *  scalex, 0);
    }

}
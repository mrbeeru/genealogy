
import { Svg } from '@svgdotjs/svg.js';

export interface IGlyph
{
    draw(context: Svg) : void;
    dragMove(x: number, y:number) : void
}
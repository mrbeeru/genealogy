
import { G } from '@svgdotjs/svg.js';
import { Svg } from '@svgdotjs/svg.js';

export interface IGlyph
{
    draw(context: G) : void;
}
import { Vector2d } from 'konva/lib/types';
import { Line } from 'react-konva';

export default function Indicator({ mousePos, offset }: { mousePos: Vector2d; offset: Vector2d }) {
    return (
        <Line points={[mousePos.x - offset.x, 40, mousePos.x - offset.x, 1440]} stroke={'#7777'} dash={[5, 5]}></Line>
    );
}

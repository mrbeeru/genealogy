import { Vector2d } from 'konva/lib/types';
import { Circle, Line } from 'react-konva';

export default function Relation({
    personPos,
    parentsPos,
    zoom,
}: {
    personPos: Vector2d;
    parentsPos: Vector2d[];
    zoom: number;
}) {
    const segmentHeight = 20;
    const radius = 2 + Math.log10(zoom);

    return (
        <>
            {parentsPos.map((p) => (
                <Circle radius={radius} x={personPos.x} y={p.y + segmentHeight / 2} fill="black" />
            ))}
            <Circle radius={radius} x={personPos.x} y={personPos.y} fill="black" />
            <Line
                points={[
                    personPos.x,
                    Math.min(...parentsPos.map((x) => x.y)) + segmentHeight / 2,
                    personPos.x,
                    personPos.y,
                ]}
                stroke="#0007"
                strokeWidth={1 / zoom}
            />
        </>
    );
}

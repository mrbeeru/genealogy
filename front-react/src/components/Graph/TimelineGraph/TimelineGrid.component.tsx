import { Vector2d } from 'konva/lib/types';
import { useRef } from 'react';
import { Group, Layer, Line, Rect, Stage, Text } from 'react-konva';

export default function TimelineGrid({
    drag,
    zoom,
    minYear,
    mousePos,
}: {
    drag: Vector2d;
    zoom: number;
    minYear: number;
    mousePos: Vector2d;
}) {
    const width = 2560;
    const height = 1280;
    const timestamps = drawTimeaxis(minYear, 2022, 100, 10, zoom);
    const indicatorRef = useRef<any>(null);

    return (
        <Stage width={width} height={height} style={{ overflow: 'hidden' }}>
            <Layer height={40} mouse>
                <Rect width={width} height={40} fill="#999"></Rect>
                <Group offset={{ x: -drag.x, y: 0 }}>
                    {timestamps.map((x) => x)}
                    <Line
                        ref={indicatorRef}
                        points={[mousePos.x - drag.x, 40, mousePos.x - drag.x, 1440]}
                        stroke={'#7777'}
                        dash={[5, 5]}
                    ></Line>
                </Group>
            </Layer>
        </Stage>
    );
}

function drawTimeaxis(
    startYear: number,
    endYear: number,
    segmentLength: number,
    resolution: number,
    zoom: number
): React.ReactNode[] {
    let year = startYear - (startYear % resolution);
    let iterations = (endYear - startYear) / resolution + 1;
    let diff = ((startYear % resolution) / resolution) * segmentLength;

    if (zoom < 0.5) {
        iterations /= 2;
        segmentLength = 200;
        resolution = 20;
    } else if (zoom < 5) {
    } else if (zoom >= 5) {
        iterations *= 10;
        segmentLength = 10;
        resolution = 1;
    }

    let elements: React.ReactNode[] = [];

    for (let i = 0; i < iterations; i++) {
        const x = (i * segmentLength - diff) * zoom;
        const y = 16;

        elements.push(<Text x={x - 14} y={y} text={`${year + i * resolution}`}></Text>);
        elements.push(<Line points={[x, 40, x, 1440]} stroke={'rgba(0,0,0,0.1)'} strokeWidth={1}></Line>);
    }

    return elements;
}

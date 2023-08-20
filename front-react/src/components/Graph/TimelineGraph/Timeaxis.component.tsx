import { ReactNode } from 'react';
import { Group, Layer, Line, Rect, Stage, Text } from 'react-konva';
import Indicator from './Indicator.component';

export interface ITimeaxisProps {
    width: number;
    height: number;
    offsetX: number;
    scaleX: number;
    mouseX: number;
    startYear: number;
    endYear: number;
}

function buildTimeaxis(
    startYear: number,
    endYear: number,
    segmentLength: number,
    resolution: number,
    zoom: number
): ReactNode[] {
    let segLength = segmentLength;
    let res = resolution;

    const year = startYear - (startYear % res);
    let iterations = (endYear - startYear) / res + 1;
    const diff = ((startYear % res) / res) * segLength;

    if (zoom < 0.5) {
        iterations /= 5;
        segLength = 500;
        res = 50;
    } else if (zoom >= 5) {
        iterations *= 10;
        segLength = 10;
        res = 1;
    }

    const elements: ReactNode[] = [];

    for (let i = 0; i < iterations; i += 1) {
        const x = (i * segmentLength - diff) * zoom;
        const y = 20;

        // timeaxis years
        elements.push(<Text x={x - 14} y={y} text={`${year + i * resolution}`} />);

        // timeaxis grid (the vertical lines)
        elements.push(<Line points={[x, 34, x, 1440]} stroke="#0002" strokeWidth={1} />);
    }

    return elements;
}

function getYearFromMousePosition(startYear: number, x: number, scale: number) {
    const resolution = 10;
    return startYear + Math.floor(x / (resolution * scale));
}

export default function Timeaxis({ width, height, mouseX, offsetX, scaleX, startYear, endYear }: ITimeaxisProps) {
    const resolution = 10;
    const segmentLength = 100;
    const timestamps = buildTimeaxis(startYear, endYear, segmentLength, resolution, scaleX);

    return (
        <Stage width={width} height={height + 34} style={{ overflow: 'hidden' }}>
            <Layer height={34} mouse>
                <Rect width={width} height={34} fill="#0001" />
                <Group offset={{ x: -offsetX, y: 0 }}>
                    {timestamps.map((x) => x)}
                    <Indicator
                        x={mouseX - offsetX}
                        year={getYearFromMousePosition(startYear, mouseX - offsetX, scaleX)}
                    />
                </Group>
            </Layer>
        </Stage>
    );
}

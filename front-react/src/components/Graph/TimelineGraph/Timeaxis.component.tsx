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

function scaleTimeaxis(zoom: number, iterations: number, segmentLength: number, resolution: number) {
    if (zoom < 0.5) return { iterations: iterations / 10, segmentLength: 1000, resolution: 100 };
    if (zoom >= 5) return { iterations: iterations * 10, segmentLength: 10, resolution: 1 };

    return {
        iterations,
        segmentLength,
        resolution,
    };
}

function buildTimeaxis(
    startYear: number,
    endYear: number,
    segmentLength: number,
    resolution: number,
    zoom: number
): ReactNode[] {
    const params = scaleTimeaxis(zoom, (endYear - startYear) / resolution + 1, segmentLength, resolution);
    // const diff = ((startYear % resolution) / resolution) * segmentLength;
    const year = startYear - (startYear % resolution);
    const diff = ((startYear - year) * params.segmentLength) / params.resolution;

    const elements: ReactNode[] = [];

    for (let i = 0; i < params.iterations; i += 1) {
        const x = (i * params.segmentLength - diff) * zoom;
        const y = 20;
        const text = `${year + i * params.resolution}`;

        // timeaxis years
        elements.push(<Text key={text} x={x - 14} y={y} text={text} />);

        // timeaxis grid (the vertical lines)
        elements.push(<Line key={x} points={[x, 34, x, 1440]} stroke="#0002" strokeWidth={1} />);
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

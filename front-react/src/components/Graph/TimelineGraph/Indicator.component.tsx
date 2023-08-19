import { Group, Line, Rect, Text } from 'react-konva';

export default function Indicator({ x, year }: { x: number; year: number }) {
    return (
        <>
            <Group x={-5}>
                <Rect x={x} y={0} width={10} height={34} fill="#0002"></Rect>
                <Text x={x - 10} y={4} text={`${year}`} fontStyle="bold" fontSize={13} fill="#333"></Text>
            </Group>
            <Line points={[x, 34, x, 1440]} stroke={'#7777'} dash={[5, 5]}></Line>
        </>
    );
}

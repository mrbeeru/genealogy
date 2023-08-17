import { Rect, Text } from 'react-konva';
import { PersonDTO } from '../../../api/dto/PersonDTO';

export interface LifespanProps {
    x: number;
    y: number;
    width: number;
    height: number;
    person: PersonDTO;
}

export default function Lifespan(props: LifespanProps) {
    const { x, y, width, height, person } = props;
    const segmentHeight = 20;
    const textHeight = 10;

    return (
        <>
            <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={person.gender === 'm' ? '#01A6EA88' : '#ff666e88'}
            ></Rect>
            <Text
                x={x + 4}
                y={y + (segmentHeight - textHeight) / 2}
                text={`${person.lastName} ${person.firstName}`}
            ></Text>
        </>
    );
}

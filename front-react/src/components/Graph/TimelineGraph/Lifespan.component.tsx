import { useState } from 'react';
import { Group, Text as ReactText, Rect } from 'react-konva';
import { PersonDTO } from '../../../api/dto/PersonDTO';
import measureText from '../../../utils';

export interface LifespanProps {
    x: number;
    y: number;
    width: number;
    height: number;
    person: PersonDTO;
}

const getPersonAge = (p: PersonDTO) => {
    const deathDate = p.deathDate?.year || new Date().getUTCFullYear();

    // TODO: account for months and days
    return deathDate - p.birthDate.year;
};

const getLifespanStroke = (gender: string) => (gender === 'm' ? '#01A6EAFF' : '#ff666eFF');

export default function Lifespan(props: LifespanProps) {
    const { x, y, width, height, person } = props;
    const deathAge = `✟${getPersonAge(person)}`;
    const textSize = measureText(deathAge, 10);
    const [mouseOver, setMouseOver] = useState(false);

    return (
        <Group
            onMouseEnter={() => {
                setMouseOver(true);
            }}
            onMouseLeave={() => {
                setMouseOver(false);
            }}
        >
            <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={person.gender === 'm' ? '#01A6EA88' : '#ff666e88'}
                stroke={mouseOver ? getLifespanStroke(person.gender) : ''}
            />

            <ReactText
                x={x + 4}
                y={y + (height - measureText('a', 12).height) / 2}
                text={`${person.lastName} ${person.firstName}`}
            />

            {person.deathDate?.year && (
                <ReactText
                    x={x + width - textSize.width}
                    y={y + 1 + (height - textSize.height) / 2}
                    text={deathAge}
                    fontSize={10}
                />
            )}
        </Group>
    );
}

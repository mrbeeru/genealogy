import { Text as ReactText, Rect } from 'react-konva';
import { PersonDTO } from '../../../api/dto/PersonDTO';
import { measureText } from '../../../utils';

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
    const deathAge = `✟${getPersonAge(person)}`;
    const textSize = measureText(deathAge);

    return (
        <>
            <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={person.gender === 'm' ? '#01A6EA88' : '#ff666e88'}
            ></Rect>

            <ReactText
                x={x + 4}
                y={y + (segmentHeight - textHeight) / 2}
                text={`${person.lastName} ${person.firstName}`}
            ></ReactText>

            {person.deathDate?.year && (
                <ReactText
                    x={x + width - textSize}
                    y={y + 1 + (segmentHeight - textHeight) / 2}
                    text={deathAge}
                    fontSize={10}
                ></ReactText>
            )}
        </>
    );
}

function getPersonAge(person: PersonDTO) {
    const deathDate = person.deathDate?.year || new Date().getUTCFullYear();

    //TODO: account for months and days
    return deathDate - person.birthDate.year;
}
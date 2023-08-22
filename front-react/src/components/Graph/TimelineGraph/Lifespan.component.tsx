import { useMemo, useState } from 'react';
import { Group, Text as ReactText, Rect } from 'react-konva';
import { PersonDTO } from '../../../api/dto/PersonDTO';
import measureText from '../../../utils';

interface ILifespanStyle {
    fillColorMale?: string;
    fillColorMaleActive?: string;
    fillColorFemale?: string;
    fillColorFemaleActive?: string;

    strokeColorMale?: string;
    strokeColorMaleActive?: string;
    strokeColorFemale?: string;
    strokeColorFemaleActive?: string;
}

export interface LifespanProps {
    x: number;
    y: number;
    width: number;
    height: number;
    person: PersonDTO;
    style?: ILifespanStyle;
}

const defaultStyle: ILifespanStyle = {
    fillColorMale: '#01A6EA88',
    fillColorFemale: '#ff666e88',
    fillColorMaleActive: '#01A6EA88',
    fillColorFemaleActive: '#ff666e88',

    strokeColorMale: '#01A6EA88',
    strokeColorMaleActive: '#01A6EAFF',
    strokeColorFemale: '#ff666e88',
    strokeColorFemaleActive: '#ff666eFF',
};

export default function Lifespan({ x, y, width, height, person, style = defaultStyle }: LifespanProps) {
    const sx = { ...defaultStyle, ...style };
    const [mouseOver, setMouseOver] = useState(false);

    const personAge = useMemo(() => {
        const deathDate = person.deathDate?.year || new Date().getUTCFullYear();

        // TODO: account for months and days
        return deathDate - person.birthDate.year;
    }, [person]);

    const getLifespanStroke = useMemo(() => {
        if (person.gender === 'm') {
            return mouseOver ? sx.strokeColorMaleActive : sx.strokeColorMale;
        }
        return mouseOver ? sx.strokeColorFemaleActive : sx.strokeColorFemale;
    }, [
        person.gender,
        mouseOver,
        sx.strokeColorFemaleActive,
        sx.strokeColorFemale,
        sx.strokeColorMaleActive,
        sx.strokeColorMale,
    ]);

    const getLifespanFill = useMemo(() => {
        if (person.gender === 'm') {
            return mouseOver ? sx.fillColorMaleActive : sx.fillColorMale;
        }
        return mouseOver ? sx.fillColorFemaleActive : sx.fillColorFemale;
    }, [
        person.gender,
        mouseOver,
        sx.fillColorFemaleActive,
        sx.fillColorFemale,
        sx.fillColorMaleActive,
        sx.fillColorMale,
    ]);

    const deathAge = `✟${personAge}`;
    const deathAgeTextSize = measureText(deathAge, 10);
    const personName = `${person.lastName} ${person.firstName}`;
    const personNameTextSize = measureText(personName, 12);

    return (
        <Group
            onMouseEnter={(e) => {
                setMouseOver(true);

                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
                setMouseOver(false);

                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'default';
            }}
        >
            <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={getLifespanFill}
                stroke={getLifespanStroke}
                strokeWidth={1}
            />

            <ReactText x={x + 4} y={y + (height - personNameTextSize.height) / 2} text={personName} />

            {person.deathDate?.year && (
                <ReactText
                    x={x + width - deathAgeTextSize.width}
                    y={y + (height - deathAgeTextSize.height) / 2}
                    text={deathAge}
                    fontSize={10}
                />
            )}
        </Group>
    );
}

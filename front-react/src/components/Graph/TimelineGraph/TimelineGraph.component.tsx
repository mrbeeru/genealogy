import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { useRef, useState } from 'react';
import { Group, Layer, Stage } from 'react-konva';
import { PersonDTO } from '../../../api/dto/PersonDTO';
import Lifespan from './Lifespan.component';
import Relation from './Relation.component';
import Timeaxis from './Timeaxis.component';

const resolution = 10;
const segmentLength = 100;
let yOffset: number = 10;

export default function TimelineGraph({ persons }: { persons: PersonDTO[] }) {
    const stageRef = useRef<any>(null);

    const [stagePos, setStagePos] = useState<Vector2d>({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState<Vector2d>({ x: 0, y: 0 });
    const [scale, setScale] = useState<Vector2d>({ x: 1, y: 1 });

    const startYear = getOldestMemberBirthYear(persons);
    const endYear = getEndYear(persons);
    const origin = getOrigins(persons).sort((x, y) => x.birthDate.year - y.birthDate.year);

    //const renders = useRef(0);
    // renders.current++;
    // if (renders.current % 1 === 0) {
    //     console.log(`${renders.current / 1000}k`);
    // }

    const elements = buildGraph(origin[0], persons, new Map<PersonDTO, Vector2d>(), startYear, scale.x);

    yOffset = 10;

    const width = 2560;
    const height = 1255;

    const onDragMove = (e: KonvaEventObject<DragEvent>) => {
        e.evt.preventDefault();
        const x = stageRef.current.x();
        const y = stageRef.current.y();
        const pointer = stageRef.current?.getPointerPosition();
        setStagePos({ x, y });
        setMousePos(pointer);
    };

    const onMouseMoved = (e: KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();
        const pointer = stageRef.current.getPointerPosition();
        setMousePos(pointer);
    };

    const onWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = stageRef.current;

        var oldScale = scale.x;
        var pointer = stage.getPointerPosition();

        var mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY < 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
            direction = -direction;
        }

        var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        var newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setStagePos(newPos);
        setScale({ x: newScale, y: newScale });
    };

    return (
        <>
            <Timeaxis
                width={width}
                height={height}
                mouseX={mousePos.x}
                offsetX={stagePos.x}
                scaleX={scale.x}
                startYear={startYear}
                endYear={endYear}
            ></Timeaxis>
            <Stage
                style={{ position: 'absolute', top: 34, overflow: 'hidden' }}
                ref={stageRef}
                width={width}
                height={height}
                draggable
                onDragMove={onDragMove}
                onWheel={onWheel}
                onMouseMove={onMouseMoved}
                x={stagePos.x}
                y={stagePos.y}
            >
                <Layer>
                    <Group y={20} x={0}>
                        <Group scale={scale}>{elements.relations.map((r) => r)}</Group>
                        <Group scale={scale}>{elements.lifespans.map((l) => l)}</Group>
                        <Group></Group>
                    </Group>
                </Layer>
            </Stage>
        </>
    );
}

function buildGraph(
    person: PersonDTO,
    persons: PersonDTO[],
    alreadyBuilt: Map<PersonDTO, Vector2d>,
    // yOffset: number,
    startYear: number,
    zoom: number
): { lifespans: React.ReactNode[]; relations: React.ReactNode[] } {
    const lifespans: React.ReactNode[] = [];
    const relations: React.ReactNode[] = [];

    if (person == null || alreadyBuilt.has(person)) {
        return { lifespans: [], relations: [] };
    }

    // build for current person
    const personLifespan = (
        <Lifespan
            x={getLifespanOffset(person.birthDate.year, startYear)}
            y={yOffset}
            width={getLifespanLengthInPixels(person)}
            height={20}
            person={person}
        ></Lifespan>
    );
    lifespans.push(personLifespan);
    alreadyBuilt.set(person, { x: getLifespanOffset(person.birthDate.year, startYear), y: yOffset });

    // build for spouse
    const spousesLifespan = getSpouses(person, persons).map((spouse) => {
        yOffset += 21;
        alreadyBuilt.set(spouse, { x: getLifespanOffset(spouse.birthDate.year, startYear), y: yOffset });

        return (
            <Lifespan
                x={getLifespanOffset(spouse.birthDate.year, startYear)}
                y={yOffset}
                width={getLifespanLengthInPixels(spouse)}
                height={20}
                person={spouse}
            ></Lifespan>
        );
    });

    lifespans.push(spousesLifespan);

    yOffset += 50;

    // build relations
    const parents = getParents(person, persons);
    if (parents.length) {
        const personPos = alreadyBuilt.get(person);
        const parentsPos = parents.map((x) => alreadyBuilt.get(x) as Vector2d).filter((x) => x);

        if (personPos && parentsPos && parentsPos.length) {
            const relation = <Relation personPos={personPos} parentsPos={parentsPos} zoom={zoom}></Relation>;
            relations.push(relation);
        }
    }

    // build for children
    const childrenLifespans = getChildren(person, persons)
        .sort((a, b) => (a.birthDate.year < b.birthDate.year ? 1 : -1))
        .map((p) => buildGraph(p, persons, alreadyBuilt, startYear, zoom));

    lifespans.push(childrenLifespans.map((x) => x.lifespans));
    relations.push(childrenLifespans.map((x) => x.relations));

    return { lifespans: lifespans, relations: relations };
}

function getOldestMemberBirthYear(persons: PersonDTO[]): number {
    let origins = getOrigins(persons);
    let year = Math.min.apply(
        null,
        origins.map((x) => x.birthDate.year)
    );

    return year;
}

function getEndYear(persons: PersonDTO[]): number {
    if (persons.find((x) => !x.deathDate)) {
        return new Date().getUTCFullYear();
    }

    return 2040;
}

function getOrigins(persons: PersonDTO[]): PersonDTO[] {
    let origins = persons
        .filter((x) => x.fatherId == null && x.motherId == null)
        .filter((z) =>
            persons.filter((qq) => qq.spouseIds?.includes(z.id)).every((s) => s.fatherId == null && s.motherId == null)
        );

    return origins;
}

function getSpouses(person: PersonDTO, persons: PersonDTO[]): PersonDTO[] {
    return persons.filter((x) => person.spouseIds?.includes(x.id));
}

function getChildren(person: PersonDTO, persons: PersonDTO[]): PersonDTO[] {
    return persons.filter((x) => x.fatherId === person.id || x.motherId === person.id);
}

function getParents(person: PersonDTO, persons: PersonDTO[]): PersonDTO[] {
    return persons.filter((x) => x.id === person.motherId || x.id === person.fatherId);
}

function getLifespanLengthInPixels(person: PersonDTO): number {
    const presentYear: number = getDecimalYear(new Date());
    const birthYear = person.birthDate.year;
    let endYear = presentYear;

    if (person.deathDate) {
        endYear = getDecimalYear(
            new Date(person.deathDate.year ?? presentYear, person.deathDate.month ?? 0, person.deathDate.day ?? 0)
        );
    }

    const age = endYear - birthYear;
    let length = (age / resolution) * segmentLength;
    return length;
}

function getLifespanOffset(birthYear: number, startYear: number): number {
    return ((birthYear - startYear) / resolution) * segmentLength;
}

function getDecimalYear(date: Date): number {
    return date.getUTCFullYear() + date.getUTCMonth() / 12 + date.getUTCDay() / 365;
}

function getYearFromMousePosition(startYear: number, x: number, scale: number) {
    const resolution = 10;
    return startYear + Math.floor(x / (resolution * scale));
}

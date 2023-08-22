import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { ReactNode, useRef, useState } from 'react';
import { Group, Layer, Stage } from 'react-konva';
import { PersonDTO } from '../../../api/dto/PersonDTO';
import Lifespan from './Lifespan.component';
import Relation from './Relation.component';
import Timeaxis from './Timeaxis.component';

const resolution = 10;
const segmentLength = 100;

function getOrigins(persons: PersonDTO[]): PersonDTO[] {
    const origins = persons
        .filter((x) => x.fatherId == null && x.motherId == null)
        .filter((z) =>
            persons.filter((qq) => qq.spouseIds?.includes(z.id)).every((s) => s.fatherId == null && s.motherId == null)
        );

    return origins;
}

function getOldestMemberBirthYear(persons: PersonDTO[]): number {
    const origins = getOrigins(persons);
    const year = Math.min.apply(
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

function getSpouses(person: PersonDTO, persons: PersonDTO[]): PersonDTO[] {
    return persons.filter((x) => person.spouseIds?.includes(x.id));
}

function getChildren(person: PersonDTO, persons: PersonDTO[]): PersonDTO[] {
    return persons.filter((x) => x.fatherId === person.id || x.motherId === person.id);
}

function getParents(person: PersonDTO, persons: PersonDTO[]): PersonDTO[] {
    return persons.filter((x) => x.id === person.motherId || x.id === person.fatherId);
}

function getDecimalYear(date: Date): number {
    return date.getUTCFullYear() + date.getUTCMonth() / 12 + date.getUTCDay() / 365.2425;
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
    const length = (age / resolution) * segmentLength;
    return length;
}

function getLifespanOffset(birthYear: number, startYear: number): number {
    return ((birthYear - startYear) / resolution) * segmentLength;
}

/* eslint-disable no-param-reassign */
function buildGraph(
    person: PersonDTO,
    persons: PersonDTO[],
    alreadyBuilt: Map<PersonDTO, Vector2d>,
    params: { yOffset: number; startYear: number; zoom: number }
): { lifespans: ReactNode[]; relations: ReactNode[] } {
    const lifespans: ReactNode[] = [];
    const relations: ReactNode[] = [];

    if (person == null || alreadyBuilt.has(person)) {
        return { lifespans: [], relations: [] };
    }

    // build for current person
    const personLifespan = (
        <Lifespan
            x={getLifespanOffset(person.birthDate.year, params.startYear)}
            y={params.yOffset}
            width={getLifespanLengthInPixels(person)}
            height={20}
            person={person}
            key={person.id}
        />
    );
    lifespans.push(personLifespan);
    alreadyBuilt.set(person, { x: getLifespanOffset(person.birthDate.year, params.startYear), y: params.yOffset });

    // build for spouse
    const spousesLifespan = getSpouses(person, persons).map((spouse) => {
        params.yOffset += 21;
        alreadyBuilt.set(spouse, { x: getLifespanOffset(spouse.birthDate.year, params.startYear), y: params.yOffset });

        return (
            <Lifespan
                x={getLifespanOffset(spouse.birthDate.year, params.startYear)}
                y={params.yOffset}
                width={getLifespanLengthInPixels(spouse)}
                height={20}
                person={spouse}
                key={spouse.id}
            />
        );
    });

    lifespans.push(spousesLifespan);

    params.yOffset += 50;

    // build relations
    const parents = getParents(person, persons);
    if (parents.length) {
        const personPos = alreadyBuilt.get(person);
        const parentsPos = parents.map((x) => alreadyBuilt.get(x) as Vector2d).filter((x) => x);

        if (personPos && parentsPos && parentsPos.length) {
            const relation = (
                <Relation key={person.id} personPos={personPos} parentsPos={parentsPos} zoom={params.zoom} />
            );
            relations.push(relation);
        }
    }

    // build for children
    const childrenLifespans = getChildren(person, persons)
        .sort((a, b) => (a.birthDate.year < b.birthDate.year ? 1 : -1))
        .map((p) => buildGraph(p, persons, alreadyBuilt, params));

    lifespans.push(childrenLifespans.map((x) => x.lifespans));
    relations.push(childrenLifespans.map((x) => x.relations));

    return { lifespans, relations };
}
/* eslint-enable no-param-reassign */

export default function TimelineGraph({ persons }: { persons: PersonDTO[] }) {
    const stageRef = useRef<any>(null);

    const [stagePos, setStagePos] = useState<Vector2d>({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState<Vector2d>({ x: 0, y: 0 });
    const [scale, setScale] = useState<Vector2d>({ x: 1, y: 1 });

    const startYear = getOldestMemberBirthYear(persons);
    const endYear = getEndYear(persons);
    const origin = getOrigins(persons).sort((x, y) => x.birthDate.year - y.birthDate.year);

    // const renders = useRef(0);
    // renders.current++;
    // if (renders.current % 1 === 0) {
    //     console.log(`${renders.current / 1000}k`);
    // }

    const elements = buildGraph(origin[0], persons, new Map<PersonDTO, Vector2d>(), {
        yOffset: 0,
        zoom: scale.x,
        startYear,
    });

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

        const oldScale = scale.x;
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
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

        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        const newPos = {
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
            />
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
                    </Group>
                </Layer>
            </Stage>
        </>
    );
}

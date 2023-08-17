import { Vector2d } from 'konva/lib/types';
import { useRef } from 'react';
import { Group, Layer, Stage } from 'react-konva';
import { PersonDTO } from '../../../api/dto/PersonDTO';
import Lifespan from './Lifespan.component';

const resolution = 10;
const segmentLength = 100;

export default function TimelineGraph({
    onOffsetChanged,
    onZoomChanged,
    onMouseMove,
    persons,
}: {
    onOffsetChanged?: (dir: Vector2d) => void;
    onZoomChanged?: (zoom: number) => void;
    onMouseMove?: (pos: Vector2d) => void;
    persons: PersonDTO[];
}) {
    const stageRef = useRef<any>(null);
    const groupRef = useRef<any>(null);
    const startYear = getOldestMemberYear(persons);
    const origin = getOrigins(persons).sort((x, y) => x.birthDate.year - y.birthDate.year);
    const lifespans = buildGraph(origin[0], persons, new Set<PersonDTO>(), startYear);
    yOffset = 10;

    return (
        <Stage
            style={{ position: 'absolute', top: 40, overflow: 'hidden' }}
            ref={stageRef}
            width={2560}
            height={1200}
            draggable
            onDragMove={(e) => {
                e.evt.preventDefault();
                const x = stageRef.current.x();
                const y = stageRef.current.y();
                const pointer = stageRef.current?.getPointerPosition();
                onOffsetChanged?.({ x: x, y: y });
                onMouseMove?.(pointer);
            }}
            onWheel={(e) => {
                e.evt.preventDefault();
                const scaleBy = 1.1;
                const stage = stageRef.current;
                const group = groupRef.current;

                var oldScale = group.scaleX();
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

                group.scale({ x: newScale, y: newScale });

                var newPos = {
                    x: pointer.x - mousePointTo.x * newScale,
                    y: pointer.y - mousePointTo.y * newScale,
                };
                stage.position(newPos);
                onOffsetChanged?.(newPos);
                onZoomChanged?.(newScale);
            }}
            onMouseMove={(e) => {
                const pointer = stageRef.current.getPointerPosition();
                onMouseMove?.(pointer);
            }}
        >
            <Layer>
                <Group ref={groupRef} y={40} x={0}>
                    {lifespans.map((l) => l)}
                </Group>
            </Layer>
        </Stage>
    );
}

let yOffset: number = 10;

function buildGraph(
    person: PersonDTO,
    persons: PersonDTO[],
    alreadyBuilt: Set<PersonDTO>,
    // yOffset: number,
    startYear: number
): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];

    if (person == null || alreadyBuilt.has(person)) {
        return [];
    }

    const lifespan = (
        <Lifespan
            x={getLifespanOffset(person.birthDate.year, startYear)}
            y={yOffset}
            width={getLifespanLengthInPixels(person)}
            height={20}
            person={person}
        ></Lifespan>
    );
    nodes.push(lifespan);

    getSpouses(person, persons).map((spouse) => {
        yOffset += 22;

        nodes.push(
            <Lifespan
                x={getLifespanOffset(spouse.birthDate.year, startYear)}
                y={yOffset}
                width={getLifespanLengthInPixels(spouse)}
                height={20}
                person={spouse}
            ></Lifespan>
        );
        alreadyBuilt.add(spouse);
    });

    alreadyBuilt.add(person);
    yOffset += 50;

    nodes.push(
        getChildren(person, persons)
            .sort((a, b) => (a.birthDate.year < b.birthDate.year ? 1 : -1))
            .map((p) => buildGraph(p, persons, alreadyBuilt, startYear))
    );

    return nodes;
}

function getOldestMemberYear(persons: PersonDTO[]): number {
    let origins = getOrigins(persons);
    let year = Math.min.apply(
        null,
        origins.map((x) => x.birthDate.year)
    );

    return year;
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
    return persons.filter((x) => x.fatherId == person.id || x.motherId == person.id);
}

function getLifespanLengthInPixels(person: PersonDTO): number {
    const presentYear: number = new Date().getUTCFullYear();
    const birthYear = person.birthDate.year;
    const endYear = person.deathDate?.year ?? presentYear;
    const age = endYear - birthYear;
    let length = (age / resolution) * segmentLength;
    return length;
}

function getLifespanOffset(birthYear: number, startYear: number): number {
    return ((birthYear - startYear) / resolution) * segmentLength;
}

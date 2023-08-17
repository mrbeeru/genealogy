import { Vector2d } from 'konva/lib/types';
import { useEffect, useRef, useState } from 'react';
import { PersonApi } from '../../api/controllers/PersonApi';
import { PersonDTO } from '../../api/dto/PersonDTO';
import TimelineGraph from './TimelineGraph/TimelineGraph.component';
import TimelineGrid from './TimelineGraph/TimelineGrid.component';

export default function GraphStage() {
    const [zoom, setZoom] = useState(1);
    const [mousePos, setMousePos] = useState<Vector2d>({ x: 0, y: 0 });
    const stageRef = useRef<any>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [persons, setPersons] = useState<PersonDTO[]>([]);

    const minYear = getOldestMemberYear(persons);

    useEffect(() => {
        var personApi = new PersonApi();
        const fn = async () => {
            //const persons = await personApi.getPersons('6345c0b151be4f7071618c88');
            const persons = await personApi.getPersons('6320bdfc86d047176e1da056');
            setPersons(persons);
        };

        fn();
    }, []);

    return (
        <>
            {persons.length && (
                <>
                    <TimelineGrid drag={offset} zoom={zoom} mousePos={mousePos} minYear={minYear}></TimelineGrid>
                    <TimelineGraph
                        onOffsetChanged={(mvt) => {
                            setOffset(mvt);
                        }}
                        onZoomChanged={(zoom) => {
                            setZoom(zoom);
                        }}
                        onMouseMove={(pos) => {
                            setMousePos(pos);
                        }}
                        persons={persons}
                    ></TimelineGraph>
                </>
            )}
        </>
    );
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

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PersonApiService, PersonV2 } from '../../../services/api/person.service';

@Component({
  selector: 'app-defaultview',
  templateUrl: './defaultview.component.html',
  styleUrls: ['./defaultview.component.scss']
})
export class DefaultviewComponent implements OnInit {

  @ViewChild('myCanvas') private myCanvas: ElementRef = {} as ElementRef;
  context!: CanvasRenderingContext2D;

  constructor(
    private personService: PersonApiService
  ) { }

  ngOnInit(): void {
    this.personService.getAllPersonsAsync().then(x => {
      this.plswork(x);
    });
  }

  plswork(x: PersonV2[]) {
    this.persons = x;
    this.startYear = Math.min(...this.persons.map(x => x.birthDate?.year))
    this.buildPersonsObject(this.persons);

    let origin = this.persons[0];
    this.buildGraph(origin);

    this.myCanvas.nativeElement.width = this.graph.width + 5 + 100;
    this.myCanvas.nativeElement.height = this.graph.height + 3;

    this.context = this.myCanvas.nativeElement.getContext('2d');
    this.drawGraph(this.graph);
  }


  buildPersonsObject(persons: PersonV2[]) {
    persons.forEach(p => {
      this.personMap[p.id] = p
    });
  }

  personMap: any = {};
  persons: PersonV2[] = [];

  personToShapeMap = new Map<PersonV2, Shape>();

  segmentLength = 100;
  segmentHeight = 16;
  segmentSpacing = 2;
  segmentTextSize = 11;
  descendantSpacing = 30;
  globalXOffset = 5;
  globalYOffset = 6;
  startYear = 0;
  granularity = 10;

  graph: Graph = { width: 0, height: 0, shapes: [] };



  buildGraph(person: PersonV2) {
    if (this.graph.shapes == null)
      this.graph.shapes = []

    let shape = this.buildShapes(person);
    this.graph.shapes.push(shape)
    this.personToShapeMap.set(person, shape);

    //build graph for spouse
    //filter for already build shapes (circular relation)
    person.spouseIds
      ?.map(x => this.personMap[x])
      .filter(x => this.personToShapeMap.get(x) == null)
      .forEach(spouse => this.buildGraph(spouse))

    //build graph for children
    //map children ids to real persons,
    //filter for already built shapes (circular relation)
    //then sort them ascending by age (graph relation lines not cutting lifespans)
    person.childrenIds
      ?.map(x => this.personMap[x])
      .filter(x => this.personToShapeMap.get(x) == null)
      .sort((a,b) => a.birthDate.year < b.birthDate.year ? 1 : -1)
      .forEach(child => {
          this.globalYOffset += this.descendantSpacing;
          this.buildGraph(child);
      });
  }

  buildShapes(person: PersonV2): Shape {
    let born = person.birthDate.year;
    let died = person.deathDate?.year ?? new Date().getUTCFullYear();

    let xOffset = (born - this.startYear) / this.granularity * this.segmentLength + this.segmentSpacing * (Math.floor((born - (Math.floor(this.startYear / this.granularity) * this.granularity)) / this.granularity)) + 5;
    let textOffset = xOffset + 5;

    let segments: LifeSegment[] = [];
    let text = {
      text: "",
      color: "black",
      size: this.segmentTextSize,
      x: textOffset,
      y: this.globalYOffset + (this.segmentHeight + this.segmentTextSize / 2) / 2 + 1
    }

    //draw initial shorter segment
    if (born % this.granularity != 0 || died - born < this.granularity) {
      let firstSegment = Math.min((this.granularity - born % this.granularity), died - born) / this.granularity * this.segmentLength;
      segments.push({ x: xOffset, y: this.globalYOffset, width: firstSegment, height: this.segmentHeight })
      xOffset += this.segmentSpacing + firstSegment;
    }

    //draw full segments
    for (let year = born + (this.granularity - born % this.granularity) + this.granularity; year <= died; year += this.granularity) {
      segments.push({ x: xOffset, y: this.globalYOffset, width: this.segmentLength, height: this.segmentHeight })
      xOffset += this.segmentSpacing + this.segmentLength;
    }

    //an extra wtf??
    if (born % 10 == 0) {
      segments.push({ x: xOffset, y: this.globalYOffset, width: this.segmentLength, height: this.segmentHeight })
      xOffset += this.segmentSpacing + this.segmentLength;
    }

    //draw last
    if (died - born + born % this.granularity > this.granularity) {
      segments.push({ x: xOffset, y: this.globalYOffset, width: (died % this.granularity) / this.granularity * this.segmentLength, height: this.segmentHeight })
      xOffset += (died % this.granularity) / this.granularity * this.segmentLength
    }

    this.globalYOffset += this.segmentHeight + 2;
    this.globalXOffset = this.globalXOffset < xOffset ? xOffset : this.globalXOffset;

    //update canvas size
    if (this.graph.height < this.globalYOffset)
      this.graph.height = this.globalYOffset

    if (this.graph.width < this.globalXOffset)
      this.graph.width = this.globalXOffset;

    let output: Shape = {
      textObject: text,
      lifeSegments: segments,
      person: person,
    }

    return output;
  }

  drawGraph(graph: any) {
    graph.shapes.forEach((shape: Shape) => {
      shape.lifeSegments.forEach((segment: LifeSegment) => {
        this.context.fillStyle = shape.person.gender == "f" ? "#ffd0e6" : "#aedae7";
        this.context.fillRect(segment.x, segment.y, segment.width, segment.height);
      });

      this.drawRelations(shape, "gray")
      this.drawNameText(shape.person.firstName + " " + shape.person.lastName, "black", shape.textObject.size, shape.textObject.x, shape.textObject.y)
    });
  }

  drawRelations(shape: Shape, color: string) {
    if (shape.person == null || shape.person.fatherId == null || shape.person.motherId == null)
      return;

    let prevcolor = this.context.fillStyle;
    this.context.fillStyle = color;

    let fatherShape = this.personToShapeMap.get(this.personMap[shape.person.fatherId]);
    let motherShape = this.personToShapeMap.get(this.personMap[shape.person.motherId]);

    let x = shape.lifeSegments[0].x;
    let y = shape.lifeSegments[0].y;
    let heightMother = y - (motherShape?.lifeSegments[0].y ?? 0)
    let heightFather = y - (fatherShape?.lifeSegments[0].y ?? 0)
    let yMother = y - heightMother + this.segmentHeight / 2
    let yFather = y - heightFather + this.segmentHeight / 2
    let width = 2

    this.context.fillRect(x, y, width, -Math.max(heightMother, heightFather) + this.segmentHeight / 2)

    //draw bumps
    this.context.beginPath();
    this.context.arc(x + 1, yMother, 3, 0, 2 * Math.PI);
    this.context.fill();
    this.context.closePath();

    this.context.beginPath();
    this.context.arc(x + 1, yFather, 3, 0, 2 * Math.PI);
    this.context.fill();
    this.context.closePath();

    this.context.fillStyle = prevcolor;
  }

  drawNameText(text: string, color: string, size: number, x: number, y: number) {
    let previousColor = this.context.fillStyle;

    this.context.font = "bold " + size + "px Arial";
    this.context.fillStyle = color;
    this.context.fillText(text, x, y);
    this.context.fillStyle = previousColor;
  }
}

interface LifeSegment {
  x: number,
  y: number,
  width: number,
  height: number
}

interface TextObject {
  text: string,
  color: string,
  size: number,
  x: number,
  y: number
}

interface Shape {
  lifeSegments: LifeSegment[],
  person: PersonV2,
  textObject: TextObject,
}

interface Graph {
  width: number,
  height: number,
  shapes: Shape[]
}


import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PersonApiService, PersonV2 } from '../../../services/api/person.service';

import { Svg, SVG as svgjs} from '@svgdotjs/svg.js';

@Component({
  selector: 'app-defaultview',
  templateUrl: './defaultview.component.html',
  styleUrls: ['./defaultview.component.scss']
})
export class DefaultviewComponent implements OnInit {

  //@ViewChild('myCanvas') private myCanvas: ElementRef = {} as ElementRef;
  //context!: CanvasRenderingContext2D;

  constructor(
    private personService: PersonApiService
  ) { }

  ngOnInit(): void {
    this.personService.getAllPersonsAsync().then(x => {

      this.persons = x;
      this.persons.sort((a,b) => a.birthDate.year < b.birthDate.year ? -1 : 1)
      this.startYear = this.persons[0].birthDate.year;
      this.origin = this.persons[0];

      this.draw(x);
    });
  }

  draw(x: PersonV2[]) {
    if (this.origin == null)
      throw new Error("Origin is null");

    this.buildPersonsObject(this.persons);
    this.buildGraph(this.origin);

    const width = this.graph.width + 5 + 100;
    const height = this.graph.height + 3;
    this.context = svgjs().addTo("#test").size(width, height);

    //this.context = this.myCanvas.nativeElement.getContext('2d');
    this.drawGraph(this.context, this.graph);
  }


  buildPersonsObject(persons: PersonV2[]) {
    persons.forEach(p => {
      this.personMap[p.id] = p
    });
  }


  initializeGlobals(){
    this.personToShapeMap = new Map<PersonV2, Shape>();
    this.personMap = {};
    this.graph = { width: 0, height: 0, shapes: [] };
    this.globalXOffset = 5;
    this.globalYOffset = 5;

    this.buildPersonsObject(this.persons);
  }

  context? : Svg = undefined;

  personMap: any = {};
  persons: PersonV2[] = [];
  personToShapeMap = new Map<PersonV2, Shape>();
  origin?: PersonV2;

  segmentLength = 100;
  segmentHeight = 16;
  segmentSpacing = 2;
  segmentTextSize : number = 11;
  descendantSpacing = 30;
  globalXOffset = 5;
  globalYOffset = 5;
  startYear = 0;
  granularity = 10;

  graph: Graph = { width: 0, height: 0, shapes: [] };



  buildGraph(person: PersonV2) {
    if (this.graph.shapes == null)
      this.graph.shapes = []

    if (person == null)
      return;

    console.log(person)

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
      y: this.globalYOffset - 1
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

  drawGraph(context: Svg, graph: any) {
    graph.shapes.forEach((shape: Shape) => {
      shape.lifeSegments.forEach((segment: LifeSegment) => {
        const fillColor = shape.person.gender == "f" ? "#ffd0e6" : "#aedae7";
        context.rect(segment.width, segment.height).move(segment.x, segment.y).fill(fillColor);
      });

      this.drawRelations(context, shape, "gray")
      this.drawNameText(context, `${shape.person.firstName} ${shape.person.lastName}`, "black", shape.textObject.size, shape.textObject.x, shape.textObject.y)
    });
  }

  drawRelations(context: Svg, shape: Shape, color: string) {
    if (shape.person == null || shape.person.fatherId == null || shape.person.motherId == null)
     return;

    let fatherShape = this.personToShapeMap.get(this.personMap[shape.person.fatherId]);
    let motherShape = this.personToShapeMap.get(this.personMap[shape.person.motherId]);

    let x = shape.lifeSegments[0].x;
    let y = shape.lifeSegments[0].y;
    let heightMother = y - (motherShape?.lifeSegments[0].y ?? 0)
    let heightFather = y - (fatherShape?.lifeSegments[0].y ?? 0)
    let yMother = y - heightMother + this.segmentHeight / 2
    let yFather = y - heightFather + this.segmentHeight / 2

    //draw relation line
    context.line(x,y - Math.max(heightMother, heightFather) + this.segmentHeight / 2, x, y).stroke({ color: color, width: 2, linecap: 'round' })
    
    //draw bumps
    context.circle(6).move(x - 3, yMother - 3).fill(color)
    context.circle(6).move(x - 3, yFather - 3).fill(color)
  }

  drawNameText(context: Svg, text: string, color: string, size: number, x: number, y: number) {
    context.text(text).move(x,y).font({ fill: color, size: size, weight: '500'});
  }

  redraw(){
    this.context?.clear();

    this.initializeGlobals();
    this.buildGraph(this.origin!);

    const width = this.graph.width + 5 + 100;
    const height = this.graph.height + 3;

    this.context?.size(width, height);
    this.drawGraph(this.context!, this.graph);
  }


  //#endregion
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


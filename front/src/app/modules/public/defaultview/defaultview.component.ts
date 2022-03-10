import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Rect, Svg, SVG as svgjs } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs/internal/Observable';
import { PersonV2 } from '../../core/models/person.model';
import { PersonService } from '../../core/services/person.service';
import '@svgdotjs/svg.panzoom.js'
import { Point } from '@svgdotjs/svg.js';


@Component({
  selector: 'app-defaultview',
  templateUrl: './defaultview.component.html',
  styleUrls: ['./defaultview.component.scss']
})
export class DefaultviewComponent implements AfterViewInit {

  // colorset = {

  //   timeAxisBackground: "#131722",
  //   timeAxisForeground: "white",

  //   graphBackground: "#171b26",
  //   graphNames: "#FFFD",
  //   graphRelations: "#777",

  //   segmentColorMale: "#07698a88",
  //   segmentColorFemale: "#ff666e88",
  //   //segmentColorFemale: "#ff3ba777",
  //   //segmentColorFemale: "#ff4fb077",

  //   gridLines: "#FFFFFF06",
  // }

  colorset = {

    timeAxisBackground: "#f9f9f9",
    timeAxisForeground: "black",

    graphBackground: "white",
    graphNames: "#000D",
    graphRelations: "#777",

    segmentColorMale: "#07698a88",
    segmentColorFemale: "#ff666e88",

    gridLines: "#00000088",
  }

  context!: Svg;
  timeAxisContext!: Svg;
  gridContext!: Svg;

  personMap: any = {};
  personToShapeMap = new Map<PersonV2, Shape>();
  origin?: PersonV2;
  selectedPerson!: PersonV2 | null

  gridLineWidth = 2;
  timeAxisHeight = 30;
  segmentLength = 100;
  segmentHeight = 16;
  segmentSpacing = 2;
  segmentTextSize: number = 11;
  descendantSpacing = 30;
  globalXOffset = 5;
  globalYOffset = this.timeAxisHeight + 5;
  startYear = 0;
  resolution: number = 10;
  presentYear: number = new Date().getUTCFullYear();

  graph: Graph = {
    width: 0,
    height: 0,
    shapes: [],
    xOffset: 102,
    yOffset: 0,
    scale: 1
  };


  
  @ViewChild('test') grapElement!: ElementRef<HTMLElement>;
  @ViewChild('timeaxis') timeAxisElement!: ElementRef<HTMLElement>;
  @ViewChild('grid') gridElement!: ElementRef<HTMLElement>;
  
  //consumer can specify what width is already occupied
  //so this component can try to center the graph
  @Input() spaceOxTaken: number = 0;
  @Input() persons: PersonV2[] = [];
  //leave this here for now
  @Input() events!: Observable<PersonV2 | undefined>;
  @Output() selectedPersonChanged: EventEmitter<PersonV2> = new EventEmitter<PersonV2>();

  constructor() { }

  box = 1;

  ngAfterViewInit(): void {
    this.persons.sort((a, b) => a.birthDate.year < b.birthDate.year ? -1 : 1)
    this.startYear = this.persons[0].birthDate.year;
    this.origin = this.persons[0];


    // if spaceOxTaken is set, try to center

    this.build(this.persons);


    const width = Math.max(this.graph.width + 5 + 100, window.innerWidth);
    const height = Math.max(this.graph.height + 3, window.innerHeight);
    //const width = this.graph.width + 5 + 100
    //const height = this.graph.height + 3

    this.timeAxisContext = svgjs().addTo(this.timeAxisElement.nativeElement).size(width, this.timeAxisHeight)
    this.drawTimeAxis(1,0)

    this.context = svgjs().addTo(this.grapElement.nativeElement).size(width, height).panZoom({zoomMin: 0.25, zoomMax: 4, zoomFactor: 0.2});

    this.context.on('panning', (x: any) => {

      let currentBox = x.detail.box;
      this.timeAxisContext.transform({translateX: -currentBox.x *  (this.graph.scale)})
    })

    this.context.on('zoom', (x: any) => {
      const level = x.detail.level;
      const focus = x.detail.focus;

      this.graph.scale = level;
      //console.log(this.context.viewbox());
      console.log(focus.x)
      
      console.log(level)

      
      this.drawTimeAxis(level, focus.x);
    })

    this.drawGraph(this.context, this.graph);


    //'center' the graph
    //this.context.translate(this.graph.xOffset, 0)

    //this.gridContext = svgjs().addTo(this.gridElement.nativeElement).size(width, height).panZoom({zoomMin: 0.5, zoomMax: 2 })
    this.drawGrid(this.context, height)

    this.events.subscribe(x => this.memberAdded())

    this.context.viewbox(0,0,width,height)
    //this.gridContext.viewbox(0,0,width, height)
  }


  build(x: PersonV2[]) {
    if (this.origin == null)
      throw new Error("Origin is null");

    this.buildPersonsObject(this.persons);
    this.buildGraph(this.origin);
  }

  initializeGlobals() {
    this.personToShapeMap = new Map<PersonV2, Shape>();
    this.personMap = {};
    this.graph = { width: 0, height: 0, shapes: [], xOffset: this.graph.xOffset, yOffset: this.graph.yOffset, scale: this.graph.scale };

    this.globalXOffset = 5;
    this.globalYOffset = this.timeAxisHeight + 5;

    this.buildPersonsObject(this.persons);
  }

  buildPersonsObject(persons: PersonV2[]) {
    persons.forEach(p => {
      this.personMap[p.id] = p
    });
  }

  buildGraph(person: PersonV2) {
    if (this.graph.shapes == null)
      this.graph.shapes = []

    if (person == null)
      return;

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
      .sort((a, b) => a.birthDate.year < b.birthDate.year ? 1 : -1)
      .forEach(child => {
        this.globalYOffset += this.descendantSpacing;
        this.buildGraph(child);
      });
  }

  buildShapes(person: PersonV2): Shape {
    let born = person.birthDate.year;
    let died = person.deathDate?.year ?? this.presentYear;

    let xOffset = (born - this.startYear) / this.resolution * this.segmentLength + this.segmentSpacing * (Math.floor((born - (Math.floor(this.startYear / this.resolution) * this.resolution)) / this.resolution)) + 5;
    let textOffset = xOffset + 5;

    //let segments: LifeSegment[] = [];
    let text = {
      text: "",
      color: this.colorset.graphNames,
      size: this.segmentTextSize,
      x: textOffset,
      y: this.globalYOffset - 1
    }

    let output: Shape = {
      textObject: text,
      lifeSegments: [],
      person: person,
    }

    //draw first segment
    let firstSegment = Math.min((this.resolution - born % this.resolution), died - born) / this.resolution * this.segmentLength;
    output.lifeSegments.push({ 
      x: xOffset, 
      y: this.globalYOffset, 
      width: firstSegment, 
      height: this.segmentHeight, 
      parentShape: output 
    })
    xOffset += this.segmentSpacing + firstSegment;

    //draw full segments
    for (let year = born + this.resolution - (born % this.resolution); year < died - this.resolution; year += this.resolution) {
      output.lifeSegments.push({ x: xOffset, y: this.globalYOffset, width: this.segmentLength, height: this.segmentHeight, parentShape: output })
      xOffset += this.segmentSpacing + this.segmentLength;
    }

    //draw last segment
    if (died - born + born % this.resolution > this.resolution) {
      output.lifeSegments.push({
        x: xOffset, 
        y: this.globalYOffset, 
        width: (died % this.resolution) / this.resolution * this.segmentLength, 
        height: this.segmentHeight,
        parentShape: output 
      })
      xOffset += (died % this.resolution) / this.resolution * this.segmentLength
    }

    this.globalYOffset += this.segmentHeight + 2;
    this.globalXOffset = this.globalXOffset < xOffset ? xOffset : this.globalXOffset;

    //update canvas size
    if (this.graph.height < this.globalYOffset)
      this.graph.height = this.globalYOffset

    if (this.graph.width < this.globalXOffset)
      this.graph.width = this.globalXOffset;

    return output;
  }

  drawTimeAxis(scale: number, focusX: number) {
    this.timeAxisContext.clear();
    let segmentFullLength = (this.segmentLength + this.segmentSpacing) * scale;
    let year = this.startYear - this.startYear % this.resolution;
    let endYear = this.presentYear;
    let numIterations = (endYear - this.startYear) / this.resolution
    let accountForPartialFirstSegment = ((this.startYear - year) / this.resolution * this.segmentLength) * scale;
    

    //start 3 segments before and end 3 after
    //year -= 2 * this.resolution;

    for (let i = 0 ; i < numIterations + 1; i++) {
        this.timeAxisContext.text(`${year}`).move(segmentFullLength * (i+1) - 10 - accountForPartialFirstSegment, 10).font({ fill: this.colorset.timeAxisForeground, size: 12, weight: '500' });

      year += this.resolution;
    }

    console.log(focusX)
    //this.timeAxisContext.translate(-focusX / scale, 0)
  }

  drawGraph(context: Svg, graph: any) {
    graph.shapes.forEach((shape: Shape) => {
      shape.lifeSegments.forEach((segment: LifeSegment) => {
        const fillColor = shape.person.gender == "f" ? this.colorset.segmentColorFemale : this.colorset.segmentColorMale;
        let rect = context.rect(segment.width, segment.height).move(segment.x + this.graph.xOffset, segment.y).fill(fillColor);

        //select the clicked person
        rect.on('click', () => {this.selectedPerson = shape.person, this.selectedPersonChanged.emit(this.selectedPerson)})
      });

      this.drawRelations(context, shape, this.colorset.graphRelations)
      this.drawNameText(context, `${shape.person.firstName} ${shape.person.lastName}`, this.colorset.graphNames, shape.textObject.size, shape.textObject.x, shape.textObject.y)
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
    context.line(x + this.graph.xOffset, y - Math.max(heightMother, heightFather) + this.segmentHeight / 2, x + this.graph.xOffset, y).stroke({ color: color, width: 1, linecap: 'round' })

    //draw bumps
    context.circle(6).move(x - 3 + this.graph.xOffset, yMother - 3).fill(color)
    context.circle(6).move(x - 3 + this.graph.xOffset, yFather - 3).fill(color)
  }

  drawNameText(context: Svg, text: string, color: string, size: number, x: number, y: number) {
    context.text(text).move(x + this.graph.xOffset, y).font({ fill: color, size: size, weight: '500' });
  }

  drawGrid(context: Svg, height: number) {
    let endYear = this.presentYear;
    let numIterations = (endYear - this.startYear) / this.resolution

    let segmentFullLength = (this.segmentLength + this.segmentSpacing)
    let accountForPartialFirstSegment = ((this.startYear % this.resolution) / this.resolution) * (this.segmentLength + this.segmentSpacing);

    for (let i = 1; i < numIterations + 2; i++) {
      const xPos = i * segmentFullLength + 5 - accountForPartialFirstSegment - 1;
      context.line(xPos , 0, xPos, height).stroke({ color: this.colorset.gridLines, width: this.gridLineWidth })
    }
  }

  redraw() {
    this.context.clear();
    this.timeAxisContext.clear();
    this.gridContext.clear();

    this.initializeGlobals();
    this.buildGraph(this.origin!);

    const width = Math.max(this.graph.width + 5 + 100, window.innerWidth);
    const height = Math.max(this.graph.height + 3, window.innerHeight);

    this.context?.size(width, height);
    this.timeAxisContext.size(width, this.timeAxisHeight);
    this.gridContext.size(10000, 10000)

    this.drawGraph(this.context!, this.graph);
    this.drawTimeAxis(1,5);
    this.drawGrid(this.gridContext, height)
  }

  resolutionCmpWith(x: any, y: any) {
    return x == y;
  }

  zoom(event: any) {
    //console.log(event)
    //this.view.scale += this.view.scale * 0.01 * (event.deltaY < 0 ? 1 : -1);

  }


  //#endregion

  //#region events
  memberAdded(){
    this.redraw();
  }
  //#endregion
}

interface LifeSegment {
  x: number,
  y: number,
  width: number,
  height: number,
  parentShape: Shape,
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
  xOffset: number,
  yOffset: number,
  scale: number,
  shapes: Shape[]
}


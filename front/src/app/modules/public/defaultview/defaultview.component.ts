import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Rect, Svg, SVG as svgjs } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs/internal/Observable';
import { PersonV2 } from '../../core/models/person.model';
import { PersonService } from '../../core/services/person.service';
import '@svgdotjs/svg.panzoom.js'
import { Point } from '@svgdotjs/svg.js';
import { PersonGlyph } from '../../graphs/elements/glyphs/PersonGlyph';
import { DefaultGraph } from '../../graphs/DefaultGraph';


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

    gridLines: "#00000008",
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
  segmentHeight = 14;
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
  @Input() memberAdded!: Observable<PersonV2 | undefined>;
  @Input() membersChanged!: Observable<PersonV2[]>;
  @Output() selectedPersonChanged: EventEmitter<PersonV2> = new EventEmitter<PersonV2>();

  constructor() 
  {

  }

  ngAfterViewInit(): void {
    this.membersChanged.subscribe(x => {
        this.persons = x; 
        this.context = svgjs().addTo(this.grapElement.nativeElement).size(2000, 3000).panZoom({zoomMin: 0.25, zoomMax: 4, zoomFactor: 0.2})
        this.context.viewbox(0,0,2000,3000)
        var graph = new DefaultGraph(this.persons)
        graph.draw(this.context)  
      });

    //this.membersChanged.subscribe(x => {this.persons = x; this.redraw()})
    //this.memberAdded.subscribe(x => this.redraw())
  }

  initializeSvgContexts(){

    if (this.timeAxisContext == null)
      this.timeAxisContext = svgjs().addTo(this.timeAxisElement.nativeElement).size(0, 0)

    if (this.context == null)
    {
      this.context = svgjs().addTo(this.grapElement.nativeElement).size(0, 0).panZoom({zoomMin: 0.25, zoomMax: 4, zoomFactor: 0.2});
      this.context.on('panning', (event: any) => this.doPanning(this.timeAxisContext, event))
      this.context.on('zoom', (x: any) => {
        const level = x.detail.level;
        const focus = x.detail.focus;
  
        this.drawTimeAxis(this.timeAxisContext, level, focus.x);
  
        let wp = this.context?.viewbox()
        let newWidth = (wp.w / level)
        let widthDiff = wp.w - newWidth;
        let percent = (focus.x) / newWidth
        let q1 = widthDiff * percent
        this.graph.scale = level;
      })
    }
  }

  initialize() {
    this.initializeSvgContexts();

    this.persons.sort((a, b) => a.birthDate.year < b.birthDate.year ? -1 : 1)
    this.startYear = this.persons[0].birthDate.year;
    this.origin = this.persons[0];

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
      .sort((a, b) => a.birthDate.year < b.birthDate.year ? 1 : -1)
      .filter(x => this.personToShapeMap.get(x) == null)
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

  drawTimeAxis(context: Svg, scale: number, focusX: number) {
    context.clear();
    let segmentFullLength = (this.segmentLength + this.segmentSpacing) * scale;
    let year = this.startYear - this.startYear % this.resolution;
    let endYear = this.presentYear;
    let numIterations = (endYear - this.startYear) / this.resolution
    let accountForPartialFirstSegment = ((this.startYear - year) / this.resolution * this.segmentLength) * scale;

    for (let i = 0 ; i < numIterations + 1; i++) {
      context.text(`${year}`).move(segmentFullLength * (i+1) - 10 - accountForPartialFirstSegment, 10).font({ fill: this.colorset.timeAxisForeground, size: 12, weight: '500' });
      year += this.resolution;
    }
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
      let txt = this.drawNameText(context, `${shape.person.firstName} ${shape.person.lastName}`, this.colorset.graphNames, shape.textObject.size, shape.textObject.x, shape.textObject.y)
      txt.on('click', () => {this.selectedPerson = shape.person, this.selectedPersonChanged.emit(this.selectedPerson)})
    });
  }

  drawRelations(context: Svg, shape: Shape, color: string) {
    if (shape.person == null)
      return;

    let parents = [shape.person.fatherId, shape.person.motherId].filter(x => x != undefined) as string[];
    
    if (parents.length == 0)
      return;

    let shapes = parents.map(p => this.personToShapeMap.get(this.personMap[p]))
    let x = shape.lifeSegments[0].x;
    let y = shape.lifeSegments[0].y;

    let maxHeight = 0;
    for (let i = 0; i < shapes.length; i++)
    {
      let shape = shapes[i];
      let heightParent = y - (shape?.lifeSegments[0].y ?? 0)
      let yParent = y - heightParent + this.segmentHeight / 2

      //draw bumps
      context.circle(6).move(x - 3 + this.graph.xOffset, yParent - 3).fill(color)
      maxHeight = maxHeight < heightParent ? heightParent : maxHeight;
    }

    //draw relation line
    context.line(x + this.graph.xOffset, y - maxHeight + this.segmentHeight / 2, x + this.graph.xOffset, y).stroke({ color: color, width: 1, linecap: 'round' })
  }

  drawNameText(context: Svg, text: string, color: string, size: number, x: number, y: number) {
    return context.text(text).move(x + this.graph.xOffset, y-2).font({ fill: color, size: size, weight: '500' });
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
    this.initialize();

    this.buildGraph(this.origin!);

    const width = Math.max(this.graph.width + 5 + 100, window.innerWidth);
    const height = Math.max(this.graph.height + 3, window.innerHeight);

    this.context.clear();
    this.timeAxisContext.clear();
    this.context?.size(width, height);
    this.timeAxisContext.size(width, this.timeAxisHeight);

    if (this.context.viewbox().width == 0)
      this.context.viewbox(0,0,width,height)

    this.drawGraph(this.context, this.graph);
    this.drawTimeAxis(this.timeAxisContext, 1,5);
    this.drawGrid(this.context, height)
  }

  resolutionCmpWith(x: any, y: any) {
    return x == y;
  }

  doPanning(context: Svg, panEvent: any) {
    let currentBox = panEvent.detail.box;
    context.transform({translateX: -currentBox.x *  (this.graph.scale)})
  }


  //#endregion

  //#region events

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


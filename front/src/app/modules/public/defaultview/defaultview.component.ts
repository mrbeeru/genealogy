import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { PersonApiService, PersonV2 } from '../../core/services/person.service';

import { Svg, SVG as svgjs} from '@svgdotjs/svg.js';

@Component({
  selector: 'app-defaultview',
  templateUrl: './defaultview.component.html',
  styleUrls: ['./defaultview.component.scss']
})
export class DefaultviewComponent implements OnInit {

  context!: Svg;
  timeAxisContext!: Svg;
  gridContext!: Svg;

  personMap: any = {};
  persons: PersonV2[] = [];
  personToShapeMap = new Map<PersonV2, Shape>();
  origin?: PersonV2;

  gridLineWidth = 2;
  timeAxisHeight = 30;
  segmentLength = 100;
  segmentHeight = 16;
  segmentSpacing = 2;
  segmentTextSize : number = 11;
  descendantSpacing = 30;
  globalXOffset = 5;
  globalYOffset = this.timeAxisHeight + 5;
  startYear = 0;
  resolution : number = 10;
  presentYear: number = new Date().getUTCFullYear();


  graph: Graph = { 
    width: 0, 
    height: 0, 
    shapes: [],
    xOffset: 50,
    yOffset: 0 ,
  };

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


  constructor(
    private personService: PersonApiService
  ) { }

  ngOnInit(): void {
    this.personService.getAllPersonsAsync().then(x => {
      this.persons = x;
      this.persons.sort((a,b) => a.birthDate.year < b.birthDate.year ? -1 : 1)
      this.startYear = this.persons[0].birthDate.year;
      this.origin = this.persons[0];


      this.build(x);
      
      // try to calculate graph xOffset to center the graph its width < viewport width
      // 256 space taken by menu
      if (this.globalXOffset < window.innerWidth - 256 - this.graph.xOffset)
      {
        let val = window.innerWidth - 256 - this.globalXOffset - this.graph.xOffset
        this.graph.xOffset = val / 2
      }

      const width = Math.max(this.graph.width + 5 + 100, window.innerWidth);
      const height = Math.max(this.graph.height + 3, window.innerHeight);

      this.timeAxisContext = svgjs().addTo("#timeaxis").size(2*width, this.timeAxisHeight)
      this.drawTimeAxis()
      
      this.context = svgjs().addTo("#test").size(width, height);
      this.drawGraph(this.context, this.graph);

      //'center' the graph
      this.context.translate(this.graph.xOffset,0)

      this.gridContext = svgjs().addTo("#grid").size(10000, 10000)
      this.drawGrid(this.gridContext)
    });
  }


  build(x: PersonV2[]) {
    if (this.origin == null)
      throw new Error("Origin is null");

    this.buildPersonsObject(this.persons);
    this.buildGraph(this.origin);
  }

  initializeGlobals(){
    this.personToShapeMap = new Map<PersonV2, Shape>();
    this.personMap = {};
    this.graph = { width: 0, height: 0, shapes: [], xOffset: this.graph.xOffset, yOffset: this.graph.yOffset };

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
      .sort((a,b) => a.birthDate.year < b.birthDate.year ? 1 : -1)
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

    let segments: LifeSegment[] = [];
    let text = {
      text: "",
      color: this.colorset.graphNames,
      size: this.segmentTextSize,
      x: textOffset,
      y: this.globalYOffset - 1
    }

    //draw first segment
    let firstSegment = Math.min((this.resolution - born % this.resolution), died - born) / this.resolution * this.segmentLength;
    segments.push({ x: xOffset, y: this.globalYOffset, width: firstSegment, height: this.segmentHeight })
    xOffset += this.segmentSpacing + firstSegment;
 
    //draw full segments
    for (let year = born + this.resolution - (born%this.resolution); year < died - this.resolution; year += this.resolution ){
      segments.push({ x: xOffset, y: this.globalYOffset, width: this.segmentLength, height: this.segmentHeight })
      xOffset += this.segmentSpacing + this.segmentLength;
    }

    //draw last segment
    if (died - born + born % this.resolution > this.resolution) {
     segments.push({ x: xOffset, y: this.globalYOffset, width: (died % this.resolution) / this.resolution * this.segmentLength, height: this.segmentHeight })
     xOffset += (died % this.resolution) / this.resolution * this.segmentLength
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

  drawTimeAxis() {
    let segmentFullLength = this.segmentLength + this.segmentSpacing;
    let year = this.startYear - this.startYear % this.resolution;
    let endYear = this.presentYear;
    let numIterations = (endYear - this.startYear) / this.resolution
    let accountForPartialFirstSegment = (this.startYear - year) / this.resolution * this.segmentLength;

    //start 3 segments before and end 3 after
    year -= 2 * this.resolution;

    for (let i = 0; i < numIterations + 4; i++)
    {
      if (i > 0)
        this.timeAxisContext.text(`${year}`).move(segmentFullLength * i - 10 - accountForPartialFirstSegment , 10).font({ fill: this.colorset.timeAxisForeground, size: 12, weight: '500'});
      
        year += this.resolution;
    }

    this.timeAxisContext.transform({translateX: -2 * segmentFullLength + this.graph.xOffset})
  }

  drawGraph(context: Svg, graph: any) {
    graph.shapes.forEach((shape: Shape) => {
      shape.lifeSegments.forEach((segment: LifeSegment) => {
        const fillColor = shape.person.gender == "f" ? this.colorset.segmentColorFemale : this.colorset.segmentColorMale;
        context.rect(segment.width, segment.height).move(segment.x, segment.y).fill(fillColor);
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
    context.line(x,y - Math.max(heightMother, heightFather) + this.segmentHeight / 2, x, y).stroke({ color: color, width: 1, linecap: 'round' })
    
    //draw bumps
    context.circle(6).move(x - 3, yMother - 3).fill(color)
    context.circle(6).move(x - 3, yFather - 3).fill(color)
  }

  drawNameText(context: Svg, text: string, color: string, size: number, x: number, y: number) {
    context.text(text).move(x,y).font({ fill: color, size: size, weight: '500'});
  }

  drawGrid(context: Svg)
  {
    let endYear = this.presentYear;
    let numIterations = (endYear - this.startYear) / this.resolution

    let segmentFullLength = this.segmentLength + this.segmentSpacing
    let accountForPartialFirstSegment = ((this.startYear % this.resolution) / this.resolution) * (this.segmentLength + this.segmentSpacing);
    
    for (let i = 0; i < numIterations + 4; i++)
    {
      const xPos = i * segmentFullLength + 5 - accountForPartialFirstSegment - 1;
      context.line(xPos, 0, xPos, 10000).stroke({ color: this.colorset.gridLines, width: this.gridLineWidth })
    }

    context.transform({translateX: -2 * segmentFullLength + this.graph.xOffset})
  }

  redraw(){
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
    this.drawTimeAxis();
    this.drawGrid(this.gridContext)
  }

  resolutionCmpWith(x:any, y:any){
    return x == y;
  }

  zoom(event: any){
    //console.log(event)
    //this.view.scale += this.view.scale * 0.01 * (event.deltaY < 0 ? 1 : -1);
  
  }

  graphDragHelper = {
    //if user is currently dragging the graph
    isDraggin: false,

    //initial mouse position when dragging began
    startPosition: {x: 0, y:0 },

    //used to skip drawing if too often
    drawDelay: 4,

    //
    lastDraw: Date.now(),

    canDrag()
    {
      if (this.isDraggin == false)
        return false;

      if (Date.now() - this.lastDraw > this.drawDelay)
        return true;

      return false;
    },

    drag(context: Svg, translateX: number, translateY: number)
    {
      context?.transform({
        translateX: translateX,
        translateY: translateY,
      })

      this.lastDraw = Date.now();
    }
  }

  mouseMove(event:any)
  {
    if (this.graphDragHelper.canDrag())
    {
      let tx = this.graph.xOffset + event.clientX - this.graphDragHelper.startPosition.x;
      let ty = this.graph.yOffset + event.clientY - this.graphDragHelper.startPosition.y;

      this.graphDragHelper.drag(this.context!, tx, ty)

      // account for the 3 extra segments
      let translateX = 2 * (this.segmentLength + this.segmentSpacing)
      this.timeAxisContext.transform({translateX: -translateX  + tx })
      this.gridContext.transform({translateX: -translateX + tx})
    }
  }

  mouseDown(event:any)
  {
    this.graphDragHelper.isDraggin=true;

    this.graphDragHelper.startPosition.x = event.clientX
    this.graphDragHelper.startPosition.y = event.clientY 
  }
  
  mouseUp(event:any)
  {
    this.graphDragHelper.isDraggin=false;

    this.graph.xOffset = this.graph.xOffset -this.graphDragHelper.startPosition.x + event.clientX
    this.graph.yOffset = this.graph.yOffset -this.graphDragHelper.startPosition.y + event.clientY
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
  xOffset: number,
  yOffset: number,
  shapes: Shape[]
}


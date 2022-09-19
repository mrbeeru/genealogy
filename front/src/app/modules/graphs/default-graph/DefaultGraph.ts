
import { Svg } from '@svgdotjs/svg.js';
import { PersonV2 } from 'src/app/modules/core/models/person.model';
import { GridGlyph } from './glyphs/GridGlyph';
import { IGlyph } from './glyphs/IGlyph';
import { PersonGlyph } from './glyphs/PersonGlyph';
import { RelationGlyph } from './glyphs/RelationGlyph';
import { TimeAxis } from './TimeAxis';

export class DefaultGraph {

    config = {
        segmentLength: 100,
        segmentHeight: 14,
        segmentSpacing: 0,
        resolution: 10,


        colors:{
            gridIndicator: "#7777",
            gridLines: "#0000001F",

            timeAxisBackground: "#f9f9f9",
            timeAxisForeground: "#000",
    
            graphBackground: "white",
            graphNames: "#000D",
            graphRelations: "#777",
    
            segmentColorMale: "#07698a88",
            segmentColorFemale: "#ff666e88",
        }
    }

    private startYear = 0;
    private endYear = 2022;
    private members: PersonV2[];
    //private xOffset = 100 ;
    private yOffset = 10;
    private glyphs: IGlyph[] = [];

    private ctx: Svg;
    private timeAxisCtx: Svg;

    private timeAxis!: TimeAxis;
    private grid!: GridGlyph;

    private drag = {x: 100, y: 0, isDragging: false}


    constructor(members: PersonV2[], ctx: Svg, timeAxisCtx: Svg) {
        this.members = members;
        this.ctx = ctx;
        this.timeAxisCtx = timeAxisCtx;

        this.build();

        this.addDragMove();
        this.addMouseMove();
    }

    draw() {
        this.glyphs.forEach(x => x.draw(this.ctx));
        this.timeAxis.draw(this.timeAxisCtx);

        //move to the right a bit
        this.drag.x += - (this.startYear%this.config.resolution) / this.config.resolution * this.config.segmentLength
        console.log(this.drag.x)
        //console.log(this.drag.x)
        //this.move(this.config.segmentLength, 0)
        //this.timeAxis.move(this.config.segmentLength)
    }



//#region  build

    private build() {
        let origins = this.members
            .filter(x => x.fatherId == null && x.motherId == null)
            .filter(z => this.members.filter(qq => qq.spouseIds?.includes(z.id)).every(s => s.fatherId == null && s.motherId == null))

        this.startYear = origins[0].birthDate.year;
        this.buildPerson(origins[0]);
        this.buildGrid();
        this.buildTimeAxis();
        this.buildIndicator();
    }

    private buildPerson(person: PersonV2) {
        if (person == null)
            return;

        // build for current person
        let personGlyph = new PersonGlyph(this.drag.x + this.getLifespanOffset(person), this.yOffset, person, this.config)
        this.glyphs.push(personGlyph);

        // build for spouse
        this.members
            .filter(x => person.spouseIds?.includes(x.id))
            .map(spouse => {
                this.yOffset += this.config.segmentHeight + this.config.segmentSpacing;
                this.glyphs.push(new PersonGlyph(this.drag.x + this.getLifespanOffset(spouse), this.yOffset, spouse, this.config))
            })

        // build relations
        let parentsGlyph = (this.glyphs.filter(x => x instanceof PersonGlyph) as PersonGlyph[])
            .filter(x => x.person.id == person.motherId || x.person.id == person.fatherId);
        if (parentsGlyph?.length > 0)
            this.glyphs.push(new RelationGlyph(personGlyph, parentsGlyph,  this.config.colors.graphRelations))

        // build for children
        this.yOffset += 40;
        this.members
            .filter(x => x.fatherId == person.id || x.motherId == person.id)
            .sort((a, b) => a.birthDate.year < b.birthDate.year ? 1 : -1)
            .map(y => this.buildPerson(y))
    }

    private buildGrid()
    {
        let colors = {
            gridIndicator: this.config.colors.gridIndicator,
            gridLines: this.config.colors.gridLines,
        }

        this.grid = new GridGlyph(this.startYear, 2022, this.config.resolution, this.config.segmentLength, this.drag.x, colors)
        this.glyphs.push(this.grid);
    }

    private buildTimeAxis(){
        let colors = {
            timeAxisForeground: this.config.colors.timeAxisForeground,
            gridIndicator: this.config.colors.gridIndicator
        }

        let cfg = {
            segmentLength: this.config.segmentLength, 
            startYear: this.startYear, endYear: this.endYear, 
            resolution: this.config.resolution,
            xOffset: this.drag.x
        }

        this.timeAxis = new TimeAxis(cfg, colors)
    }

    private buildIndicator(){

    }

    private getLifespanOffset(person: PersonV2) {
        let resolution = this.config.resolution;
        let segmentLength = this.config.segmentLength;
        let segmentSpacing = this.config.segmentSpacing;

        return (person.birthDate.year - this.startYear) / resolution * segmentLength + segmentSpacing * (Math.floor((person.birthDate.year - (Math.floor(this.startYear / resolution) * resolution)) / resolution));
    }

//#endregion

    private addDragMove(){

        this.ctx.draggable().on('dragmove', (e:any) => {
          e.preventDefault()
    
            if (document.body.style.cursor !== "move")
                document.body.style.cursor = "move";

            console.log(e.detail.box.x)

            let dx= e.detail.box.x - this.drag.x;
            let dy= e.detail.box.y - this.drag.y;
            
            this.drag.x += dx;
            this.drag.y += dy;
            
            this.move(dx,dy)
            this.timeAxis.move(dx)
            console.log("dragmove")
        }) 
    
        this.ctx.on('dragstart', (e:any) => {
            e.preventDefault()

            this.ctx.off("mousemove")
            this.drag = {x: e.detail.box.x, y: e.detail.box.y, isDragging: true};
            console.log("dragstart", this.drag, e)
        })
    
        this.ctx.on('dragend', () => {
            document.body.style.cursor = "default";
            
            this.drag.isDragging = false;
            this.addMouseMove();
        })
    }

    private addMouseMove(){
        this.ctx.on("mousemove", (x : any) => {
            let calc = (x.offsetX + this.config.segmentLength/this.config.resolution/2) - (x.offsetX-this.config.segmentLength/this.config.resolution/2 - this.drag.x) % (this.config.segmentLength/this.config.resolution);
            this.timeAxis.moveIndicator(calc, this.drag.x);
            this.grid.moveIndicator(calc);
        })
    }

    private move(x: number, y:number)
    {
        for (let glyph of this.glyphs)
        {
            glyph.dragMove(x,y)
        }
    }
}
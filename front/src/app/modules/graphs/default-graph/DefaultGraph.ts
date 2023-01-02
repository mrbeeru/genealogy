
import { Svg } from '@svgdotjs/svg.js';
import { PersonV2 } from 'src/app/modules/core/models/person.model';
import { FamilyTree } from '../../core/FamilyTree';
import { GridGlyph } from './glyphs/GridGlyph';
import { IGlyph } from './glyphs/IGlyph';
import { PersonGlyph } from './glyphs/PersonGlyph';
import { RelationGlyph } from './glyphs/RelationGlyph';
import { TimeAxis } from './TimeAxis';

export class DefaultGraph {

    config = {
        segmentLength: 100,
        segmentHeight: 30,
        resolution: 10,
        descendatSpacing: 60,
        scaleX: 1,

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
    //private xOffset = 100 ;
    private yOffset = 10;
    private glyphs: IGlyph[] = [];

    private ctx: Svg;
    private timeAxisCtx: Svg;

    private timeAxis!: TimeAxis;
    private grid!: GridGlyph;
    private familyTree: FamilyTree;

    private drag = {x: 100, y: 0, isDragging: false}
    private dragTimeAxis = {x:77, y: 0, isDragging: false}
    private alreadyBuilt: Set<PersonV2> = new Set<PersonV2>();

    constructor(members: PersonV2[], ctx: Svg, timeAxisCtx: Svg) {
        this.familyTree = new FamilyTree(members);
        this.ctx = ctx;
        this.timeAxisCtx = timeAxisCtx;

        this.build();

        this.addDragMove();
        this.addMouseMove();
        this.addTimeAxisResize();
    }

    draw() {
        this.glyphs.forEach(x => x.draw(this.ctx));
        this.timeAxis.draw(this.timeAxisCtx);

        //move to the right a bit
        this.drag.x += - (this.startYear%this.config.resolution) / this.config.resolution * this.config.segmentLength
    }


    private build() {
        this.startYear = this.familyTree.getOldestMemberYear();

        //build grid first so it should be 'under' the lifespans
        this.buildGrid();
        this.buildTimeAxis();
        this.buildIndicator();

        let origins = this.familyTree.getOrigins();
        origins.sort((x,y) => x.birthDate.year - y.birthDate.year).forEach(origin => {
            // we use the alreadyBuilt set to not build same entities multiple times,
            // e.g. 2 parents usually have common children => don't build them twice for each parent
            // there is also the matter of mutiple origins, 2 spouses can be both origins if they don't have ancestors
            // => don't build graph twice
            this.buildPerson(origin);
        });

    }

    private buildPerson(person: PersonV2) {
        if (person == null || this.alreadyBuilt.has(person)){
            this.yOffset += this.config.descendatSpacing;
            return;
        }

        // build for current person
        let personGlyph = new PersonGlyph(this.drag.x + this.getLifespanOffset(person), this.yOffset, person, this.config)
        this.glyphs.push(personGlyph);
        this.alreadyBuilt.add(person);

        // build for spouse
        this.familyTree.getSpouses(person)
            .map(spouse => {
                this.yOffset += this.config.segmentHeight;
                this.glyphs.push(new PersonGlyph(this.drag.x + this.getLifespanOffset(spouse), this.yOffset, spouse, this.config))
                this.alreadyBuilt.add(spouse);
            })

        // build relations
        let parentsGlyph = (this.glyphs.filter(x => x instanceof PersonGlyph) as PersonGlyph[])
            .filter(x => x.person.id == person.motherId || x.person.id == person.fatherId);
        if (parentsGlyph?.length > 0)
            this.glyphs.push(new RelationGlyph(personGlyph, parentsGlyph,  this.config.colors.graphRelations))

        // build for children
        this.yOffset += this.config.descendatSpacing;
        this.familyTree.getChildren(person)
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

        return (person.birthDate.year - this.startYear) / resolution * segmentLength;
    }

    private addDragMove(){
        this.ctx.draggable(false);
        this.ctx.draggable(true).on('dragmove', (e:any) => {
          e.preventDefault()
    
            if (document.body.style.cursor !== "move")
                document.body.style.cursor = "move";

            let dx= e.detail.box.x - this.drag.x;
            let dy= e.detail.box.y - this.drag.y;
            
            this.drag.x += dx;
            this.drag.y += dy;
            
            this.move(dx,dy)
            this.timeAxis.move(dx)
        }) 
    
        this.ctx.on('dragstart', (e:any) => {
            e.preventDefault()

            this.ctx.off("mousemove")
            this.drag = {x: e.detail.box.x, y: e.detail.box.y, isDragging: true};
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

    private addTimeAxisResize(){
        this.resize(this.timeAxisCtx);
    }

    resize(context: Svg) {

       this.timeAxisCtx.draggable(false);
       this.timeAxisCtx.draggable(true).on('dragmove', (e:any) => {
            e.preventDefault()

            let dx= e.detail.box.x - this.dragTimeAxis.x;
            this.dragTimeAxis.x += dx;

            var pglyphs = this.glyphs.filter(g => g instanceof PersonGlyph) as PersonGlyph[];

            if (dx > 0)
                this.config.scaleX *= 1.02
            else if (dx < 0)
                this.config.scaleX *= 0.98
            
            this.config.scaleX = Math.max(0.2, this.config.scaleX);
            this.config.scaleX = Math.min(2, this.config.scaleX);

            pglyphs.map(x => x.scaleX(this.config.scaleX))

            var b = this.glyphs.filter(g => g instanceof RelationGlyph) as RelationGlyph[];
            b.map(x => x.scaleX(this.config.scaleX));

            var c = this.glyphs.filter(g => g instanceof GridGlyph) as GridGlyph[];
            c.map(x => x.scaleX(this.config.scaleX));

            this.timeAxis.resizeTimeAxis(this.config.scaleX);
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
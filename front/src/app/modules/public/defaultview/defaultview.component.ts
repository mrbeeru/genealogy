import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Rect, Svg, SVG as svgjs } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs/internal/Observable';
import { PersonV2 } from '../../core/models/person.model';
import { PersonService } from '../../core/services/person.service';
import '@svgdotjs/svg.panzoom.js'
import { Point } from '@svgdotjs/svg.js';
import { PersonGlyph } from '../../graphs/default-graph/glyphs/PersonGlyph';
import { DefaultGraph } from '../../graphs/default-graph/DefaultGraph';
import { TimeAxis } from '../../graphs/default-graph/TimeAxis';
import '@svgdotjs/svg.draggable.js'
import { Line } from '@svgdotjs/svg.js';

@Component({
  selector: 'app-defaultview',
  templateUrl: './defaultview.component.html',
  styleUrls: ['./defaultview.component.scss']
})
export class DefaultviewComponent implements AfterViewInit {

  context!: Svg;
  timeAxisContext!: Svg;
  
  @ViewChild('graph') grapElement!: ElementRef<HTMLElement>;
  @ViewChild('timeaxis') timeAxisElement!: ElementRef<HTMLElement>;
  @ViewChild('grid') gridElement!: ElementRef<HTMLElement>;
  
  //consumer can specify what width is already occupied
  //so this component can try to center the graph
  @Input() persons: PersonV2[] = [];
  //leave this here for now
  @Input() memberAdded!: Observable<PersonV2>;
  @Input() membersChanged!: Observable<PersonV2[]>;
  @Output() selectedPersonChanged: EventEmitter<PersonV2> = new EventEmitter<PersonV2>();

  constructor() 
  {

  }

  g1! : DefaultGraph;


  ngAfterViewInit(): void {
    this.context = svgjs().addTo(this.grapElement.nativeElement).size(8000, 4000);
    this.timeAxisContext = svgjs().addTo(this.timeAxisElement.nativeElement).size(8000, 34)
    console.log(window.innerHeight, window.outerHeight, window.innerWidth, window.outerWidth)


    
    this.membersChanged.subscribe(x => {
        this.persons = x;

        //this.context = svgjs().addTo(this.grapElement.nativeElement).size(2000, 3000);
        //this.timeAxisContext = svgjs().addTo(this.timeAxisElement.nativeElement).size(2000, 34)
        this.resetContexts();
        
        this.g1 = new DefaultGraph(this.persons, this.context, this.timeAxisContext);
        this.g1.draw();
      });

      this.memberAdded.subscribe((x: PersonV2) => {
       //this.persons.push(x)

       this.resetContexts();
       //this.context = svgjs().addTo(this.grapElement.nativeElement).size(2000, 3000);
       //this.timeAxisContext = svgjs().addTo(this.timeAxisElement.nativeElement).size(2000, 34)
       
       this.g1 = new DefaultGraph(this.persons, this.context, this.timeAxisContext);
       this.g1.draw();
      });
  }

  resetContexts(){
    this.context.clear();
    this.timeAxisContext.clear();

    this.context.off("dragmove")
    this.context.off("dragstart")
    this.context.off("dragend")
    this.context.off("mousemove")
  }

}


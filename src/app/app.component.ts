import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Engine } from '@babylonjs/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MyScene } from './babylon/my-scene';
import {doSmth} from 'enterjs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  parts: Observable<string[]>;

  @ViewChild('ref', { static: true })
  private canvas: ElementRef<HTMLCanvasElement>;

  private engine: Engine;
  private scene: MyScene;

  resize = Subscription.EMPTY;
  clicked$: Observable<string | undefined>;

  constructor(private readonly ngZone: NgZone) {
    doSmth.echo({value: 'wert'});
  }

  ngOnInit(): void {
    this.engine = new Engine(this.canvas.nativeElement);
    this.scene = new MyScene(this.engine);
    this.parts = this.scene.parts;
    this.clicked$ = this.scene.highlightedMesh$;
    this.scene.init();

  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.engine.runRenderLoop(() => this.scene.render()));


    this.resize = fromEvent(window, 'resize').pipe(
      debounceTime(300)
    ).subscribe(() => this.engine.resize());

    this.scene.load('assets/engine.obj');
  }

  ngOnDestroy(): void {
    this.scene.dispose();
    this.engine.stopRenderLoop();
    this.engine.dispose();
    this.resize.unsubscribe();
  }

  highlight(part: string): void {
    this.scene.highlight(part);
  }

  select(part: string): void {
    this.scene.select(part);
  }

  reset(): void {
    this.scene.reset();
  }
}

import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Engine } from '@babylonjs/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MyScene } from './babylon/my-scene';

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
  }

  ngOnInit(): void {
    this.engine = new Engine(this.canvas.nativeElement);
    this.scene = new MyScene(this.engine);
    this.parts = this.scene.parts;
    this.clicked$ = this.scene.highlightedMesh$;
    this.scene.init();

  }

  ngAfterViewInit(): void {
    // LAB 1
    // call the scene render function inside the engines render loop
    // and run it outside the ngZone

    this.resize = fromEvent(window, 'resize').pipe(
      debounceTime(300)
    ).subscribe(() => this.engine.resize());

    this.scene.loadModels('assets/engine.obj');
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

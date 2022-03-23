import {
  ActionManager,
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  ExecuteCodeAction,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  TransformNode
} from '@babylonjs/core';
import { OBJFileLoader } from '@babylonjs/loaders';
import { GridMaterial } from '@babylonjs/materials';
import { BehaviorSubject } from 'rxjs';

SceneLoader.RegisterPlugin(new OBJFileLoader());

export class MyScene extends Scene {
  highlightedMesh: string;
  highlightedMesh$ = new BehaviorSubject<string | undefined>(undefined);

  private arcCamera: ArcRotateCamera;
  parts = new BehaviorSubject<string[]>([]);

  constructor(engine: Engine) {
    super(engine);
  }

  select(name: string) {
    // LAB 4
    // find the mesh by name
    // remove opacity of all meshes
    // reset the selected mesh opacity to 1
  }

  highlight(part: string): void {
    this.removeHighlight(this.highlightedMesh);
    const m = this.getMeshByName(part);
    m.outlineColor = new Color3(0.4, 0.4, 1);
    m.outlineWidth = 0.3;
    m.renderOutline = true;
    this.highlightedMesh = part;
    this.highlightedMesh$.next(part);
  }

  removeHighlight(part: string): void {
    if (part) {
      const m = this.getMeshByName(part);
      if (m) {
        m.renderOutline = false;
      }
      this.highlightedMesh = undefined;
      this.highlightedMesh$.next(undefined);
    }
  }

  targetCenter() {
    const node = this.getTransformNodeByName('group');

    const {min, max} = node.getHierarchyBoundingVectors(true);
    node.position.y -= min.y;

    const center = min.add(max).multiplyByFloats(.5, .5, .5);

    this.arcCamera.setTarget(center, true);
    this.arcCamera.radius = 50;
    this.arcCamera.beta = Math.PI / 3;
    this.arcCamera.alpha = -Math.PI / 3;
  }

  reset() {
    this.meshes.filter(m => m.name !== 'grid').forEach(m => {
      m.material.alpha = 1;
      m.setEnabled(true);
    });
  }

  init() {
    this.createBaseScene();
    this.createDefaultLight();
    this.initGround();
    this.handleKeyboardEvents();
    // LAB 5
    // add listener to scene to check on newly added meshes
  }

  private createBaseScene() {
    disableCanvasEvents(this.getEngine().getRenderingCanvas());
    this.createDefaultCamera(true);
    this.arcCamera = this.activeCamera as ArcRotateCamera;
    this.cameras[0].attachControl(this.getEngine().getRenderingCanvas(), false);
    this.clearColor = new Color4(.9, .9, .9, 1);
  }

  private initGround() {
    const plane = MeshBuilder.CreatePlane('grid', {size: 2000, sideOrientation: Mesh.DOUBLESIDE});
    plane.rotation.x = Math.PI / 2;
    const gridMat = new GridMaterial('grid', this);
    gridMat.lineColor = new Color3(.85, .85, .85);
    gridMat.mainColor = new Color3(.5, .5, .5);
    gridMat.opacity = 0.97;
    plane.material = gridMat;
  }

  private handleKeyboardEvents() {
    this.actionManager = new ActionManager(this);
    this.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, evt => {
      const event = evt.sourceEvent as KeyboardEvent;
      if (this.highlightedMesh) {
        const mesh = this.getMeshByName(this.highlightedMesh);

        if (event.code === 'KeyT') {
          const alpha = mesh.material.alpha;
          if (alpha < 1) {
            mesh.material.alpha = 1;
          } else {
            mesh.material.alpha = .3;
          }
        }

        if (event.code === 'KeyD') {
          mesh.setEnabled(false);
        }
      }

      if (event.code === 'KeyZ') {
        this.reset();
      }
    }));
  }

  loadModels(path: string): void {
    // LAB 3
    // - Add meshes as you like
    // - Make a mesh selectable with the cursor

    // LAB 6
    // - Use the SceneLoader to Append meshes by loading from a file
    // - Make a mesh pickable with the cursor
    // - Create a ActionManager for each mesh
    // - Add Actions to the mesh to react to a hover
  }
}


function disableCanvasEvents(canvas: HTMLCanvasElement): void {
  // passive: false is required to catch the touch events properly
  document.body.addEventListener('touchstart', event => preventDefault(event, canvas), {passive: false});
  document.body.addEventListener('touchend', event => preventDefault(event, canvas), {passive: false});
  document.body.addEventListener('touchmove', event => preventDefault(event, canvas), {passive: false});
}

function preventDefault(event: Event, ref: HTMLCanvasElement): void {
  if (event.target === ref) {
    event.preventDefault();
  }
}

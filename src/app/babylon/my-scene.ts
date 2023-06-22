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

  select(part: string) {
    const meshes = this.meshes.filter(m => m.name !== 'grid');
    meshes.forEach(m => m.material.alpha = 0.3);
    meshes.find(m => m.name === part).material.alpha = 1;
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
    disableCanvasEvents(this.getEngine().getRenderingCanvas());

    this.createDefaultCamera(true);
    this.arcCamera = this.activeCamera as ArcRotateCamera;
    this.cameras[0].attachControl(this.getEngine().getRenderingCanvas(), false);
    this.createDefaultLight();
    this.clearColor = new Color4(.9, .9, .9, 1);

    const plane = MeshBuilder.CreatePlane('grid', {size: 2000, sideOrientation: Mesh.DOUBLESIDE});
    plane.rotation.x = Math.PI / 2;
    const gridMat = new GridMaterial('grid', this);
    gridMat.lineColor = new Color3(.85, .85, .85);
    gridMat.mainColor = new Color3(.5, .5, .5);
    gridMat.opacity = 0.97;
    plane.material = gridMat;

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

  load(path: string) {
    SceneLoader.Append('', path, this, scene => {
      const groupNode = new TransformNode('group', this);
      scene.meshes.filter(m => m.name !== 'grid').forEach((m) => {
        m.parent = groupNode;
        m.actionManager = new ActionManager(scene);
        m.isPickable = true;

        m.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => this.highlight(m.name)));
        m.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => this.removeHighlight(m.name)));

        this.parts.value.unshift(m.name);

        this.targetCenter();
      });
    });
  }
}


function disableCanvasEvents(canvas: HTMLCanvasElement): void {
  // passive: false is required to catch the touch events properly
  document.body.addEventListener('touchstart', event => preventDefault(event, canvas), {passive: false});
  document.body.addEventListener('touchend', event => preventDefault(event, canvas), {passive: false});
  document.body.addEventListener('touchmove', event => preventDefault(event, canvas), {passive: false});
}

function preventDefault(event: Event, ref: HTMLCanvasElement): void {
  if (event.target === ref && event.cancelable) {
    event.preventDefault();
  }
}

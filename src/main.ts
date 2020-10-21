import { ApplicationRef, enableProdMode } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(moduleRef => {
    const applicationRef = moduleRef.injector.get(ApplicationRef);

    if (!environment.production) {
      enableDebugTools(applicationRef.components[0]);
    }

    if (location.search.includes('profiling=true')) {
      const originalTick = applicationRef.tick;
      applicationRef.tick = function (): void {
        // tslint:disable-next-line:no-console
        console.time('change detection time');
        try {
          return originalTick.apply(this, arguments);
        } finally {
          // tslint:disable-next-line:no-console
          console.timeEnd('change detection time');
        }
      };
    }
  })
  .catch(err => console.error(err));

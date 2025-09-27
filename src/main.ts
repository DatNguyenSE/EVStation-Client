import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    const splash = document.getElementById('initial-splash');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 500);
    }
  })
  .catch(err => console.error(err));
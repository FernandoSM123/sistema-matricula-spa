import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Layout } from './core/layout/layout';

/** Componente raíz: el layout (§6.1) alrededor de la vista de cada ruta. */
@Component({
  selector: 'sm-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Layout],
  templateUrl: './app.html',
})
export class App {}

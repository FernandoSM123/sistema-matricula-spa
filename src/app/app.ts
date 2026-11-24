import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Marco } from './core/marco/marco';

/** Componente raíz: el marco (§6.1) alrededor de la vista de cada ruta. */
@Component({
  selector: 'sm-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Marco],
  templateUrl: './app.html',
})
export class App {}

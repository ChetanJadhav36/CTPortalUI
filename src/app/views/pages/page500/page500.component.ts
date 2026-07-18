import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import {
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';

@Component({
  selector: 'app-page500',
  templateUrl: './page500.component.html',
  imports: [ContainerComponent, RowComponent, ColComponent, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective]
})
export class Page500Component {}

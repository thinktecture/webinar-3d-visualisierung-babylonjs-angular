import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.component.html',
  styleUrls: ['./parts.component.scss']
})
export class PartsComponent {
  @Input() parts: string[];
  @Input() highlighted: string | undefined;
  @Output() selectPart = new EventEmitter<string>();
  @Output() highlight = new EventEmitter<string>();
}

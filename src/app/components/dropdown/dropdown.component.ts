import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {

  @Input() public options: string[];

  @Input() public selection: string;

  @Input() public width = '10rem';

  @Input() public selectionLabel: string;

  @Input() public optionPadding: string;

  @Input() public outline = true;

  @ViewChild('DropdownContent', {static: false}) private dropdown: ElementRef<HTMLElement>

  @ViewChild('Selection', {static: false}) private selectionReference: ElementRef<HTMLElement>

  @Output() public selectionChange = new EventEmitter<string>();

  private isOpen = false;

  constructor(private _renderer: Renderer2) {
    this._renderer.listen('window', 'click', (event: Event) => {
      if (event.target !== this.dropdown.nativeElement && event.target !== this.selectionReference.nativeElement && this.isOpen) {
        this.toggleDropdown();
      }
    });
  }

  ngOnInit() {
    if (!this.selection) {
      this.selection = this.options[0];
    }
  }

  public toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.dropdown.nativeElement.style.display = this.isOpen ? 'block' : 'none';
  }

  public selectOption(selection: string): void {
    this.selection = selection;
    this.selectionChange.emit(this.selection);
    this.toggleDropdown();
  }

}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerImportComponent } from './player-import.component';

describe('PlayerImportComponent', () => {
  let component: PlayerImportComponent;
  let fixture: ComponentFixture<PlayerImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerImportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

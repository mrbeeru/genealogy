import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMemberDialogComponent } from './create-member-dialog.component';

describe('CreateMemberDialogComponent', () => {
  let component: CreateMemberDialogComponent;
  let fixture: ComponentFixture<CreateMemberDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMemberDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

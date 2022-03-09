import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PersonV2 } from '../../core/models/person.model';

@Component({
  selector: 'app-create-member-dialog',
  templateUrl: './create-member-dialog.component.html',
  styleUrls: ['./create-member-dialog.component.scss']
})
export class CreateMemberDialogComponent implements OnInit {

  newMemberForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),

    birthDate: new FormGroup({
      year: new FormControl(null, [Validators.required, Validators.min(1)]),
      month: new FormControl(null, [Validators.min(1), Validators.max(12)]),
      day: new FormControl(null, [Validators.min(1), Validators.max(31)]),
    }),

    deathDate: new FormGroup({
      year: new FormControl(null, [Validators.min(1)]),
      month: new FormControl(null, [Validators.min(1), Validators.max(12)]),
      day: new FormControl(null, [Validators.min(1), Validators.max(31)]),
    }),

    motherId: new FormControl(null),
    fatherId: new FormControl(null),
    spouseIds: new FormControl(null),
    childrenIds: new FormControl(null)
  })


  constructor(public dialogRef: MatDialogRef<CreateMemberDialogComponent>) { }

  ngOnInit(): void {

  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onOkClick() {
    // let person: PersonV2 = {
    //   id: Date.now().toString(),
    //   projectId: '',

    //   firstName: this.newMemberForm.value.firstName,
    //   lastName: this.newMemberForm.value.lastName,
    //   gender: this.newMemberForm.value.gender,
    //   birthDate: this.newMemberForm.value.birthDate,
    //   deathDate: this.newMemberForm.value.deathDate,

    //   motherId: this.newMemberForm.value.motherId,
    //   fatherId: this.newMemberForm.value.fatherId,
    //   spouseIds: this.newMemberForm.value.spouseIds,
    //   childrenIds: this.newMemberForm.value.childrenIds,
    // }

    this.dialogRef.close(this.newMemberForm.value)
  }

}

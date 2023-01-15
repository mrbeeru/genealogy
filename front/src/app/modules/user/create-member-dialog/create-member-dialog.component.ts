import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonV2 } from '../../core/models/person.model';

@Component({
  selector: 'app-create-member-dialog',
  templateUrl: './create-member-dialog.component.html',
  styleUrls: ['./create-member-dialog.component.scss']
})
export class CreateMemberDialogComponent implements OnInit {

  newMemberForm = new UntypedFormGroup({
    firstName: new UntypedFormControl('', Validators.required),
    lastName: new UntypedFormControl('', Validators.required),
    gender: new UntypedFormControl('', Validators.required),

    birthDate: new UntypedFormGroup({
      year: new UntypedFormControl(null, [Validators.required, Validators.min(1)]),
      month: new UntypedFormControl(null, [Validators.min(1), Validators.max(12)]),
      day: new UntypedFormControl(null, [Validators.min(1), Validators.max(31)]),
    }),

    deathDate: new UntypedFormGroup({
      year: new UntypedFormControl(null, [Validators.min(1)]),
      month: new UntypedFormControl(null, [Validators.min(1), Validators.max(12)]),
      day: new UntypedFormControl(null, [Validators.min(1), Validators.max(31)]),
    }),

    motherId: new UntypedFormControl(null),
    fatherId: new UntypedFormControl(null),
    spouseIds: new UntypedFormControl(null),
    childrenIds: new UntypedFormControl(null)
  })

  inputData: any = undefined;

  constructor(
    public dialogRef: MatDialogRef<CreateMemberDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any) 
  { 
    this.inputData = data;
    
    if (data?.parent != null)
    {
      this.hookValues(data.parent)
    }
  }

  ngOnInit(): void {

  }

  hookValues(parent: PersonV2)
  {
    if (parent.gender == 'm'){
      this.newMemberForm.controls["fatherId"].setValue(parent.id);

      if (parent.spouseIds != null && parent.spouseIds.length > 0)
        this.newMemberForm.controls["motherId"].setValue(parent.spouseIds[0]);
    }
    else
    {
      this.newMemberForm.controls["motherId"].setValue(parent.id);

      if (parent.spouseIds != null && parent.spouseIds.length > 0)
        this.newMemberForm.controls["fatherId"].setValue(parent.spouseIds[0]);
    }

  }

  onCancelClick(): void {
    console.log(this.newMemberForm.value)
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

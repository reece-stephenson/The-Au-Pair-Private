import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { User, auPair, Parent } from '../../../../shared/interfaces/interfaces';
import { API } from '../../../../shared/api/api.service';

@Component({
  selector: 'the-au-pair-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public parentRegisterDetailsForm: FormGroup;
  public submitAttempt: boolean;
  public notSamePasswords: boolean;
  public locationError: boolean;
  public medError: boolean;
  
  parentChosen = true;
  maleChosen = true;

  userDetails: User ={
    id: '',
    fname: '',
    sname: '',
    email: '',
    address: '',
    registered: false,
    type: 3,
    password: '',
    number: '',
    salt: '',
    latitude: 0,
    longitude: 0,
    suburb: "",
    gender: "",
    age: 0,
    fcmToken : "",
  }

  parentDetails: Parent ={
    id: '',
    children: [],
    medID: '',
    auPair: ''
  }

  aupairDetails: auPair ={
    id: '',
    rating: 0,
    onShift: false,
    employer: '',
    costIncurred: 0,
    distTraveled: 0,
    payRate: 0,
    bio: '',
    experience: '',
    currentLong: 0.0,
    currentLat : 0.0
  }


  constructor(public formBuilder: FormBuilder, public toastCtrl: ToastController, private http: HttpClient, private serv: API) 
  {
    this.parentRegisterDetailsForm = formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z ,\'-]+$'), Validators.required])],
      surname : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z ,\'-]+$'), Validators.required])],
      email : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'), Validators.required])],
      phone : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^(\\+27|0)[6-8][0-9]{8}$'), Validators.required])],
      id : ['', Validators.compose([Validators.maxLength(13), Validators.pattern('(((\\d{2}((0[13578]|1[02])(0[1-9]|[12]\\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\\d|30)|02(0[1-9]|1\\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\\d{4})( |-)(\\d{3})|(\\d{7}))'), Validators.required])],
      medAid : ['', Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z\\d]*')])],
      location : ['', Validators.compose([Validators.required])],
      pass : ['', Validators.compose([Validators.maxLength(20), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'), Validators.required])],
      confPass : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'), Validators.required])],
    });

    this.submitAttempt = false;
    this.notSamePasswords = false;
    this.locationError = false;
    this.medError = false;
  }

  async registerUser() 
  {
    this.medError = false;
    this.locationError = false;

    this.submitAttempt = true;
    this.notSamePasswords = true;
    let formError = false;

    if(this.parentChosen)
    {
      if(this.parentRegisterDetailsForm.value.medAid === '')
      {
        this.medError = true;
        formError = true;
      }
    }

    if(!this.parentRegisterDetailsForm.controls['location'].valid)
    {
      formError = true;
    }
    else
    {
        this.verifyLocation(this.parentRegisterDetailsForm.value.location)

        if (this.locationError)
        {
          this.openToast("Please select a valid location from the suggested below.");
          formError = true;
        }
      }

    if(!formError && this.parentRegisterDetailsForm.controls['name'].valid && this.parentRegisterDetailsForm.controls['surname'].valid && this.parentRegisterDetailsForm.controls['email'].valid && this.parentRegisterDetailsForm.controls['phone'].valid && this.parentRegisterDetailsForm.controls['id'].valid && this.parentRegisterDetailsForm.controls['medAid'].valid && this.parentRegisterDetailsForm.controls['location'].valid  && this.parentRegisterDetailsForm.controls['pass'].valid  && this.parentRegisterDetailsForm.controls['confPass'].valid)
    {
      let application = "";
      this.userDetails.id = this.parentRegisterDetailsForm.value.id;
      this.userDetails.fname = this.parentRegisterDetailsForm.value.name;
      this.userDetails.sname = this.parentRegisterDetailsForm.value.surname;
      this.userDetails.email = (this.parentRegisterDetailsForm.value.email).toLowerCase();
      this.userDetails.address = this.parentRegisterDetailsForm.value.location;
      this.userDetails.number = this.parentRegisterDetailsForm.value.phone;
      this.userDetails.password = this.parentRegisterDetailsForm.value.pass;

      if(this.parentChosen) 
      {
        this.userDetails.type = 1;
        this.userDetails.registered = true;
      }
      else
      {
        this.userDetails.type = 2;
      }

      await this.serv.register(this.userDetails)
      .toPromise()
      .then(
        res => {
          application = res;
        },
        error => {
          console.log("Error has occured with API: " + error);
        }
      )

      if(application == "pending")
      {
        if(this.parentChosen)
        {
          this.openToast("Registration succesfull");
          this.parentDetails.id = this.userDetails.id;
          this.parentDetails.medID = this.parentRegisterDetailsForm.value.medAid;

          await this.serv.addParent(this.parentDetails)
          .toPromise()
          .then(
            res => {
              console.log("The response is:" + res);
            },
            error => {
              console.log("Error has occured with API: " + error);
            }
          )
        }
        else
        {
          this.openToast("Registration succesfull pending approval");
          this.aupairDetails.id = this.userDetails.id;
          this.serv.addAuPair(this.aupairDetails)
          .toPromise()
          .then(
            res => {
              console.log("The response is:" + res);
            },
            error => {
              console.log("Error has occured with API: " + error);
            }
          )
        }
      }
      else
      {
        this.openToast("Account already exists with email : "+application);
      }
    }
  }

  async openToast(message: string)
  {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 4000,
      position: 'top',
      color: 'primary',
      cssClass: 'toastPopUp'
    });
    await toast.present();
  }

  async verifyLocation(loc : string)
  {    
    this.locationError = false;

    const locationParam = loc.replace(' ', '+');
    const params = locationParam + '&limit=4&format=json&polygon_geojson=1&addressdetails=1';

    //Make the API call
    await this.http.get('https://nominatim.openstreetmap.org/search?q='+params)
    .toPromise()
    .then(data=>{ // Success
      //Populate potential Locations Array
      const json_data = JSON.stringify(data);
      const res = JSON.parse(json_data);

      //Jump out if no results returned
      if(json_data === "{}")
      {
        this.locationError = true;
      }
  
      //Add returned data to the array
      const len = res.length;
      for (let j = 0; j < len && j<4; j++) 
      { 
        if(loc == res[j]) {
          this.locationError = false;
        }
      }
    })
    .catch(error=>{ // Failure
      console.log(error);
    });
    
    this.locationError = true;
  }

}

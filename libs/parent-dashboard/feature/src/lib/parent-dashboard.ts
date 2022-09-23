import { Component, OnInit } from '@angular/core';
import { API } from '../../../../shared/api/api.service';
import { auPair, Child, Parent, User } from '../../../../shared/interfaces/interfaces';
import { AuPairRatingModalComponent } from './au-pair-rating-modal/au-pair-rating-modal.component';
import { UserReportModalComponent } from './user-report-modal/user-report-modal.component';
import { ModalController, ToastController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SetAuPair, SetChildren } from '../../../../shared/ngxs/actions';

@Component({
  selector: 'the-au-pair-parent-dashboard',
  templateUrl: 'parent-dashboard.html',
  styleUrls: ['parent-dashboard.scss'],
})
export class ParentDashboardComponent implements OnInit{ 
  children: Child[] = [];
  parentID = "";
  umPoorID = "";

  handlerMessage!: boolean;

  childDetails: Child ={
    id: "",
    fname: "",
    sname: "",
    dob: "",
    allergies: "",
    diet: "",
    parent: "",
    aupair: ''
  }

  parentDetails: Parent = {
    id: "",
    children: [],
    medID: "",
    auPair: "",
    rating: []
  }

  userDetails: User = {
    id: '',
    fname: '',
    sname: '',
    email: '',
    address: '',
    registered: false,
    type: 0,
    password: '',
    number: '',
    salt: '',
    latitude: 0,
    longitude: 0,
    suburb: "",
    gender: "",
    fcmToken : "",
    birth: "",
    warnings: 0,
    banned: "",
  }

  auPairDetails: User = {
    id: "",
    fname: "",
    sname: "",
    email: "",
    address: "",
    registered: false,
    type: 0,
    password: "",
    number: "",
    salt: "",
    latitude: 0,
    longitude: 0,
    suburb: "",
    gender: "",
    fcmToken : "",
    birth: "",
    warnings: 0,
    banned: "",
  }

  currentAuPair: auPair = {
    id: "",
    rating: [],
    onShift: false,
    employer: "",
    costIncurred: 0,
    distTraveled: 0,
    payRate: 0,
    bio: "",
    experience: "",
    currentLong: 0.0,
    currentLat: 0.0,
    terminateDate: "",
  }

  constructor(private serv: API, private modalCtrl : ModalController, private store: Store, public toastCtrl: ToastController, public router: Router, private alertController: AlertController){}


  async openReportModal() {
    const modal = await this.modalCtrl.create({
      component: UserReportModalComponent
    });
    await modal.present();
  }

  async ngOnInit()
  {
    this.parentID = this.store.snapshot().user.id;

    await this.getUserDetails(this.parentID);
    
    await this.serv.getParent(this.parentID)
    .toPromise()
      .then( 
        res=>{      
          this.parentID = res.id;
          this.parentDetails = res;

          //setting the state
          this.store.dispatch(new SetChildren(res.children));
          this.store.dispatch(new SetAuPair(res.auPair));
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )

    if(this.parentDetails.auPair != "")
    {
      await this.serv.getUser(this.parentDetails.auPair)
      .toPromise()
      .then(
        res => {
          this.auPairDetails = res;
        },
        error => { 
          console.log("Error has occured with API: " + error);
        }
      )
    }

    await this.getChildren();

    this.umPoorID = this.parentDetails.auPair;
    

    if(this.umPoorID != "")
    {
      await this.getAuPairDetails();

      if(this.currentAuPair.terminateDate != '')
      {
        await this.checkResignation();
      }
    }
  }

  async getUserDetails(userID : string)
  {
    await this.serv.getUser(userID).toPromise()
    .then( 
      res=>{
        this.userDetails = res;
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )
  }

  async openModal(auPairId : string) {
    const modal = await this.modalCtrl.create({
      component: AuPairRatingModalComponent,
      componentProps :{
        auPairId : auPairId
      }
    });
    await modal.present();
  }

  async getChildren(){
    this.serv.getChildren(this.parentID).subscribe(
      res=>{
        let i = 0;
        res.forEach((element: Child) => {
          this.children[i++] = element;
        });
      },
      error =>{console.log("Error has occured with API: " + error);}
    )
  }

  async openToast(message: string)
  {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 1500,
      position: 'top',
      cssClass: 'toastPopUp'
    });
    await toast.present();
  }

  async checkHasChildren(){
    if (this.parentDetails.children.length >= 1){
      this.router.navigate(['/add-activity']);
    }
    else
    {
      this.openToast('You have no children to assign activities to');
    }
  }

  async checkHasChildrenSchedule(){
    if (this.parentDetails.children.length >= 1){
      this.router.navigate(['/schedule']);
    }
    else
    {
      this.openToast("You have no childrens' schedules to view");
    }
  }

  async checkHasChildrenExplore(){
    if (this.parentDetails.children.length < 1){
      this.openToast('You need to have children added to your profile in order to hire an Au Pair');
    }
    else if(this.parentDetails.auPair != "")
    {
      this.openToast('You already have an Au Pair employed');
    }
    else
    {
      this.router.navigate(['/explore']);
    }
  }

  async checkHasEmployer(){
    if (this.parentDetails.auPair !== ""){
      this.router.navigate(['/au-pair-cost']);
    }
    else
    {
      this.openToast('You do not have an Au Pair Employed');
    }
  }

  async checkHasEmployerTrack(){
    if (this.parentDetails.auPair !== ""){
      this.router.navigate(['/track-au-pair']);
    }
    else
    {
      this.openToast('You do not have an Au Pair Employed');
    }
  }

  async checkResignation()
  {         
    const then  = new Date(this.currentAuPair.terminateDate);
    const now = new Date();

    const msBetweenDates = Math.abs(then.getTime() - now.getTime());

    let daysBetweenDates = msBetweenDates / (24 * 60 * 60 * 1000);

    daysBetweenDates = Math.ceil(daysBetweenDates);    

    if(daysBetweenDates >= 14)
    {
      this.terminateAuPair();
    }
  }

  async terminateAuPair()
  {
    await this.getAuPairDetails();

    this.currentAuPair.terminateDate = "";
    this.currentAuPair.employer = "";
    this.parentDetails.auPair = "";

    await this.updateAuPair();
    await this.updateParent();
    await this.removeChildrenAuPair();
  }

  async getAuPairDetails()
  {
    await this.serv.getAuPair(this.umPoorID)
    .toPromise()
      .then(
      res=>{
        this.currentAuPair = res;
      },
      error=>{console.log("Error has occured with API: " + error);}
    )
  }

  async getParentDetails()
  {
    await this.serv.getParent(this.parentID)
    .toPromise()
      .then( 
        res=>{
          this.parentDetails = res;
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )
  }

 async removeChildrenAuPair()
 {
    await this.serv.getChildren(this.parentID)
    .toPromise()
    .then(
      res=>{        
        for(let i = 0; i < res.length; i++)
        {
          this.childDetails.id = res[i].id;
          this.childDetails.fname = res[i].fname;
          this.childDetails.sname = res[i].sname;
          this.childDetails.allergies = res[i].allergies;
          this.childDetails.diet = res[i].diet;
          this.childDetails.parent = res[i].parent;
          this.childDetails.dob = res[i].dob;
          this.childDetails.aupair = "";

          this.updateChild(this.childDetails);
        }
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    ) 
 }

  async updateAuPair(){
    await this.serv.editAuPair(this.currentAuPair).toPromise()
    .then(
      res=>{
        console.log("The response is:" + res);
        return res;
      },
      error=>{
        console.log("Error has occured with API: " + error);
        return error;
      }
    );
  }

  async updateParent(){
    await this.serv.editParent(this.parentDetails).toPromise()
    .then(
      res=>{
        console.log("The response is:" + res);
        return res;
      },
      error=>{
        console.log("Error has occured with API: " + error);
        return error;
      }
    );
  }

  async updateChild(child : Child){
    await this.serv.updateChild(child).toPromise()
    .then(
      res=>{
        console.log("The response is:" + res);
        return res;
      },
      error=>{
        console.log("Error has occured with API: " + error);
        return error;
      }
    )
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Terminate Contract?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          handler: () => { this.terminateAuPair(); }
        }]});
    await alert.present();
  }
}

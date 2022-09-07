import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import { Report } from '../../../../../shared/interfaces/interfaces';
import { API } from '../../../../../shared/api/api.service';
import { Store } from '@ngxs/store';

@Component({
  selector: 'the-au-pair-user-report-modal',
  templateUrl: './user-report-modal.component.html',
  styleUrls: ['./user-report-modal.component.scss'],
})
export class UserReportModalComponent implements OnInit {
  parentID = "";
  auPairId = "";
  
  reportDetails: Report = {
    id: "",
    reportIssuerId: "",
    reportedUserId: "",
    desc: ""
  }
  
  public navParams = new NavParams;
  public sending = false;
  
  constructor(private serv: API, private modalCtrl : ModalController ,public toastCtrl: ToastController, private store: Store) {}

  async ngOnInit() {
    this.parentID = this.store.snapshot().user.id;
    await this.serv.getParent(this.parentID)
    .toPromise()
      .then( 
        res=>{
          this.auPairId = res.auPair;
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )
  }

  closeModal(){
    this.modalCtrl.dismiss();
  }

  async reportUser(formData : any){ 
    if(formData.desc == "") {
      this.openToast("Please add a description");
      return;
    }
    
    this.sending = true;

    this.reportDetails.reportIssuerId = this.parentID;
    this.reportDetails.reportedUserId = this.auPairId;
    this.reportDetails.desc = formData.desc;

    await this.serv.addReport(this.reportDetails)
    .toPromise()
      .then( 
        res=>{
          this.closeModal();
          this.openToast("Report sent!");
          this.sending = false;
          return res;
      },
      error => {
        console.log("Error has occured with API: " + error);
        this.sending = false;
        return error;
      }
    )
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
}

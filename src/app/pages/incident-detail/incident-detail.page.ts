import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { IncidentService, Incident } from '../../services/incidents';


@Component({
  selector: 'app-incident-detail',
  standalone: true,
  templateUrl: './incident-detail.page.html',
  styleUrls: ['./incident-detail.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class IncidentDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private incidentService = inject(IncidentService);
  private alertCtrl = inject(AlertController);
  
  incident: Incident | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.incidentService.icidentsPage(1, 100).subscribe(list => {
        this.incident = list.find(item => item.id === id) || null;
      });
    }
  }

  async resolver(){
    if (!this.incident || this.incident.estado === 'resuelta') return;
    
    const alert = await this.alertCtrl.create({
      header: 'Resolver Incidencia',
      message: 'Ingrese una observación de la resolución:',
      inputs: [{ name: 'obs', type: 'text', placeholder: 'Observación...' }],
      buttons: [{
        text: 'Guardar',
        handler: (d) => {
          if (d.obs && this.incident?.id) {
            this.incidentService.statusUpdate(this.incident.id, 'resuelta', d.obs).subscribe(res => {
              this.incident = res;
            });
          }
        }
      }]
    });
    await alert.present();
  }
}
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  logInOutline,
  personAddOutline,
  shieldCheckmarkOutline,
  alertCircleOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonLabel
  ]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  modo: 'login' | 'register' = 'login';
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      logInOutline,
      personAddOutline,
      shieldCheckmarkOutline,
      alertCircleOutline,
      eyeOutline,
      eyeOffOutline
    });
  }

  cambiarModo(modo: 'login' | 'register') {
    this.modo = modo;
    this.errorMessage = '';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.authForm.value;

    try {
      if (this.modo === 'login') {
        await this.authService.login(email.trim(), password);
        await this.mostrarToast('Bienvenido a UrbanInspect', 'success');
      } else {
        await this.authService.register(email.trim(), password);
        await this.mostrarToast('Inspector registrado con éxito', 'success');
      }

      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (err: any) {
      this.errorMessage = this.obtenerMensajeError(err.code || err.message);
    } finally {
      this.isLoading = false;
    }
  }

  private obtenerMensajeError(codigo: string): string {
    switch (codigo) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Credenciales inválidas. Revisa el correo y contraseña.';
      case 'auth/email-already-in-use':
        return 'Este correo ya se encuentra registrado.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'El formato de correo ingresado no es válido.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu conexión a internet.';
      default:
        return 'Ocurrió un error al autenticar. Intenta de nuevo.';
    }
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

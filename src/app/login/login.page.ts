import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { User } from '../clases/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @Input() user: User = new User();
  @Input() listaUsuarios = [{ "id": 1, "email": "admin@admin.com", "password": "111111", "perfil": "admin", "sexo": "femenino" },
  { "id": 2, "email": "invitado@invitado.com", "password": "222222", "perfil": "invitado", "sexo": "femenino" },
  { "id": 3, "email": "usuario@usuario.com", "password": "333333", "perfil": "usuario", "sexo": "masculino" },
  { "id": 4, "email": "anonimo@anonimo.com", "password": "444444", "perfil": "usuario", "sexo": "masculino" },
  { "id": 5, "email": "tester@tester.com", "password": "555555", "perfil": "tester", "sexo": "femenino" }]

  constructor(
    private authService: AuthService,
    private toast: ToastController,
    private router: Router) { }

  ngOnInit() {
  }

  seleccionarUsuario(usuario: User) {
    this.user.email = usuario.email;
    this.user.password = usuario.password;
  }
  async presentToast(mensaje: string, duracion: number, color: string, titulo: string, boton?: boolean,
    tituloBotonUno?: string, tituloBotonDos?: string, urlUno?: string, urlDos?: string) {
    let toast;
    if (boton) {
      toast = await this.toast.create({
        message: mensaje,
        duration: duracion,
        color: color,
        header: titulo,
        buttons: [
          {
            side: "end",
            text: tituloBotonUno,
            handler: () => {
              this.router.navigateByUrl("/" + urlUno);
            }
          },
          {
            side: "end",
            text: tituloBotonDos,
            handler: () => {
              this.router.navigateByUrl("/" + urlDos);
            }
          }
        ]

      });
    }
    else {
      toast = await this.toast.create({
        message: mensaje,
        duration: duracion,
        color: color,
        header: titulo
      });
    }
    toast.present();
  }


  async onLogin() {
    const response: any = await this.authService.onLogin(this.user);
    console.log(response);
    if (response.user) {
      this.authService.currentUser = this.user;
      console.log(this.authService.currentUser);
      this.presentToast("", 800, "success", "Bienvenido");
      this.router.navigateByUrl('/home');
    } else {
      switch (response.code) {
        case "auth/wrong-password":
          this.presentToast("Los datos no son validos, intenta de nuevo", 3000, "warning", "Cuenta incorrecta");
          break;
        case "auth/invalid-email":
          this.presentToast("Debe ser un correo electronico, intenta de nuevo", 3000, "warning", "Formato invalido");
          break;
        case "auth/user-not-found":
          this.presentToast("La cuenta no esta registrada", 3000, "warning", "Cuenta inexistente");
          break;

      }

    }
  }

}
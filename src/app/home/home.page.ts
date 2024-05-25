import { Component, OnInit, ɵConsole } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { AuthService } from 'src/app/services/auth.service';
import { Vibration } from '@ionic-native/vibration/ngx';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  countPasswordWrong = 0;
  estado = "";
  showDialog: boolean = false;
  password = '';
  presionado: boolean = false;
  subscription: any;
  audioIzquierda = "../../assets/audios/izquierda.mp3";
  audioDerecha = "../../assets/audios/derecha.mp3";
  audioFlash = "../../assets/audios/alarmaDos.wav";
  audioVibrando = "../../assets/audios/vibrando.wav";
  invalidPassword = "../../assets/audios/alarmaUno.wav";
  audio = new Audio();
  primerIngreso: boolean = true;
  primerIngresoFlash: boolean = true;

  posicionActual = 'actual';
  posicionAnterior = 'anterior';
  mostrarDialog: boolean = true;
  // TEST
  accelerationX: any;
  accelerationY: any;
  accelerationZ: any;

  constructor(private screenOrientation: ScreenOrientation,
    private deviceMotion: DeviceMotion,
    private flashlight: Flashlight,
    private authService: AuthService,
    private vibration: Vibration, private afAuth:AngularFireAuth, private router:Router
  ) {
    // this.audioIzquierda = new Audio("../../assets/audios/estaHurtando.wav");
    // this.audioDerecha = new Audio("../../assets/audios/esMio.wav");
    // this.audioFlash = new Audio("../../assets/audios/alarmaDos.wav");
    // this.audioVibrando = new Audio("../../assets/audios/vibrando.wav");
    // this.invalidPassword = new Audio("../../assets/audios/alarmaUno.wav");
  }

  ngOnInit() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
  }

  activarDesactivarAlarma() {
    if (this.presionado) {//si esta presionado entro para mostrar el dialog de deslogeo
      this.showDialog = true;
      if (this.password == this.authService.currentUser.password) {//verifico que la contraseña sea correcta
        this.flashlight.switchOff();

        this.estado = "permitido"// muestro la doble tilde del html
        setTimeout(() => {
          this.presionado = false; //cambio el estado del boton
          this.estado = ""//muestro el icono de ingreso en html
          this.password = "";//borro el password de ingreso
          this.showDialog = false;//oculto el dialog
          this.stop();//dejo de estar subscripto al acceleration
          this.countPasswordWrong = 0;//reinicio el contador
        }, 1000);
      }
      else if (this.password != '') {
        this.countPasswordWrong++;
        this.estado = "denegado"// muestro la doble tilde del html
        setTimeout(() => {
          this.estado = ""//muestro el icono de ingreso en html
        }, 1000);
        if (this.countPasswordWrong >1 ) {
          this.audio.src = this.invalidPassword;
          this.audio.play();
          this.flashlight.switchOn();
          setTimeout(() => { this.flashlight.switchOff();},5000);
        }
      }
    }
    else {
      this.presionado = true;
      this.start();
    }
  }
  closeDialog() {
    this.showDialog = false;
  }

  activarSoloAudioIzquierda() {
    //desactivamos otros audios
    this.primerIngreso = false;
    this.primerIngresoFlash = true;
    //activamos el audio que queremos
    //this.audioIzquierda.play(); //play
    if ((this.posicionActual!=this.posicionAnterior)) {
          this.posicionAnterior="izquierda";
          this.audio.src = this.audioIzquierda;
    }
    this.audio.play();
  }
  activarSoloAudioDerecha() {
    this.primerIngreso = false;
    this.primerIngresoFlash = true;
    if (this.posicionActual!=this.posicionAnterior) {
      this.posicionAnterior="derecha";
      this.audio.src = this.audioDerecha;
    }
    this.audio.play();
  }
  activarSoloAudioConVibrador() {
    if (this.posicionActual!=this.posicionAnterior){
      this.posicionAnterior="plano";

      //this.audio.src = this.audioVibrando;
    }
    this.primerIngreso ? null : this.audio.play();
    this.primerIngreso ? null : this.vibration.vibrate(5000);
    this.primerIngreso = true;
    this.primerIngresoFlash = true;
  }
  activarSoloFlashConAudio() {
    if (this.primerIngresoFlash) {
      this.primerIngresoFlash ? this.flashlight.switchOn() : null;
      setTimeout(() => {
        this.primerIngresoFlash = false;
        this.flashlight.switchOff();
      }, 5000);
      this.primerIngreso = false;
    }

  }
  reiniciarFlashYVibrador() {
    this.primerIngreso = false;
    this.primerIngresoFlash = true;
  }
  start() {
    this.subscription = this.deviceMotion.watchAcceleration({ frequency: 300 }).subscribe((acceleration: DeviceMotionAccelerationData) => {
      this.accelerationX = Math.floor(acceleration.x);
      this.accelerationY = Math.floor(acceleration.y);
      this.accelerationZ = Math.floor(acceleration.z);

      if (acceleration.x > 5) {
        //Izquierda
        this.posicionActual='izquierda';
        this.activarSoloAudioIzquierda();
      }
      else if (acceleration.x < -5) {
        //derecha
        this.posicionActual='derecha';
        this.activarSoloAudioDerecha();
      }
      else if (acceleration.y >= 9) {
        //encender flash por 5 segundos y sonido
        this.posicionActual='arriba';
        if ((this.posicionActual!=this.posicionAnterior)) {
          this.audio.src = this.audioFlash;
          this.posicionAnterior="arriba";
        }
        this.audio.play();
        this.activarSoloFlashConAudio();

      }
      else if (acceleration.z >= 9 && (acceleration.y >= -1 && acceleration.y <= 1) && (acceleration.x >= -1 && acceleration.x <= 1)) {
        //acostado vibrar por 5 segundos y sonido
        this.posicionActual='plano';
        this.activarSoloAudioConVibrador();

      }

    });
  }

  stop() {
    this.mostrarDialog = true;
    this.primerIngreso = true;
    this.subscription.unsubscribe();
  }

  async cerrarSesion(){

    await this.afAuth.signOut();
    this.router.navigateByUrl('login');
  }

}
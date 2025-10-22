  import { Component, inject } from '@angular/core';
  import { ReservationService } from '../../core/service/reservation-service';
  import { Router } from '@angular/router';
  import { Reservation } from '../reservation/reservation';

  @Component({
    selector: 'app-list-reservation',
    imports: [],
    templateUrl: './list-reservation.html',
    styleUrl: './list-reservation.css'
  })
  export class ListReservation {

    id?:number;
    private reservation = inject(ReservationService);
    private router = inject(Router);
    message='';
    loading=false;
    cancelReservation(){
    if (this.id === undefined) {
    this.message = 'Reservation ID is required.';
    return;
  }
      this.reservation.cancelReservation(this.id).subscribe()
    }
  }

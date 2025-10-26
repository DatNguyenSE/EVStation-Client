import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { BusyService } from '../service/busy-service';
import { inject } from '@angular/core';
import { delay, finalize, of, tap } from 'rxjs';

const cache = new Map<string, HttpEvent<unknown>>(); //lấy response cũ từ cache → không gọi API nữa.
//HttpEvent trả về kiểu event , trả json(event.body)

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  if(req.method === 'GET'){
    const cachedRespnse = cache.get(req.url);
    if(cachedRespnse){
      console.log('📦 Current cache:', Array.from(cache.keys()));
      return of(cachedRespnse)
    }
  }
  busyService.busy();

  return next(req).pipe(
    delay(500),
    tap(response => {
      cache.set(req.url, response)
    }),
    finalize(() => {
      busyService.idle()
    })
  );
  
};
export function clearHttpCache() {
  cache.clear();
  console.log(' HTTP cache cleared!');
}


import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Post } from '../../_models/station';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';

  addPostToStation(stationId : number,post:Partial<Post>){
    return this.http.post<Post>(`${this.baseUrl}/posts/${stationId}/post`,post);
  }
  deletePost(id:number){
    return this.http.delete<void>(`${this.baseUrl}/posts/${id}`);
  }
  updatePost(id:string,post : Partial<Post>){
     return this.http.put<Post>(`${this.baseUrl}/posts/${id}`,post);
  }
updateStatusPost(id: number, status: number) {
   return this.http.put(
    `${this.baseUrl}/posts/${id}/status`,
    JSON.stringify(status), // backend nhận int trực tiếp
    {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    }
  );
}



}

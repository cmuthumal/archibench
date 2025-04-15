import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataService {
  private chatGptApiKey = '';
  private chatGptUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  getArchitectureSuggestion(body: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.chatGptApiKey}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.chatGptUrl, body, { headers });
  }
}

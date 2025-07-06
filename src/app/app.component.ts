import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('diagram') diagramElement!: ElementRef<HTMLImageElement>;

  requirementStr: string = '';
  mermaidAiInputStr: string = '';
  encodedDiagram: string = '';
  loading: boolean = false;

  answer: string = '';

  constructor(public dataService: DataService) {}

  onSubmit() {
    if (this.requirementStr.length > 10) {
      this.loading = true;

      const body = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful personal assistant. Help the user manage tasks, appointments, and entertainment suggestions.',
          },
          {
            role: 'user',
            content: this.requirementStr,
          },
        ],
        temperature: 0.7,
      };

      this.dataService.getArchitectureSuggestion(body).subscribe((res: any) => {
        if (res && res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content) {
          this.answer = res.choices[0].message.content;
          this.loading = false;
        } else {
          this.answer = 'Something went wrong. Please try again later.';
          this.loading = false;
        }
      });
    }
  }
}

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

  solutionSummary: string = '';
  frontend: string = '';
  backend: string = '';
  database: string = '';
  realtime: string = '';
  reporting: string = '';
  justification: string = '';

  constructor(public dataService: DataService) {}

  onSubmit() {
    if (this.requirementStr.length > 10) {
      this.loading = true;
      const query = `When I provide a high-level requirement, respond in this JSON format:
        {
          "solutionSummary": "Brief overview of the solution",
          "recommendedArchitecture": {
            "frontend": "Frontend framework/library",
            "backend": "Backend technology",
            "database": "Database system",
            "realtime": "Real-time communication solution (if needed)",
            "reporting": "Tool or library for reporting (if needed)"
          },
          "justification": {
            "tech": "Justify all the tech choice here"
          },
          "mermaidDiagram": "A Mermaid.js diagram (in 'graph TD' or 'graph LR' format) that visualizes the architecture components and their relationships"
        }
        Requirement:${this.requirementStr}`;

      const body = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a software architecture assistant. Given user requirements, you suggest solution architectures with reasoning.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
      };

      this.dataService.getArchitectureSuggestion(body).subscribe((res: any) => {
        let rawResponse = res.choices[0].message.content;
        const jsonCleaned = rawResponse.replace(/```json|```/g, '').trim();

        if (jsonCleaned) {
          try {
            const parsedJson = JSON.parse(jsonCleaned);

            this.solutionSummary = parsedJson.solutionSummary;
            this.frontend = parsedJson.recommendedArchitecture.frontend;
            this.backend = parsedJson.recommendedArchitecture.backend;
            this.database = parsedJson.recommendedArchitecture.database;
            this.realtime = parsedJson.recommendedArchitecture.realtime;
            this.reporting = parsedJson.recommendedArchitecture.reporting;
            this.justification = parsedJson.justification.tech;

            this.mermaidAiInputStr = parsedJson.mermaidDiagram;
            if (this.mermaidAiInputStr.length > 10) {
              this.updateDiagram();
            }
          } catch (err) {
            console.error('Failed to parse JSON from response:', err);
          }
        } else {
          this.loading = false;
        }
      });
    }
  }

  updateDiagram() {
    this.encodedDiagram = this.encodeDiagram(this.mermaidAiInputStr);
  }

  encodeDiagram(text: string): string {
    const deflated = new TextEncoder().encode(text);
    const base64 = btoa(String.fromCharCode(...deflated));
    this.loading = false;
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  get diagramUrl(): string {
    return `https://mermaid.ink/img/${this.encodedDiagram}`;
  }
}

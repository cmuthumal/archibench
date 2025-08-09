import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('diagram') diagramElement!: ElementRef<HTMLImageElement>;

  requirementStr: string = 'I need a web-based platform for university students to collaborate on group projects. The platform should allow real-time document editing, group chat, task assignment, file sharing, and basic reporting on project progress. It should be accessible on desktop and mobile devices, and have user authentication via university email.';
  loading: boolean = false;
  testData: any;

  constructor(public dataService: DataService) {}

  onSubmit() {
    if (this.requirementStr.length > 10) {
      this.loading = true;
      const query = `You are an expert Model-Driven Test Engineering assistant.
      When provided a high-level functional requirement, produce a JSON object only (no extra commentary)
      that contains the following keys:

      {
        "model": "<string> - human- and machine-readable test model (UML-like state table, state machine text or decision table). Use plain text or markdown where helpful.",
        "cases": [
          {
            "id": "TC001",
            "title": "Short title",
            "type": "functional | negative | boundary | performance",
            "description": "Step-by-step test steps (Given / When / Then or numbered steps)",
            "preconditions": "Any setup needed",
            "expectedResult": "Expected outcome"
          }
        ],
        "scripts": [
          {
            "id": "S001",
            "language": "javascript | python",
            "framework": "playwright | selenium | pytest",
            "fileName": "login.spec.js",
            "content": "/* full script contents as a single string; must be valid code for the chosen framework */",
            "notes": "Any special instructions (e.g., environment variables, selectors)"
          }
        ],
        "metadata": {
          "confidence": "high | medium | low",
          "assumptions": "Any assumptions you made"
        }
      }

      Important rules:
      1. Respond ONLY with valid JSON (no surrounding backticks, no extra text).
      2. Keep code in the scripts[].content field as a single string (escape newlines normally).
      3. Prefer Playwright/JavaScript for UI scripts and pytest for Python unit tests unless user requests otherwise.
      4. Limit each script to one test scenario; create multiple scripts if there are multiple cases.
      5. If you cannot produce a field, return an empty string or empty array for that field.
      6. Keep the JSON compact and parseable.
      Requirement:${this.requirementStr}`;

      const body = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a precision-focused MDTE assistant. Always follow the user\'s format and produce valid JSON only. If the requirement is ambiguous, make reasonable assumptions and list them in metadata.assumptions. Default to Playwright JavaScript UI tests and pytest for backend scenarios. Keep output deterministic.',
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
            this.testData = JSON.parse(jsonCleaned);

            console.log('');
            console.log(this.testData);
            console.log('');

            this.loading = false;
          } catch (err) {
            console.error('Failed to parse JSON from response:', err);
          }
        } else {
          this.loading = false;
        }
      });
    }
  }
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { AppComponent } from './app.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { SubmissionPanelComponent } from './components/submission-panel/submission-panel.component';
import { ApiService } from './services/api.service';
import { WebsocketService } from './services/websocket.service';

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    SubmissionPanelComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MonacoEditorModule.forRoot()
  ],
  providers: [ApiService, WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }

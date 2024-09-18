import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignupComponent } from './signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';  // Import MatTabsModule
import { MatGridListModule } from '@angular/material/grid-list';  // Import MatGridListModule
import { EditorModule,TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http'; 

@NgModule({
  declarations: [	
    AppComponent,
    LandingPageComponent,
    SignupComponent,
    LoginComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatGridListModule,  // Add MatGridListModule here
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    EditorModule, // Import TinyMCE EditorModule
    RouterModule.forRoot([]) , // Import RouterModule with empty routes
    MatSnackBarModule


  ],
  providers: [{provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js'},
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { LoginComponent } from './components/login/login.component';
import { UserService } from './services/user/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/*
angularx-social-login components
https://www.npmjs.com/package/angularx-social-login
*/
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider
} from 'angularx-social-login';

/* Project components */
import { StartComponent } from './components/start/start.component';
import { CatalogueComponent } from './components/catalogue/catalogue.component';
import { StoreDetailsComponent } from './components/store-details/store-details.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { ProductComponent } from './components/product/product.component';
import { CartComponent } from './components/cart/cart.component';
import { ClientCourseComponent } from './components/client-course/client-course.component';
import { VendorCourseComponent } from './components/vendor-course/vendor-course.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ManageStoreComponent } from './components/manage-store/manage-store.component';

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    /* Google OAuth Client ID, generated by @epicLevi */
    provider: new GoogleLoginProvider('710777456156-5ahfne9g5nn9ojdpgr4es6e9d70g2l93.apps.googleusercontent.com')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    /* Facebook App ID, generated by @epicLevi */
    provider: new FacebookLoginProvider('3069646419745553')
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    LoginComponent,
    StartComponent,
    CatalogueComponent,
    StoreDetailsComponent,
    SearchResultsComponent,
    ProductComponent,
    CartComponent,
    ClientCourseComponent,
    VendorCourseComponent,
    ProfileComponent,
    ManageStoreComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    SocialLoginModule
  ],
  providers: [
    UserService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

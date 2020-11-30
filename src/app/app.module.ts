import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { EntryComponent } from './entry/entry.component';
import { MissingPageComponent } from './missing-page/missing-page.component';
import { MyFeedComponent } from './my-feed/my-feed.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { NewPostComponent } from './new-post/new-post.component';
import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { FeedPostsComponent } from './feed-posts/feed-posts.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { PlatformHeadersComponent } from './platform-headers/platform-headers.component';
import { HttpClientModule } from '@angular/common/http';
import { SearchComponent } from './search/search.component';
import { TwitterPostComponent } from './twitter-post/twitter-post.component';
import { TwitterAccountComponent } from './twitter-account/twitter-account.component';
import { LoadingComponent } from './loading/loading.component';
import { ErrorComponent } from './error/error.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    EntryComponent,
    MissingPageComponent,
    MyFeedComponent,
    MyAccountComponent,
    NewPostComponent,
    HeaderComponent,
    SideNavComponent,
    FeedPostsComponent,
    AccountProfileComponent,
    PlatformHeadersComponent,
    SearchComponent,
    TwitterPostComponent,
    TwitterAccountComponent,
    LoadingComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

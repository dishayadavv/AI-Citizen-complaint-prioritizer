import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router,
  RouterOutlet,
  RouterLink,
  NavigationEnd
} from '@angular/router';

import {
  filter
} from 'rxjs/operators';

import {
  CityfixChatbotComponent
} from './cityfix-chatbot/cityfix-chatbot';


@Component({
  selector: 'app-root',

  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    CityfixChatbotComponent
  ],

  templateUrl: './app.html',

  styleUrl: './app.css'
})


export class App implements OnInit {

  isHomePage = true;


  constructor(
    private router: Router
  ) {}


  ngOnInit(): void {

    this.updateHomePage(
      this.router.url
    );

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(
        event => {

          const navigation =
            event as NavigationEnd;

          this.updateHomePage(
            navigation.urlAfterRedirects
          );

        }
      );

  }


  private updateHomePage(
    url: string
  ): void {

    this.isHomePage =
      url === '/' ||
      url === '';

  }


  getReportRoute(): string {

    return '/report-issue';

  }

}
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { provideRouter } from '@angular/router';
import { API_URL } from './api/api-url';
import { App } from './app';

describe('App', () => {
  it('pone el router-outlet dentro del <main> del marco', async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App, MatIconTestingModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.prueba/api/v1' },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('main router-outlet')).not.toBeNull();
  });
});

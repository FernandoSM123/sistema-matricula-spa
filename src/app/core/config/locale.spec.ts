import { getLocaleId } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideLocale } from './locale';

describe('provideLocale (§7.1)', () => {
  it('registra es-CR y lo fija como LOCALE_ID', () => {
    TestBed.configureTestingModule({ providers: [provideLocale()] });

    expect(TestBed.inject(LOCALE_ID)).toBe('es-CR');
    expect(getLocaleId('es-CR')).toBe('es-CR');
  });
});

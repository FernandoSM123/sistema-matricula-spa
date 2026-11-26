import { TestBed } from '@angular/core/testing';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { AppDateAdapter, provideAppDateAdapter } from './app-date-adapter';

describe('AppDateAdapter (§7.3)', () => {
  let adapter: DateAdapter<Date>;
  let formats: MatDateFormats;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppDateAdapter()] });
    adapter = TestBed.inject(DateAdapter);
    formats = TestBed.inject(MAT_DATE_FORMATS);
  });

  const readDate = (text: string) => adapter.parse(text, formats.parse.dateInput);
  const readTime = (text: string) => adapter.parseTime(text, formats.parse.timeInput);
  const isValidDate = (date: Date | null) => date !== null && adapter.isValid(date);

  it('es el DateAdapter registrado', () => {
    expect(adapter).toBeInstanceOf(AppDateAdapter);
  });

  describe('fechas (RUI-15)', () => {
    it.each(['05/03/2026', '5/3/2026'])('lee %s como el 5 de marzo de 2026', (text) => {
      const date = readDate(text);
      expect(isValidDate(date)).toBe(true);
      expect([date!.getFullYear(), date!.getMonth(), date!.getDate()]).toEqual([2026, 2, 5]);
    });

    it.each(['31/02/2026', '03/15/2026'])('rechaza %s', (text) => {
      expect(isValidDate(readDate(text))).toBe(false);
    });

    it('muestra dd/mm/aaaa', () => {
      expect(adapter.format(new Date(2026, 2, 5), formats.display.dateInput)).toBe('05/03/2026');
    });

    it('la semana empieza el lunes', () => {
      expect(adapter.getFirstDayOfWeek()).toBe(1);
    });
  });

  describe('horas (RUI-17)', () => {
    it.each([
      ['6:30 p. m.', 18, 30],
      ['18:30', 18, 30],
      ['12:00 a. m.', 0, 0],
    ])('lee %s', (text, hours, minutes) => {
      const time = readTime(text);
      expect(isValidDate(time)).toBe(true);
      expect([time!.getHours(), time!.getMinutes()]).toEqual([hours, minutes]);
    });

    it('escribe 6:30 p. m. en el campo y en las opciones del selector', () => {
      const time = new Date(2026, 2, 5, 18, 30);
      expect(adapter.format(time, formats.display.timeInput)).toBe('6:30 p. m.');
      expect(adapter.format(time, formats.display.timeOptionLabel)).toBe('6:30 p. m.');
    });

    it('vuelve a leer la hora que escribe', () => {
      const written = adapter.format(new Date(2026, 2, 5, 12, 15), formats.display.timeInput);
      const read = readTime(written);
      expect([read!.getHours(), read!.getMinutes()]).toEqual([12, 15]);
    });
  });
});

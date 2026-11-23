import { TestBed } from '@angular/core/testing';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { AdaptadorFechas, provideAdaptadorFechas } from './adaptador-fechas';

describe('AdaptadorFechas (§7.3)', () => {
  let adaptador: DateAdapter<Date>;
  let formatos: MatDateFormats;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAdaptadorFechas()] });
    adaptador = TestBed.inject(DateAdapter);
    formatos = TestBed.inject(MAT_DATE_FORMATS);
  });

  const leerFecha = (texto: string) => adaptador.parse(texto, formatos.parse.dateInput);
  const leerHora = (texto: string) => adaptador.parseTime(texto, formatos.parse.timeInput);
  const valida = (fecha: Date | null) => fecha !== null && adaptador.isValid(fecha);

  it('es el DateAdapter registrado', () => {
    expect(adaptador).toBeInstanceOf(AdaptadorFechas);
  });

  describe('fechas (RUI-15)', () => {
    it.each(['05/03/2026', '5/3/2026'])('lee %s como el 5 de marzo de 2026', (texto) => {
      const fecha = leerFecha(texto);
      expect(valida(fecha)).toBe(true);
      expect([fecha!.getFullYear(), fecha!.getMonth(), fecha!.getDate()]).toEqual([2026, 2, 5]);
    });

    it.each(['31/02/2026', '03/15/2026'])('rechaza %s', (texto) => {
      expect(valida(leerFecha(texto))).toBe(false);
    });

    it('muestra dd/mm/aaaa', () => {
      expect(adaptador.format(new Date(2026, 2, 5), formatos.display.dateInput)).toBe('05/03/2026');
    });

    it('la semana empieza el lunes', () => {
      expect(adaptador.getFirstDayOfWeek()).toBe(1);
    });
  });

  describe('horas (RUI-17)', () => {
    it.each([
      ['6:30 p. m.', 18, 30],
      ['18:30', 18, 30],
      ['12:00 a. m.', 0, 0],
    ])('lee %s', (texto, horas, minutos) => {
      const hora = leerHora(texto);
      expect(valida(hora)).toBe(true);
      expect([hora!.getHours(), hora!.getMinutes()]).toEqual([horas, minutos]);
    });

    it('escribe 6:30 p. m. en el campo y en las opciones del selector', () => {
      const hora = new Date(2026, 2, 5, 18, 30);
      expect(adaptador.format(hora, formatos.display.timeInput)).toBe('6:30 p. m.');
      expect(adaptador.format(hora, formatos.display.timeOptionLabel)).toBe('6:30 p. m.');
    });

    it('vuelve a leer la hora que escribe', () => {
      const escrita = adaptador.format(new Date(2026, 2, 5, 12, 15), formatos.display.timeInput);
      const leida = leerHora(escrita);
      expect([leida!.getHours(), leida!.getMinutes()]).toEqual([12, 15]);
    });
  });
});

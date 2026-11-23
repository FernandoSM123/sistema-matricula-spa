import { TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { provideMaterial } from './material';

describe('provideMaterial (§6.1)', () => {
  it('los avisos temporales duran 5 segundos', () => {
    TestBed.configureTestingModule({ providers: [provideMaterial()] });

    expect(TestBed.inject(MAT_SNACK_BAR_DEFAULT_OPTIONS).duration).toBe(5000);
  });
});

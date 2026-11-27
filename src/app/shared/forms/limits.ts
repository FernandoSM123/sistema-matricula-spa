// Límites de los formularios (RUI-06, docs/arquitectura.md §5.2), tomados de los validadores del
// backend (`../sistema-matricula-api/src/Matricula.Application`). Si la API cambia uno, se cambia aquí.

export const LIMITS = {
  /** `Common/Validation/DatosPersonalesRules.cs`. */
  persona: {
    cedula: 20,
    /** Nombre y apellidos. */
    nombre: 100,
    especialidad: 100,
    correo: 256,
    direccion: 250,
    telefonoMin: 8,
    telefonoMax: 20,
    /** Fecha de nacimiento y de contratación (`FechaMinima`). */
    fechaMinima: '1900-01-01',
  },
  /** `Auth/NewPasswordRules.cs` y `Domain/Rules/PasswordPolicy.cs` (RN-26). */
  password: { min: 8, max: 128 },
  /** `Cursos/CursoRules.cs`. */
  curso: { codigo: 20, nombre: 150, descripcion: 1000 },
  /** `Aulas/AulaRules.cs`. */
  aula: { codigo: 20, ubicacion: 150 },
  /** `Periodos/PeriodoDataValidator.cs`. */
  periodo: { nombre: 50 },
  /** `Grupos/GrupoDataValidator.cs`. */
  grupo: { nrc: 10 },
} as const;

/** Cédula: letras, dígitos y guiones (`DatosPersonalesRules.Cedula`). */
export const CEDULA_PATTERN = /^[A-Za-z0-9-]+$/;

/** Teléfono: de 8 a 20 dígitos, espacios, `+` y `-` (`DatosPersonalesRules.Telefono`). */
export const TELEFONO_PATTERN = new RegExp(`^[0-9 +-]{${LIMITS.persona.telefonoMin},${LIMITS.persona.telefonoMax}}$`);

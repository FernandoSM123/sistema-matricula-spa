/*
 * Wireframes del SPA — interacciones mínimas (supuesto 3 de la fase 0).
 * Sin dependencias. Se configura con atributos data-wf-* en <body>:
 *
 *   data-wf-id       Id de la vista, por ejemplo "V-14".
 *   data-wf-nombre   Nombre de la vista.
 *   data-wf-raiz     Ruta relativa a docs/wireframes/ desde la página ("../" o "").
 *   data-wf-marco    visitante | estudiante | profesor | administrador | minimo | ninguno | rol
 *                    ("rol" sigue lo elegido en "Ver como").
 *   data-wf-menu     Id de la opción del menú que se marca como activa (por defecto, data-wf-id).
 *   data-wf-estados  Estados de la vista: "datos:Con datos|cargando:Cargando|vacio:Vacío".
 *   data-wf-roles    Roles de "Ver como": "administrador:Administrador|profesor:Profesor".
 *
 * En el contenido:
 *   data-wf-estado="datos vacio"   Visible solo en esos estados.
 *   data-wf-rol="administrador"    Visible solo con esos roles.
 *   data-wf-abrir="id-dialogo"     Abre un <dialog>. Dentro, data-wf-cerrar lo cierra.
 *   .wf-pestanas                   Pestañas con role="tab" / role="tabpanel".
 *
 * El estado y el rol se guardan en el fragmento de la dirección (#estado=vacio&rol=profesor),
 * así el índice y otras vistas pueden enlazar a un estado concreto.
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
   * Menú por rol (§2.3 de docs/requerimientos.md). Rutas relativas a docs/wireframes/.
   * verificar-enlaces.sh revisa estas rutas: cada una va entre comillas simples tras la clave "ruta".
   * ------------------------------------------------------------------- */
  var V = {
    oferta:        { id: 'V-01', texto: 'Oferta académica',   ruta: 'publico/V-01-oferta.html' },
    login:         { id: 'V-02', texto: 'Iniciar sesión',     ruta: 'publico/V-02-inicio-sesion.html' },
    registro:      { id: 'V-05', texto: 'Registrarse',        ruta: 'publico/V-05-registro.html' },
    perfil:        { id: 'V-06', texto: 'Mi perfil',          ruta: 'cuenta/V-06-mi-perfil.html' },
    contrasena:    { id: 'V-07', texto: 'Cambiar contraseña', ruta: 'cuenta/V-07-cambiar-contrasena.html' },
    admins:        { id: 'V-11', texto: 'Administradores',    ruta: 'admin/V-11-administradores.html' },
    estudiantes:   { id: 'V-14', texto: 'Estudiantes',        ruta: 'admin/V-14-estudiantes.html' },
    profesores:    { id: 'V-17', texto: 'Profesores',         ruta: 'admin/V-17-profesores.html' },
    cursos:        { id: 'V-20', texto: 'Cursos',             ruta: 'compartidas/V-20-cursos.html' },
    periodos:      { id: 'V-23', texto: 'Periodos',           ruta: 'admin/V-23-periodos.html' },
    aulas:         { id: 'V-25', texto: 'Aulas',              ruta: 'compartidas/V-25-aulas.html' },
    grupos:        { id: 'V-28', texto: 'Grupos',             ruta: 'admin/V-28-grupos.html' },
    misMatriculas: { id: 'V-31', texto: 'Mis matrículas',     ruta: 'estudiante/V-31-mis-matriculas.html' },
    miHorario:     { id: 'V-34', texto: 'Mi horario',         ruta: 'compartidas/V-34-mi-horario.html' },
    misGrupos:     { id: 'V-35', texto: 'Mis grupos',         ruta: 'profesor/V-35-mis-grupos.html' },
    auditoria:     { id: 'V-36', texto: 'Auditoría',          ruta: 'admin/V-36-auditoria.html' },
    errores:       { id: 'V-37', texto: 'Errores',            ruta: 'admin/V-37-errores.html' }
  };

  var MENUS = {
    visitante: [{ items: [V.oferta, V.login, V.registro] }],
    estudiante: [{ items: [V.misMatriculas, V.miHorario, V.oferta, V.cursos] }],
    profesor: [{ items: [V.misGrupos, V.miHorario, V.oferta, V.cursos, V.aulas] }],
    administrador: [
      { grupo: 'Académico', items: [V.grupos, V.cursos, V.periodos, V.aulas, V.oferta] },
      { grupo: 'Personas', items: [V.estudiantes, V.profesores, V.admins] },
      { grupo: 'Sistema', items: [V.auditoria, V.errores] }
    ]
  };

  // Página de inicio por rol (§2.2).
  var INICIO = {
    visitante: V.oferta,
    estudiante: V.misMatriculas,
    profesor: V.misGrupos,
    administrador: V.grupos
  };

  // Persona con sesión en cada marco (datos de ejemplo de index.html).
  var USUARIOS = {
    estudiante: { nombre: 'María Fernanda Quesada Rojas', rol: 'Estudiante' },
    profesor: { nombre: 'Laura Jiménez Mora', rol: 'Profesor' },
    administrador: { nombre: 'Sofía Méndez Arias', rol: 'Administrador' }
  };

  var NOMBRE_SISTEMA = 'Sistema de Matrícula';
  // Pie de página (RUI-23). El nombre del instituto queda entre corchetes hasta definirlo;
  // en la aplicación real, la versión sale del build.
  var PIE_INSTITUTO = '[Nombre del instituto]';
  var PIE_ANIO = '2026';
  var PIE_VERSION = '0.1.0';

  // Cerrar sesión (RFF-04) abre la oferta con el aviso de sesión cerrada.
  var CERRAR_SESION = '#estado=sesion-cerrada&rol=visitante';

  /* ------------------------------------------------------------------- */
  var body = document.body;
  var cfg = body.dataset;
  var raiz = cfg.wfRaiz || '';
  var estados = leerLista(cfg.wfEstados);
  var roles = leerLista(cfg.wfRoles);
  var actual = { estado: null, rol: null };

  function leerLista(texto) {
    if (!texto) return [];
    return texto.split('|').map(function (par) {
      var i = par.indexOf(':');
      return i < 0 ? { clave: par.trim(), etiqueta: par.trim() }
                   : { clave: par.slice(0, i).trim(), etiqueta: par.slice(i + 1).trim() };
    });
  }

  function contiene(lista, clave) {
    return lista.some(function (x) { return x.clave === clave; });
  }

  function leerFragmento() {
    var datos = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (par) {
      var i = par.indexOf('=');
      if (i > 0) datos[decodeURIComponent(par.slice(0, i))] = decodeURIComponent(par.slice(i + 1));
    });
    return datos;
  }

  function escribirFragmento() {
    var partes = [];
    if (estados.length) partes.push('estado=' + encodeURIComponent(actual.estado));
    if (roles.length) partes.push('rol=' + encodeURIComponent(actual.rol));
    if (partes.length && history.replaceState) {
      history.replaceState(null, '', '#' + partes.join('&'));
    }
  }

  function rolDelMarco() {
    return cfg.wfMarco === 'rol' ? actual.rol : cfg.wfMarco;
  }

  /* Estado y rol --------------------------------------------------------- */
  function aplicarVisibilidad() {
    var rol = actual.rol || rolDelMarco();
    document.querySelectorAll('[data-wf-estado], [data-wf-rol]').forEach(function (el) {
      var okEstado = !el.dataset.wfEstado || !actual.estado ||
        el.dataset.wfEstado.split(/\s+/).indexOf(actual.estado) >= 0;
      var okRol = !el.dataset.wfRol || !rol ||
        el.dataset.wfRol.split(/\s+/).indexOf(rol) >= 0;
      el.hidden = !(okEstado && okRol);
    });
  }

  /* Después de cambiar estado o rol:
   *   dialog[data-wf-abierta]   Vista que se muestra como ventana (V-32, V-33): se abre sola si es visible.
   *   [role=tab][data-wf-pestana-inicial="estado ..."]   Pestaña que se elige en esos estados. */
  function ajustarVentanasYPestanas() {
    document.querySelectorAll('dialog[data-wf-abierta]').forEach(function (d) {
      // No modal: la barra del wireframe sigue usable. El fondo oscuro lo pone el CSS.
      if (!d.hidden && !d.open) d.show();
      if (d.hidden && d.open) d.close();
    });
    document.querySelectorAll('[role="tab"][data-wf-pestana-inicial]').forEach(function (t) {
      if (t.dataset.wfPestanaInicial.split(/\s+/).indexOf(actual.estado) >= 0) t.click();
    });
  }
  function refrescar() { aplicarVisibilidad(); ajustarVentanasYPestanas(); }

  /* Barra del wireframe -------------------------------------------------- */
  function crearSelect(etiqueta, lista, valor, nombre, alCambiar) {
    var label = document.createElement('label');
    label.className = 'wf-barra-control';
    label.appendChild(document.createTextNode(etiqueta));
    var select = document.createElement('select');
    select.name = 'wf-' + nombre;
    lista.forEach(function (op) {
      var o = document.createElement('option');
      o.value = op.clave;
      o.textContent = op.etiqueta;
      if (op.clave === valor) o.selected = true;
      select.appendChild(o);
    });
    select.addEventListener('change', function () { alCambiar(select.value); });
    label.appendChild(select);
    return label;
  }

  function crearBarra() {
    var barra = document.createElement('div');
    barra.className = 'wf-barra';
    barra.setAttribute('role', 'region');
    barra.setAttribute('aria-label', 'Controles del wireframe');

    var marca = document.createElement('span');
    marca.className = 'wf-barra-marca';
    marca.textContent = 'Wireframe';
    barra.appendChild(marca);

    var indice = document.createElement('a');
    indice.href = raiz + 'index.html';
    indice.textContent = '← Índice';
    barra.appendChild(indice);

    var vista = document.createElement('span');
    vista.className = 'wf-barra-vista';
    vista.textContent = [cfg.wfId, cfg.wfNombre].filter(Boolean).join(' · ');
    barra.appendChild(vista);

    if (estados.length) {
      barra.appendChild(crearSelect('Estado', estados, actual.estado, 'estado', function (v) {
        actual.estado = v; escribirFragmento(); refrescar();
      }));
    }
    if (roles.length) {
      barra.appendChild(crearSelect('Ver como', roles, actual.rol, 'rol', function (v) {
        actual.rol = v; escribirFragmento(); construirMarco(); refrescar();
      }));
    }

    var notas = document.querySelectorAll('details.wf-notas');
    if (notas.length) {
      var boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = 'Notas';
      var sincronizar = function () {
        var abiertas = Array.prototype.some.call(notas, function (d) { return d.open; });
        boton.setAttribute('aria-pressed', abiertas ? 'true' : 'false');
      };
      boton.addEventListener('click', function () {
        var abrir = boton.getAttribute('aria-pressed') !== 'true';
        notas.forEach(function (d) { d.open = abrir; });
        sincronizar();
        if (abrir) notas[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      notas.forEach(function (d) { d.addEventListener('toggle', sincronizar); });
      sincronizar();
      barra.appendChild(boton);
    }

    body.insertBefore(barra, body.firstChild);
  }

  /* Marco de la aplicación ---------------------------------------------- */
  var encabezado, contenedor, menu;

  function enlace(item, extra) {
    var activo = item.id === (cfg.wfMenu || cfg.wfId);
    return '<a href="' + raiz + item.ruta + '"' + (activo ? ' aria-current="page"' : '') +
      (extra || '') + '>' + item.texto + '</a>';
  }

  function htmlMenuLateral(rol) {
    return MENUS[rol].map(function (g) {
      return (g.grupo ? '<p class="wf-menu-grupo">' + g.grupo + '</p>' : '') +
        '<ul>' + g.items.map(function (it) { return '<li>' + enlace(it) + '</li>'; }).join('') + '</ul>';
    }).join('');
  }

  function htmlCuenta(rol) {
    var u = USUARIOS[rol];
    return '<details class="wf-cuenta">' +
      '<summary><span class="wf-cuenta-nombre">' + u.nombre + '</span> ' +
      '<span class="wf-cuenta-rol">' + u.rol + '</span></summary>' +
      '<ul class="wf-cuenta-menu">' +
      '<li>' + enlace(V.perfil) + '</li>' +
      '<li>' + enlace(V.contrasena) + '</li>' +
      '<li class="wf-separado"><a href="' + raiz + V.oferta.ruta + CERRAR_SESION + '">Cerrar sesión</a></li>' +
      '</ul></details>';
  }

  function construirMarco() {
    var rol = rolDelMarco();
    if (!rol || rol === 'ninguno') return;

    var botonMenu = '<button type="button" class="wf-boton wf-boton-pequeno wf-boton-menu" ' +
      'aria-expanded="false" aria-controls="wf-menu">☰ Menú</button>';
    var inicio = INICIO[rol];
    var nombre = inicio
      ? '<a class="wf-app-nombre" href="' + raiz + inicio.ruta + '">' + NOMBRE_SISTEMA + '</a>'
      : '<span class="wf-app-nombre">' + NOMBRE_SISTEMA + '</span>';

    if (rol === 'minimo') {
      // Cambio obligatorio de contraseña (V-03): sin menú, solo cerrar sesión (RN-24).
      encabezado.innerHTML = nombre +
        '<a class="wf-boton wf-boton-pequeno" href="' + raiz + V.oferta.ruta + CERRAR_SESION + '">Cerrar sesión</a>';
      menu.hidden = true;
      contenedor.classList.add('wf-sin-menu');
    } else if (rol === 'visitante') {
      encabezado.innerHTML = botonMenu + nombre +
        '<nav id="wf-menu" class="wf-menu-visitante" aria-label="Menú principal">' +
        MENUS.visitante[0].items.map(function (it) { return enlace(it); }).join('') + '</nav>';
      menu.hidden = true;
      contenedor.classList.add('wf-sin-menu');
    } else {
      encabezado.innerHTML = botonMenu + nombre + htmlCuenta(rol);
      menu.innerHTML = htmlMenuLateral(rol);
      menu.hidden = false;
      contenedor.classList.remove('wf-sin-menu');
    }

    var b = encabezado.querySelector('.wf-boton-menu');
    if (b) {
      b.addEventListener('click', function () {
        var objetivo = document.getElementById('wf-menu');
        var abierto = objetivo.classList.toggle('wf-abierto');
        b.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      });
    }
  }

  function prepararMarco() {
    if (!cfg.wfMarco || cfg.wfMarco === 'ninguno') return;
    encabezado = document.createElement('header');
    encabezado.className = 'wf-app-encabezado';

    contenedor = document.createElement('div');
    contenedor.className = 'wf-app';

    menu = document.createElement('nav');
    menu.className = 'wf-menu';
    menu.id = 'wf-menu';
    menu.setAttribute('aria-label', 'Menú principal');

    var principal = document.createElement('div');
    principal.className = 'wf-contenido';

    // Todo lo que no es script ni dialog pasa al área de contenido.
    Array.prototype.slice.call(body.children).forEach(function (el) {
      if (el.tagName !== 'SCRIPT' && el.tagName !== 'DIALOG') principal.appendChild(el);
    });

    contenedor.appendChild(menu);
    contenedor.appendChild(principal);
    body.insertBefore(contenedor, body.firstChild);
    body.insertBefore(encabezado, contenedor);

    var pie = document.createElement('footer');
    pie.className = 'wf-app-pie';
    pie.innerHTML = '<span>' + NOMBRE_SISTEMA + ' · ' + PIE_INSTITUTO + ' · © ' + PIE_ANIO + '</span>' +
      '<span>Versión ' + PIE_VERSION + '</span>';
    contenedor.parentNode.insertBefore(pie, contenedor.nextSibling);
    body.classList.add('wf-con-marco');
    construirMarco();
  }

  // Cierra el menú de la cuenta al hacer clic fuera o con Escape.
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.wf-cuenta[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.open = false;
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('details.wf-cuenta[open]').forEach(function (d) {
      d.open = false;
      d.querySelector('summary').focus();
    });
  });

  /* Ventanas ------------------------------------------------------------- */
  function prepararVentanas() {
    document.addEventListener('click', function (e) {
      var abrir = e.target.closest('[data-wf-abrir]');
      if (abrir) {
        var dialogo = document.getElementById(abrir.dataset.wfAbrir);
        if (dialogo && typeof dialogo.showModal === 'function') {
          e.preventDefault();
          // Si se abre desde otra ventana, esa se cierra y el foco vuelve a quien abrió la primera.
          var anterior = abrir.closest('dialog');
          if (anterior) { dialogo._wfOrigen = anterior._wfOrigen; anterior._wfOrigen = null; anterior.close(); }
          else dialogo._wfOrigen = abrir;
          dialogo.showModal();
        }
        return;
      }
      var cerrar = e.target.closest('[data-wf-cerrar]');
      if (cerrar) {
        var d = cerrar.closest('dialog');
        if (d) { e.preventDefault(); d.close(); }
      }
    });
    // Devuelve el foco a quien abrió la ventana (§6, accesibilidad).
    document.querySelectorAll('dialog').forEach(function (d) {
      d.addEventListener('close', function () {
        if (d._wfOrigen && document.contains(d._wfOrigen)) d._wfOrigen.focus();
      });
    });
  }

  /* Pestañas ------------------------------------------------------------- */
  function prepararPestanas() {
    document.querySelectorAll('.wf-pestanas').forEach(function (grupo) {
      var tabs = Array.prototype.slice.call(grupo.querySelectorAll('[role="tab"]'));
      function seleccionar(tab, enfocar) {
        tabs.forEach(function (t) {
          var sel = t === tab;
          t.setAttribute('aria-selected', sel ? 'true' : 'false');
          t.tabIndex = sel ? 0 : -1;
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !sel;
        });
        if (enfocar) tab.focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { seleccionar(t); });
        t.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight') seleccionar(tabs[(i + 1) % tabs.length], true);
          if (e.key === 'ArrowLeft') seleccionar(tabs[(i - 1 + tabs.length) % tabs.length], true);
        });
      });
      var inicial = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      if (inicial) seleccionar(inicial);
    });
  }

  /* Componentes ----------------------------------------------------------
   *   data-wf-mostrar="id-input"   Alterna mostrar u ocultar una contraseña (§6).
   *   data-wf-pestana="id"         Selecciona una pestaña, o lleva a una sección, y cierra la ventana en la que está.
   *   data-wf-toast="texto"        Muestra un mensaje de éxito unos segundos (RUI-21).
   *   data-wf-copiar               Simula copiar el código de error (RUI-03).
   *   data-wf-enviando="texto"     Simula un envío en curso durante 2 s (RUI-08).
   * ------------------------------------------------------------------- */
  function prepararComponentes() {
    document.addEventListener('click', function (e) {
      var b;
      // Los enlaces a otra página del wireframe sin fragmento conservan el rol actual,
      // para que las vistas compartidas se abran con el mismo "Ver como".
      var enlaceInterno = e.target.closest('a[href$=".html"]');
      var rolActual = actual.rol || rolDelMarco();
      if (enlaceInterno && !/^[a-z]+:/i.test(enlaceInterno.getAttribute('href')) &&
          rolActual && rolActual !== 'ninguno' && rolActual !== 'minimo') {
        enlaceInterno.href = enlaceInterno.getAttribute('href') + '#rol=' + rolActual;
        return;
      }
      if ((b = e.target.closest('[data-wf-pestana]'))) {
        // Lleva a una pestaña o sección de la vista (por ejemplo, desde un rechazo RN-36 a "Matrículas").
        e.preventDefault();
        var dlg = b.closest('dialog');
        if (dlg) { dlg._wfOrigen = null; dlg.close(); }
        var tab = document.getElementById(b.dataset.wfPestana);
        if (tab) {
          if (tab.getAttribute('role') === 'tab') tab.click();
          else if (!tab.hasAttribute('tabindex')) tab.setAttribute('tabindex', '-1');
          tab.focus();
          tab.scrollIntoView({ block: 'start' });
        }
      } else if ((b = e.target.closest('[data-wf-mostrar]'))) {
        var input = document.getElementById(b.dataset.wfMostrar);
        if (!input) return;
        var mostrar = input.type === 'password';
        input.type = mostrar ? 'text' : 'password';
        b.textContent = mostrar ? 'Ocultar' : 'Mostrar';
        b.setAttribute('aria-pressed', mostrar ? 'true' : 'false');
      } else if ((b = e.target.closest('[data-wf-toast]'))) {
        e.preventDefault();
        var toast = document.createElement('div');
        toast.className = 'wf-toast';
        toast.setAttribute('role', 'status');
        toast.textContent = b.dataset.wfToast;
        body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 4000);
      } else if ((b = e.target.closest('[data-wf-copiar]'))) {
        var original = b.textContent;
        b.textContent = 'Copiado';
        setTimeout(function () { b.textContent = original; }, 2000);
      } else if ((b = e.target.closest('[data-wf-enviando]'))) {
        e.preventDefault();
        var texto = b.textContent;
        b.disabled = true;
        b.classList.add('wf-girando');
        b.textContent = b.dataset.wfEnviando;
        setTimeout(function () {
          b.disabled = false;
          b.classList.remove('wf-girando');
          b.textContent = texto;
        }, 2000);
      }
    });
  }

  /* Inicio --------------------------------------------------------------- */
  function iniciar() {
    var frag = leerFragmento();
    if (estados.length) actual.estado = contiene(estados, frag.estado) ? frag.estado : estados[0].clave;
    if (roles.length) actual.rol = contiene(roles, frag.rol) ? frag.rol : roles[0].clave;

    prepararMarco();
    if (cfg.wfId || estados.length || roles.length) crearBarra();
    aplicarVisibilidad();
    prepararVentanas();
    prepararPestanas();
    prepararComponentes();
    ajustarVentanasYPestanas();

    // Un enlace a la misma página con otro fragmento (#estado=…) cambia el estado sin recargar.
    window.addEventListener('hashchange', function () {
      var f = leerFragmento();
      var rolAntes = actual.rol;
      var estadoAntes = actual.estado;
      if (estados.length && contiene(estados, f.estado)) actual.estado = f.estado;
      if (roles.length && contiene(roles, f.rol)) actual.rol = f.rol;
      if (actual.rol === rolAntes && actual.estado === estadoAntes) return; // ancla común
      var sEstado = document.querySelector('.wf-barra select[name="wf-estado"]');
      var sRol = document.querySelector('.wf-barra select[name="wf-rol"]');
      if (sEstado) sEstado.value = actual.estado;
      if (sRol) sRol.value = actual.rol;
      if (actual.rol !== rolAntes) construirMarco();
      // Una acción confirmada en una ventana cambia el estado: la ventana se cierra.
      document.querySelectorAll('dialog[open]').forEach(function (d) { d._wfOrigen = null; d.close(); });
      refrescar();
      window.scrollTo(0, 0);
    });
  }

  iniciar();
})();

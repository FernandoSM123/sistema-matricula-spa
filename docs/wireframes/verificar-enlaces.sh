#!/usr/bin/env bash
# Verifica los enlaces internos de los wireframes.
#
# Revisa los href y src de cada .html, y las rutas del menú de js/wireframe.js
# (líneas con  ruta: '...', relativas a docs/wireframes/).
#
# Clasifica los destinos que no existen en:
#   - Vistas pendientes: páginas V-xx de una tarea posterior (permitidas hasta T8).
#   - Rotos: cualquier otro destino inexistente (siempre es un error).
#
# Uso:
#   bash docs/wireframes/verificar-enlaces.sh             # falla solo si hay rotos
#   bash docs/wireframes/verificar-enlaces.sh --estricto  # falla también con vistas pendientes (T8)

set -u
raiz="$(cd "$(dirname "$0")" && pwd)"
estricto=0
[ "${1:-}" = "--estricto" ] && estricto=1

pendientes="$(mktemp)"
rotos="$(mktemp)"
trap 'rm -f "$pendientes" "$rotos"' EXIT

revisar() { # $1 archivo de origen (relativo a la raíz), $2 directorio base, $3 destino
  local destino="${3%%#*}"
  destino="${destino%%\?*}"
  case "$3" in
    ''|'#'*|http:*|https:*|mailto:*|tel:*|javascript:*|data:*) return ;;
  esac
  [ -z "$destino" ] && return
  if [ ! -e "$2/$destino" ]; then
    if [[ "$(basename "$destino")" =~ ^V-[0-9]{2}-.*\.html$ ]]; then
      printf '%s\t%s\n' "$destino" "$1" >> "$pendientes"
    else
      printf '%s\t%s\n' "$destino" "$1" >> "$rotos"
    fi
  fi
}

# Enlaces de las páginas HTML.
while IFS= read -r archivo; do
  rel="${archivo#"$raiz"/}"
  dir="$(dirname "$archivo")"
  while IFS= read -r atributo; do
    valor="${atributo#*=\"}"
    valor="${valor%\"}"
    revisar "$rel" "$dir" "$valor"
  done < <(grep -oE '(href|src)="[^"]*"' "$archivo")
done < <(find "$raiz" -name '*.html' -type f | sort)

# Rutas del menú en el JS (relativas a la raíz de los wireframes).
while IFS= read -r linea; do
  valor="${linea#*\'}"
  valor="${valor%\'}"
  revisar "js/wireframe.js" "$raiz" "$valor"
done < <(grep -oE "ruta: '[^']*'" "$raiz/js/wireframe.js")

n_pend=$(cut -f1 "$pendientes" | sed 's#^\(\.\./\)*##' | sort -u | grep -c . || true)
n_rotos=$(grep -c . "$rotos" || true)

if [ "$n_pend" -gt 0 ]; then
  echo "Vistas pendientes enlazadas ($n_pend), de tareas posteriores:"
  cut -f1 "$pendientes" | sed 's#^\(\.\./\)*##' | sort -u | sed 's/^/  /'
fi
if [ "$n_rotos" -gt 0 ]; then
  echo "Enlaces rotos ($n_rotos):"
  sort -u "$rotos" | awk -F'\t' '{ printf "  %s  (en %s)\n", $1, $2 }'
fi
if [ "$n_pend" -eq 0 ] && [ "$n_rotos" -eq 0 ]; then
  echo "Sin enlaces rotos ni vistas pendientes."
fi

if [ "$n_rotos" -gt 0 ] || { [ "$estricto" -eq 1 ] && [ "$n_pend" -gt 0 ]; }; then
  exit 1
fi
exit 0

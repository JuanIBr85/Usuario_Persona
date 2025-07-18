/**
 * Formatea el tiempo transcurrido desde una fecha dada hasta ahora
 * @param {string} fechaStr - Fecha en formato string
 * @returns {string} Tiempo transcurrido formateado (ej: "2 días", "1 mes")
 */
export function tiempoTranscurrido(fechaStr) {
  if (!fechaStr) return{
    lastUpdate: undefined,
    dias: undefined,
  };
  const ahora = new Date();
  const fecha = new Date(`${fechaStr}Z`);
  const segundos = Math.floor((ahora - fecha) / 1000);
  const dias = Math.floor(segundos / 86400);
  const intervalos = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
    segundo: 59
  };

  for (const [intervalo, segundosEnIntervalo] of Object.entries(intervalos)) {
    const cantidad = Math.floor(segundos / segundosEnIntervalo);

    if (cantidad >= 1) {
      const intervaloPlural = cantidad !== 1 ?
        (intervalo === 'mes' ? 'meses' :
          intervalo === 'día' ? 'días' :
            intervalo + 's') :
        intervalo;

      return {
        lastUpdate: `hace ${cantidad} ${intervaloPlural}`,
        dias: dias,
      };
    }
  }

  return {
    lastUpdate: 'hace unos segundos',
    dias: dias,
  };
}

export function traducirRateLimitMessage(msg) {
  return msg.replace(/(\d+)\sper\s(\d+)\s(\w+)/, (match, veces, unidad, periodo) => {
    let periodoTraducido = periodo.toLowerCase();

    if (periodoTraducido === "minute") periodoTraducido = "minuto";
    else if (periodoTraducido === "hour") periodoTraducido = "hora";
    else if (periodoTraducido === "second") periodoTraducido = "segundo";
    else periodoTraducido = periodo;

    const vecesTxt = veces === "1" ? "vez" : "veces";
    return `${veces} ${vecesTxt} por ${periodoTraducido}`;
  });
}

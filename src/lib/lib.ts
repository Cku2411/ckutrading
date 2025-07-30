export function getPrecision(tickSize: string) {
  const dec = tickSize.split(".")[1] || "";
  const idx = dec.indexOf("1");
  return idx >= 0 ? idx + 1 : 0;
}

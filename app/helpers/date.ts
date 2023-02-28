function pad(num: Number) {
  return (num < 10 ? "0" : "") + num;
}

export function localZonedISOString(date: Date) {
  const tzo = -date.getTimezoneOffset();
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    (tzo >= 0 ? "+" : "-") +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ":" +
    pad(Math.abs(tzo) % 60)
  );
}

export function dateWithCustomISOString(isoString: string): Date {
  const date = new Date(isoString);
  date.toISOString = () => isoString; // assign our own function instead lol
  return date;
}

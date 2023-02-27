function pad(num: Number) {
  return (num < 10 ? "0" : "") + num;
}

const toZonedISOString = function (this: Date) {
  const tzo = -this.getTimezoneOffset();
  return (
    this.getFullYear() +
    "-" +
    pad(this.getMonth() + 1) +
    "-" +
    pad(this.getDate()) +
    "T" +
    pad(this.getHours()) +
    ":" +
    pad(this.getMinutes()) +
    ":" +
    pad(this.getSeconds()) +
    (tzo >= 0 ? "+" : "-") +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ":" +
    pad(Math.abs(tzo) % 60)
  );
};

export function wrapForZonedISOString(date: Date): Date {
  date.toISOString = toZonedISOString;
  return date;
}

export function zonedISOString(date: Date) {
  return toZonedISOString.call(date);
}

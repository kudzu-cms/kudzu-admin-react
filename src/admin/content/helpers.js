const timestampFormatter = Intl.DateTimeFormat("default", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZoneName: "short"
});

export {
  timestampFormatter,
}

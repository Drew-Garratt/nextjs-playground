export function stringToSeedNumber(str: string) {
  return Number(
    str.replace(/./g, function (c) {
      return ("00" + c.charCodeAt(0)).slice(-3);
    }),
  );
}

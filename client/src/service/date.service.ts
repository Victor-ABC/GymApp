/* Autor: Victor Corbet */

function zeroPrefix(num: number) {
  return num < 10 ? '0' + num : num;
}

export default function buildDate(createdAt: number) {
  const date = new Date(createdAt);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  return (
    zeroPrefix(hours) +
    ':' +
    zeroPrefix(minutes) +
    ' (' +
    zeroPrefix(day) +
    '.' +
    zeroPrefix(month) +
    '.' +
    zeroPrefix(year) +
    ')'
  );
}

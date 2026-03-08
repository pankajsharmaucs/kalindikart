// utils/converter.js
export function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' }); // March
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // convert to 12-hour format

  return `${day}-${month} ${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
}
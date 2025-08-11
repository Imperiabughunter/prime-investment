
export function randomId(prefix: string = 'id') {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-6);
  return `${prefix}_${time}_${rand}`;
}

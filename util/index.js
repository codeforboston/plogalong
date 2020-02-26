export function formatDuration(ms) {
  const s = Math.round(ms/1000);
  if (s < 60)
    return `${s} seconds`;

  let m = Math.floor(s/60);
  if (m < 60)
    return `${m} minute${m === 1 ? '' : 's'}`;

  let h = Math.floor(m/60);
  return `${h} hour${h === 1 ? '' : 's'}`;
}


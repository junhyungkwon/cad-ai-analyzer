/** 데모용 CAD 폴리라인 (도면 좌표 단위: mm) */
export const DEMO_POLYLINE = [
  { id: 'P1', x: 1200, y: 3400, label: '시점' },
  { id: 'P2', x: 2800, y: 3400, label: '분기A' },
  { id: 'P3', x: 2800, y: 2100, label: '엘보1' },
  { id: 'P4', x: 4500, y: 2100, label: '분기B' },
  { id: 'P5', x: 4500, y: 900, label: '엘보2' },
  { id: 'P6', x: 6200, y: 900, label: '종점' },
];

export const DEMO_EXCEL_ROWS = [
  { no: 1, name: '주배관 A', spec: 'Ø150 SCH40', material: 'STS304', qty: 1 },
  { no: 2, name: '엘보 90°', spec: 'Ø150', material: 'STS304', qty: 2 },
  { no: 3, name: '플랜지', spec: 'Ø150 10K', material: 'STS304', qty: 4 },
  { no: 4, name: '밸브', spec: '게이트 Ø150', material: 'SCS13', qty: 1 },
];

function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function buildSegments(points) {
  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    segments.push({
      id: `S${i + 1}`,
      from: from.id,
      to: to.id,
      fromLabel: from.label,
      toLabel: to.label,
      length: Math.round(dist(from, to)),
      dx: to.x - from.x,
      dy: to.y - from.y,
    });
  }
  return segments;
}

export function totalLength(segments) {
  return segments.reduce((sum, s) => sum + s.length, 0);
}

export async function analyzeWithAi({ points, segments, totalLength, excelRows, selectedSegmentId }) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      points,
      segments,
      totalLength,
      excelRows,
      selectedSegmentId,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `분석 요청 실패 (${res.status})`);
  }

  return data;
}

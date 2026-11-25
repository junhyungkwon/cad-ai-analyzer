const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.API_PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.OPENAI_API_KEY),
  });
});

app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        'OPENAI_API_KEY가 없습니다. cad-ai-analyzer/.env 파일에 키를 넣고 서버를 다시 시작하세요.',
    });
  }

  const { points = [], segments = [], totalLength = 0, excelRows = [], selectedSegmentId } =
    req.body || {};

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const system = [
    '당신은 CAD 도면 좌표/연장과 엑셀 BOM을 대조하는 한국어 엔지니어링 어시스턴트입니다.',
    '입력된 기하·BOM만 근거로 짧고 정확하게 요약하세요.',
    '반드시 JSON만 출력하세요. 형식: {"notes":["문장1","문장2","문장3","문장4"]}',
    'notes는 3~5개, 각 문장은 한 줄, 수치(좌표/연장/수량)를 포함하세요.',
    '추측으로 없는 부품을 만들지 마세요.',
  ].join(' ');

  const userPayload = {
    unit: 'mm',
    points,
    segments,
    totalLength,
    excelRows,
    selectedSegmentId: selectedSegmentId || null,
  };

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: `다음 CAD·BOM 데이터를 분석하세요:\n${JSON.stringify(userPayload, null, 2)}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { notes: [raw] };
    }

    const notes = Array.isArray(parsed.notes)
      ? parsed.notes.map(String).filter(Boolean)
      : [String(parsed.summary || raw)];

    res.json({
      notes,
      model,
      usage: completion.usage || null,
    });
  } catch (err) {
    console.error('[analyze]', err);
    res.status(500).json({
      error: err?.message || 'OpenAI 분석 중 오류가 발생했습니다.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`[api] http://localhost:${PORT}`);
  console.log(`[api] OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'set' : 'MISSING'}`);
});

import './UploadPanel.css';

function UploadPanel({ cadFile, excelFile, onCadChange, onExcelChange, onAnalyze, analyzing }) {
  return (
    <section className="upload-panel" aria-label="파일 업로드">
      <div className="upload-grid">
        <label className={`drop-zone ${cadFile ? 'has-file' : ''}`}>
          <input
            type="file"
            accept=".dxf,.dwg,.svg,.png,.jpg,.jpeg"
            onChange={(e) => onCadChange(e.target.files?.[0] || null)}
          />
          <span className="drop-kicker">CAD 도면</span>
          <span className="drop-title">{cadFile ? cadFile.name : 'DXF / DWG / 이미지'}</span>
          <span className="drop-hint">드래그하거나 클릭해서 선택</span>
        </label>

        <label className={`drop-zone ${excelFile ? 'has-file' : ''}`}>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => onExcelChange(e.target.files?.[0] || null)}
          />
          <span className="drop-kicker">엑셀 데이터</span>
          <span className="drop-title">{excelFile ? excelFile.name : 'XLSX / CSV'}</span>
          <span className="drop-hint">자재·스펙·수량 시트</span>
        </label>
      </div>

      <button
        type="button"
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={analyzing}
      >
        {analyzing ? 'AI 분석 중…' : 'AI로 좌표·연장 추출'}
      </button>
    </section>
  );
}

export default UploadPanel;

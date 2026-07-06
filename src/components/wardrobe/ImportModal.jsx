import { useState } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { mapGeminiItem } from '../../lib/wardrobeUtils';
import { CATEGORY_EMOJI } from '../../constants/categories';

export default function ImportModal({ open, onClose, onImport }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  function handleParse() {
    setError('');
    setParsed(null);
    try {
      let json = JSON.parse(text.trim());
      if (!Array.isArray(json)) json = [json];
      const mapped = json.map(mapGeminiItem);
      setParsed(mapped);
    } catch {
      setError('Invalid JSON. Paste a valid JSON array of wardrobe items.');
    }
  }

  async function handleImport() {
    if (!parsed?.length) return;
    setImporting(true);
    try {
      await onImport(parsed);
      onClose();
      setText('');
      setParsed(null);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function handleClose() {
    setText('');
    setParsed(null);
    setError('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import from JSON">
      <div className="flex flex-col gap-4">
        <div className="bg-accent-light rounded-xl p-3">
          <p className="text-xs text-accent font-medium mb-1">💡 How to import</p>
          <p className="text-[11px] text-muted">Paste your Gemini JSON export below. It should be a JSON array of wardrobe items.</p>
        </div>

        {!parsed ? (
          <>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder='[{"name":"White Shirt","category":"Top","color_primary":"White",...}]'
              className="w-full h-40 px-3 py-2.5 border border-border rounded-xl text-xs bg-bg focus:outline-none focus:border-accent font-mono resize-none"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button onClick={handleParse} disabled={!text.trim()}>
              Preview Import
            </Button>
          </>
        ) : (
          <>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-sm font-bold text-primary mb-3">
                Found {parsed.length} item{parsed.length !== 1 ? 's' : ''} — ready to import
              </p>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {parsed.slice(0, 20).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                    <span className="text-xl">{CATEGORY_EMOJI[item.category] || '👔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{item.name}</p>
                      <p className="text-[11px] text-muted">{item.category} · {item.color_primary || 'No colour'}</p>
                    </div>
                    {item.needs_photo && (
                      <span className="text-[10px] bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">📷 No photo</span>
                    )}
                  </div>
                ))}
                {parsed.length > 20 && (
                  <p className="text-xs text-muted text-center py-2">+ {parsed.length - 20} more items</p>
                )}
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setParsed(null)} className="flex-1">Back</Button>
              <Button onClick={handleImport} loading={importing} className="flex-1">
                Import All {parsed.length} Items
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

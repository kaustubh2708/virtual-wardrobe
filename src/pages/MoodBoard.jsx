import { useState } from 'react';
import { Plus, Link2, Upload, Trash2, Wand2 } from 'lucide-react';
import { getMoodBoard, addMoodImage, updateMoodImage, removeMoodImage } from '../lib/planStore';
import { HAS_GEMINI_KEY } from '../lib/demoMode';
import { callGeminiJSON } from '../lib/gemini';
import { fileToDataUrl } from '../lib/localStore';
import Modal from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tag } from '../components/ui/Tag';

const MOOD_SCHEMA = {
  type: 'OBJECT',
  properties: {
    palette: { type: 'ARRAY', items: { type: 'STRING' } }, // hex codes
    keywords: { type: 'ARRAY', items: { type: 'STRING' } },
    summary: { type: 'STRING' },
  },
  required: ['palette', 'keywords', 'summary'],
};

async function srcToInlineImage(src) {
  let dataUrl = src;
  if (!src.startsWith('data:')) {
    const res = await fetch(src);
    dataUrl = await fileToDataUrl(await res.blob());
  }
  const comma = dataUrl.indexOf(',');
  const meta = dataUrl.slice(0, comma);
  return { mimeType: /data:(.*?);/.exec(meta)?.[1] || 'image/jpeg', data: dataUrl.slice(comma + 1) };
}

export default function MoodBoard() {
  const [board, setBoard] = useState(() => getMoodBoard());
  const [addOpen, setAddOpen] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [detail, setDetail] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  function refresh() { setBoard(getMoodBoard()); }

  function addUrl() {
    const src = urlValue.trim();
    if (!src) return;
    addMoodImage({ src });
    setUrlValue('');
    setAddOpen(false);
    refresh();
  }

  async function addFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await fileToDataUrl(file);
    addMoodImage({ src });
    setAddOpen(false);
    refresh();
  }

  function del(id) {
    removeMoodImage(id);
    if (detail?.id === id) setDetail(null);
    refresh();
  }

  async function analyze(entry) {
    setAnalyzing(true);
    setError('');
    try {
      const image = await srcToInlineImage(entry.src);
      const result = await callGeminiJSON({
        system: 'You are a fashion mood-board analyst. Given an inspiration image, extract its dominant colour palette (as hex codes), 3-6 style keywords, and a one-line vibe summary.',
        prompt: 'Analyse this style inspiration image.',
        image,
        schema: MOOD_SCHEMA,
        temperature: 0.4,
      });
      updateMoodImage(entry.id, { palette: result.palette || [], keywords: result.keywords || [], note: result.summary || entry.note });
      refresh();
      setDetail({ ...entry, ...result, note: result.summary || entry.note });
    } catch (err) {
      setError(err.message.includes('fetch') ? 'Could not load that image for analysis (the host may block cross-origin access). Uploaded images always work.' : err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Mood Board</h1>
          <p className="text-white/60 text-xs mt-1">Collect the looks you're chasing</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="bg-white/10 rounded-full p-2 active:scale-95"><Plus size={20} /></button>
      </div>

      <div className="px-4 py-4 flex-1">
        {board.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <span className="text-6xl mb-3">🖼️</span>
            <h3 className="text-base font-bold text-primary mb-1">No inspiration yet</h3>
            <p className="text-sm text-muted mb-4">Paste an image link or upload a screenshot.</p>
            <Button onClick={() => setAddOpen(true)}>Add inspiration</Button>
          </div>
        ) : (
          <div className="columns-2 gap-2 [column-fill:_balance]">
            {board.map(m => (
              <button key={m.id} onClick={() => setDetail(m)} className="mb-2 w-full break-inside-avoid rounded-xl overflow-hidden bg-surface shadow-sm block active:scale-95 transition-transform">
                <img src={m.src} alt={m.note || 'inspiration'} className="w-full object-cover" loading="lazy" />
                {(m.keywords?.length || m.note) ? (
                  <div className="p-2 text-left">
                    {m.note && <p className="text-[11px] text-primary line-clamp-2 mb-1">{m.note}</p>}
                    <div className="flex flex-wrap gap-1">{(m.keywords || []).slice(0, 2).map(k => <Tag key={k}>{k}</Tag>)}</div>
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add inspiration">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted font-bold mb-1.5 flex items-center gap-1"><Link2 size={12} /> Paste image URL</p>
            <div className="flex gap-2">
              <Input value={urlValue} onChange={e => setUrlValue(e.target.value)} placeholder="https://…/look.jpg" />
              <Button onClick={addUrl}>Add</Button>
            </div>
          </div>
          <div className="text-center text-[11px] text-muted">or</div>
          <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed border-border rounded-xl cursor-pointer bg-accent-light/50 text-muted">
            <Upload size={16} /> <span className="text-sm">Upload a screenshot</span>
            <input type="file" accept="image/*" className="hidden" onChange={addFile} />
          </label>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Inspiration">
        {detail && (
          <div className="flex flex-col gap-3">
            <img src={detail.src} alt="" className="w-full rounded-xl" />
            {detail.note && <p className="text-sm text-primary">{detail.note}</p>}
            {detail.palette?.length > 0 && (
              <div className="flex gap-1.5">
                {detail.palette.map((hex, i) => <span key={i} className="w-7 h-7 rounded-full border border-border" style={{ backgroundColor: hex }} title={hex} />)}
              </div>
            )}
            {detail.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">{detail.keywords.map(k => <Tag key={k}>{k}</Tag>)}</div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 mt-1">
              {HAS_GEMINI_KEY && (
                <Button onClick={() => analyze(detail)} loading={analyzing} className="flex-1">
                  <Wand2 size={15} className="inline mr-1 -mt-0.5" /> {detail.keywords?.length ? 'Re-analyse' : 'Analyse style'}
                </Button>
              )}
              <button onClick={() => del(detail.id)} className="px-4 rounded-xl bg-red-50 text-red-500 flex items-center gap-1 text-sm font-bold"><Trash2 size={15} /></button>
            </div>
            {!HAS_GEMINI_KEY && <p className="text-[11px] text-muted text-center">Add a Gemini key to auto-extract palette & style keywords.</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

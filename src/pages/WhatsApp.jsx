import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import CyberCard from '../components/ui/CyberCard';
import toast from 'react-hot-toast';
import {
  Wifi, WifiOff, QrCode, MessageSquare, RefreshCw,
  CheckCircle2, XCircle, Clock, Loader2, AlertTriangle,
  Smartphone, Zap, Scan
} from 'lucide-react';

// ─── WhatsApp Microservice Config ─────────────────────────────────────────────
// LOCAL: http://localhost:3001
// PRODUCTION: change this after deploying the WA server
const WA_BASE_URL = import.meta.env.VITE_WA_URL || 'http://localhost:3001';
const WA_API_KEY  = import.meta.env.VITE_WA_API_KEY || 'dev-secret-change-me-in-production';

const POLL_MS = 6000;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    READY:         { label: 'متصل ✓',        cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', spin: false },
    INITIALIZING:  { label: 'جاري الربط…',   cls: 'bg-yellow-500/20  text-yellow-400  border-yellow-500/40',  spin: true  },
    OFFLINE:       { label: 'غير متصل',       cls: 'bg-rose-500/20    text-rose-400    border-rose-500/40',    spin: false },
    NOT_CONNECTED: { label: 'لم يُربط بعد',  cls: 'bg-slate-500/20   text-slate-400   border-slate-500/40',   spin: false },
  };
  const cfg = map[status] || map.NOT_CONNECTED;
  const dotCls = status === 'READY'
    ? 'bg-emerald-400 animate-pulse'
    : status === 'INITIALIZING'
      ? 'bg-yellow-400 animate-ping'
      : 'bg-slate-500';

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.cls}`}>
      <span className={`w-2 h-2 rounded-full ${dotCls}`} />
      {cfg.label}
    </span>
  );
};

// ─── Message log (localStorage per gym) ──────────────────────────────────────
const useMessageLog = (gymId) => {
  const KEY = `wa_log_${gymId}`;
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });
  const push = useCallback((msg) => {
    setMessages(prev => {
      const next = [{ ...msg, id: Date.now() }, ...prev].slice(0, 150);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, [KEY]);
  const clear = () => { localStorage.removeItem(KEY); setMessages([]); };
  return { messages, push, clear };
};

// ─── WhatsApp Page Component ──────────────────────────────────────────────────
const WhatsApp = () => {
  const { user } = useAuth();
  const gymId = String(user?.gymId || user?.id || 'demo');

  // ── State ──────────────────────────────────────────────────────────────────
  const [status,     setStatus]     = useState('NOT_CONNECTED');
  const [qrString,   setQrString]   = useState(null);   // raw QR string from Socket.io
  const [connecting, setConnecting] = useState(false);
  const [serverDown, setServerDown] = useState(false);
  const [socketOk,   setSocketOk]   = useState(false);

  const { messages, push, clear } = useMessageLog(gymId);
  const socketRef = useRef(null);
  const pollRef   = useRef(null);

  // ── REST helper ─────────────────────────────────────────────────────────────
  const waFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${WA_BASE_URL}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', 'x-api-key': WA_API_KEY, ...(opts.headers || {}) },
    });
    const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    if (!res.ok) throw Object.assign(new Error(json.error || `HTTP ${res.status}`), { status: res.status });
    return json;
  }, []);

  // ── Poll status via REST ─────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const data = await waFetch(`/api/whatsapp/status/${gymId}`);
      setStatus(data.status || 'NOT_CONNECTED');
      setServerDown(false);
      if (data.status === 'READY') { setQrString(null); setConnecting(false); }
    } catch {
      setServerDown(true);
    }
  }, [gymId, waFetch]);

  // ── Connect via Socket.io for live QR events ─────────────────────────────────
  useEffect(() => {
    const socket = io(WA_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 8000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketOk(true);
      setServerDown(false);
      socket.emit('join:gym', gymId);   // join this gym's room
    });

    socket.on('disconnect', () => setSocketOk(false));
    socket.on('connect_error', () => { setSocketOk(false); setServerDown(true); });

    // ── Live QR code from WA server ──────────────────────────────────────────
    socket.on('whatsapp:qr', ({ qr }) => {
      setQrString(qr);
      setStatus('INITIALIZING');
      setConnecting(false);
    });

    // ── Session became ready ──────────────────────────────────────────────────
    socket.on('whatsapp:ready', () => {
      setStatus('READY');
      setQrString(null);
      setConnecting(false);
      toast.success('✅ تم ربط الواتساب بنجاح!');
      push({ type: 'system', text: 'تم ربط جلسة الواتساب بنجاح', phone: '—', status: 'sent' });
    });

    // ── Disconnected ──────────────────────────────────────────────────────────
    socket.on('whatsapp:disconnected', ({ reason }) => {
      setStatus('OFFLINE');
      setQrString(null);
      toast.error(`انقطع الاتصال: ${reason}`);
    });

    // ── Auth failure ──────────────────────────────────────────────────────────
    socket.on('whatsapp:auth_failure', () => {
      setStatus('OFFLINE');
      setQrString(null);
      toast.error('فشل التحقق — امسح الـ QR من جديد');
    });

    return () => socket.disconnect();
  }, [gymId, push]);

  // ── Fallback REST polling ────────────────────────────────────────────────────
  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchStatus]);

  // ── Connect handler ──────────────────────────────────────────────────────────
  const handleConnect = async () => {
    if (connecting || status === 'INITIALIZING') return;
    setConnecting(true);
    setQrString(null);
    try {
      await waFetch('/api/whatsapp/connect', { method: 'POST', body: JSON.stringify({ gymId }) });
      setStatus('INITIALIZING');
      toast('📟 جاري تحميل الـ QR…', { icon: '⏳' });
    } catch (err) {
      toast.error(`فشل الاتصال: ${err.message}`);
      setConnecting(false);
    }
  };

  // ─── QR Image URL ────────────────────────────────────────────────────────────
  // We render the raw QR string as an image using a free QR API
  const qrImageUrl = qrString
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=M&data=${encodeURIComponent(qrString)}`
    : null;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Smartphone size={28} className="text-[var(--theme-primary)]" />
            واتساب الصالة
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ربط الواتساب، استقبال الـ QR، ومتابعة الرسائل المُرسلة
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Socket indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            socketOk
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${socketOk ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {socketOk ? 'Socket متصل' : 'Socket غير متصل'}
          </div>
          <button
            onClick={fetchStatus}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-cyber-border)] text-gray-400 hover:text-white text-sm font-semibold transition-all"
          >
            <RefreshCw size={14} />
            تحديث
          </button>
        </div>
      </div>

      {/* Server down warning */}
      {serverDown && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">سيرفر الواتساب غير مشغّل</p>
            <code className="text-xs bg-black/30 px-2 py-1 rounded mt-1 inline-block font-mono">
              cd whatsAppServer &amp;&amp; npm run dev
            </code>
          </div>
        </div>
      )}

      {/* ── Main: Status + QR side by side ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Status card */}
        <CyberCard hover={false}>
          <div className="flex flex-col gap-5 h-full">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                status === 'READY'
                  ? 'bg-emerald-500/15'
                  : status === 'INITIALIZING'
                    ? 'bg-yellow-500/15'
                    : 'bg-rose-500/15'
              }`}>
                {status === 'READY'        && <Wifi     size={20} className="text-emerald-400" />}
                {status === 'INITIALIZING' && <Loader2  size={20} className="text-yellow-400 animate-spin" />}
                {(status === 'OFFLINE' || status === 'NOT_CONNECTED') && <WifiOff size={20} className="text-rose-400" />}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">حالة الجلسة</p>
                <StatusBadge status={status} />
              </div>
            </div>

            {/* Gym ID */}
            <div className="p-3 rounded-xl bg-black/30 border border-white/5">
              <p className="text-xs text-gray-600 mb-0.5">Gym ID</p>
              <p className="text-sm font-mono text-gray-300 break-all">{gymId}</p>
            </div>

            {/* Status message */}
            <div className="text-sm text-gray-400 leading-relaxed">
              {status === 'READY' && (
                <p className="text-emerald-400">✅ الواتساب متصل — الرسائل التلقائية شغالة</p>
              )}
              {status === 'INITIALIZING' && (
                <p className="text-yellow-400 animate-pulse">⏳ في انتظار مسح الـ QR code…</p>
              )}
              {status === 'NOT_CONNECTED' && (
                <p className="text-gray-500">اضغط "ربط الواتساب" لبدء الجلسة وظهور الـ QR</p>
              )}
              {status === 'OFFLINE' && (
                <p className="text-rose-400">❌ انقطع الاتصال — اضغط "ربط" من جديد</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-auto">
              {(status === 'NOT_CONNECTED' || status === 'OFFLINE') && (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[var(--theme-primary)] text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                >
                  {connecting
                    ? <><Loader2 size={16} className="animate-spin" /> جاري الاتصال…</>
                    : <><Zap size={16} /> ربط الواتساب</>
                  }
                </button>
              )}
              {status === 'INITIALIZING' && (
                <div className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  في انتظار المسح…
                </div>
              )}
              {status === 'READY' && (
                <button
                  onClick={handleConnect}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-slate-800 border border-white/10 text-gray-300 hover:text-white font-bold text-sm transition-all"
                >
                  <RefreshCw size={16} />
                  إعادة ربط الجلسة
                </button>
              )}
            </div>
          </div>
        </CyberCard>

        {/* QR Code card */}
        <CyberCard hover={false} className={qrString ? 'border-yellow-500/30' : ''}>
          <div className="flex flex-col items-center justify-center gap-4 h-full py-4">

            {/* READY state */}
            {status === 'READY' && (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} className="text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-bold text-sm">واتساب متصل بنجاح</p>
                <p className="text-xs text-gray-600">الرسائل التلقائية تُرسل تلقائياً عند تسجيل أعضاء جدد</p>
              </div>
            )}

            {/* QR code shown here (INITIALIZING state) */}
            {status === 'INITIALIZING' && (
              <div className="text-center space-y-4 w-full">
                <div className="flex items-center gap-2 justify-center text-yellow-400 font-bold text-sm">
                  <Scan size={18} className="animate-pulse" />
                  امسح الـ QR Code بالواتساب
                </div>

                {qrImageUrl ? (
                  /* QR image received via Socket.io */
                  <div className="relative mx-auto w-fit">
                    <div className="p-3 bg-white rounded-2xl shadow-2xl shadow-yellow-500/10 border-2 border-yellow-500/30">
                      <img
                        src={qrImageUrl}
                        alt="WhatsApp QR Code"
                        className="w-64 h-64 block"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    {/* Animated corners */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
                    <div className="absolute -top-1 -left-1  w-5 h-5 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-yellow-400 rounded-br-md" />
                    <div className="absolute -bottom-1 -left-1  w-5 h-5 border-b-2 border-l-2 border-yellow-400 rounded-bl-md" />
                  </div>
                ) : (
                  /* Waiting for QR from socket */
                  <div className="w-64 h-64 mx-auto rounded-2xl bg-black/30 border border-yellow-500/20 flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="text-yellow-400 animate-spin" />
                    <p className="text-xs text-yellow-400/70 text-center px-4">
                      في انتظار الـ QR من السيرفر…<br/>
                      <span className="text-gray-600">يظهر خلال ثوانٍ</span>
                    </p>
                  </div>
                )}

                <div className="bg-black/30 rounded-xl p-3 text-right max-w-xs mx-auto">
                  <p className="text-xs text-gray-500 mb-1.5 font-bold">كيف تمسح:</p>
                  <ol className="text-xs text-gray-400 space-y-1">
                    <li>١. افتح واتساب على موبايلك</li>
                    <li>٢. النقاط ⋮ ← الأجهزة المرتبطة</li>
                    <li>٣. ربط جهاز ← امسح الـ QR</li>
                  </ol>
                </div>
              </div>
            )}

            {/* NOT_CONNECTED or OFFLINE */}
            {(status === 'NOT_CONNECTED' || status === 'OFFLINE') && (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center mx-auto">
                  <QrCode size={36} className="text-slate-600" />
                </div>
                <p className="text-gray-500 text-sm">الـ QR سيظهر هنا بعد الضغط على "ربط الواتساب"</p>
              </div>
            )}

          </div>
        </CyberCard>
      </div>

      {/* ── Messages Log ───────────────────────────────────────────── */}
      <CyberCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[var(--theme-primary)]" />
            <span className="font-bold text-sm text-white">سجل الرسائل المُرسلة</span>
            <span className="text-xs text-gray-600 px-2 py-0.5 rounded-full bg-slate-800">
              {messages.length}
            </span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clear}
              className="text-xs text-gray-600 hover:text-rose-400 transition-colors"
            >
              مسح السجل
            </button>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-700">
            <MessageSquare size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold">لا توجد رسائل بعد</p>
            <p className="text-xs mt-1 opacity-60">
              الرسائل ستظهر هنا تلقائياً عند تسجيل الأعضاء أو إرسال التذكيرات
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.type === 'welcome'  ? 'bg-emerald-500/15' :
                    msg.type === 'reminder' ? 'bg-yellow-500/15'  :
                                              'bg-slate-800'
                  }`}>
                    {msg.type === 'welcome'  && <Smartphone size={13} className="text-emerald-400" />}
                    {msg.type === 'reminder' && <Clock      size={13} className="text-yellow-400" />}
                    {msg.type === 'system'   && <Zap        size={13} className="text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-semibold truncate">{msg.text}</p>
                    <p className="text-xs text-gray-600 font-mono">{msg.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 mr-3">
                  <span className="text-xs text-gray-600">{msg.time}</span>
                  {msg.status === 'sent'
                    ? <CheckCircle2 size={13} className="text-emerald-400" />
                    : <XCircle      size={13} className="text-rose-400" />
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </CyberCard>

    </div>
  );
};

export default WhatsApp;

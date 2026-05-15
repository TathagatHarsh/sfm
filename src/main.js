// Import styles
import './style.css';

// ── NAVIGATION ──
const titles = {
  home: ['Welcome to SFM Hub', 'Your complete Strategic Financial Management companion'],
  capm: ['CAPM & Beta', 'Capital Asset Pricing Model — systematic risk & expected returns'],
  dcf: ['DCF & Terminal Value', 'Discounted cash flow valuation and Gordon growth model'],
  irr: ['NPV & IRR', 'Investment decision rules — when they work and when they fail'],
  dupont: ['DuPont & Ratios', 'ROE decomposition — profitability, efficiency, leverage'],
  fcff: ['FCFF & WACC', 'Free Cash Flow to Firm — computation and NWC logic'],
  nwc: ['Working Capital', 'NWC in cash flows vs reinvestment — the logic behind subtract/add'],
  exam: ['Mock Exam', 'End-sem style MCQ practice with full explanations'],
  formulas: ['Formula Sheet', 'Quick reference — every formula you need for the exam'],
  ai: ['AI Tutor', 'Ask anything — powered by Groq']
};

const visited = new Set(['home']);

window.nav = function(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById('sec-' + id);
  if (sec) sec.classList.add('active');
  if (el) el.classList.add('active');
  const t = titles[id] || [id, ''];
  document.getElementById('page-title').textContent = t[0];
  document.getElementById('page-sub').textContent = t[1];
  visited.add(id);
  const pct = Math.min(Math.round((visited.size / 8) * 100), 100);
  document.getElementById('prog-pct').textContent = pct + '%';
  document.getElementById('prog-fill').style.width = pct + '%';
  if (id === 'exam') initExam();
};

// ── TABS ──
window.tab = function(topic, idx, el) {
  const sec = document.getElementById('sec-' + topic);
  sec.querySelectorAll('.lesson-panel').forEach((p, i) => {
    p.classList.toggle('active', i === idx);
  });
  sec.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });
};

// ── CAPM CALCULATOR ──
let capmState = { rf: 7, b: 2.6, rm: 13 };
window.updateCAPM = function(field, val) {
  capmState[field] = parseFloat(val);
  document.getElementById('capm-' + field).textContent = parseFloat(val).toFixed(1);
  const er = capmState.rf + capmState.b * (capmState.rm - capmState.rf);
  document.getElementById('capm-result').textContent = er.toFixed(1) + '%';
  document.getElementById('capm-rf-val').textContent = capmState.rf;
  document.getElementById('capm-b-val').textContent = capmState.b.toFixed(1);
  document.getElementById('capm-rm-val').textContent = capmState.rm;
};

// ── TERMINAL VALUE CALCULATOR ──
let tvState = { fcff: 31357, wacc: 12, g: 7 };
window.updateTV = function(f, w, g) {
  if (f !== null) tvState.fcff = parseInt(f);
  if (w !== null) tvState.wacc = parseFloat(w);
  if (g !== null) tvState.g = parseFloat(g);
  document.getElementById('tv-fcff').textContent = tvState.fcff.toLocaleString('en-IN');
  document.getElementById('tv-wacc').textContent = tvState.wacc;
  document.getElementById('tv-g').textContent = tvState.g;
  const warn = document.getElementById('tv-warning');
  const fmla = document.getElementById('tv-formula');
  if (tvState.g >= tvState.wacc) {
    warn.style.display = 'block';
    fmla.textContent = 'g ≥ WACC → TV = ∞ (model breaks down)';
  } else {
    warn.style.display = 'none';
    const tv = Math.round(tvState.fcff * (1 + tvState.g / 100) / ((tvState.wacc - tvState.g) / 100));
    fmla.textContent = 'TV = ₹' + tvState.fcff.toLocaleString('en-IN') + ' × ' + (1 + tvState.g / 100).toFixed(2) + ' / (' + tvState.wacc + '% − ' + tvState.g + '%) = ₹' + tv.toLocaleString('en-IN');
  }
};

// ── QUIZ ENGINE ──
const allQ = {
  capm: [
    { q: 'The market risk premium is 6%. A stock has beta 2.5 and risk-free rate is 5%. Expected return = ?', opts: ['20%', '22%', '15%', '25%'], ans: 0, exp: 'CAPM: 5% + 2.5 × 6% = 5% + 15% = 20%. Market risk premium stays at 6% regardless of beta.' },
    { q: 'Which is FALSE about beta?', opts: ['Beta measures systematic risk', 'Beta is the risk of the market itself', 'Daily beta is usually higher than yearly beta', 'Beta assumes constant volatility'], ans: 1, exp: 'Beta is the market risk OF A STOCK — its sensitivity to market movements. The risk of the market is measured by the SD of NIFTY50, not by beta.' },
    { q: 'Risk-free rate = 5%, Market return = 14%. Stock with beta = 1.5. If beta increases to 2.5, expected return increases by:', opts: ['9%', '4.5%', '13.5%', '6%'], ans: 0, exp: 'At β=1.5: E(R) = 5 + 1.5×9 = 18.5%. At β=2.5: E(R) = 5 + 2.5×9 = 27.5%. Increase = 9%. Market premium (9%) × Δbeta (1) = 9%.' }
  ],
  dcf: [
    { q: 'FCFF in year 5 = ₹50,000. WACC=12%, g=7%. Terminal value at year 5 =', opts: ['₹10,70,000', '₹10,00,000', '₹8,33,333', '₹5,35,000'], ans: 0, exp: 'TV = 50,000 × (1.07) / (0.12−0.07) = 53,500 / 0.05 = ₹10,70,000. Always apply (1+g) to the year-n cash flow before dividing by the spread.' },
    { q: 'Terminal value dominates a DCF primarily because:', opts: ['Cash flows grow forever at rate g', 'Near-term forecasts are always wrong', 'TV is discounted for fewer periods', 'The denominator (WACC−g) is usually very small'], ans: 3, exp: 'The Gordon growth denominator (WACC−g) is typically 2–5%, making the TV very large. A small g change drastically changes this denominator and thus TV.' }
  ],
  irr: [
    { q: 'Cash flows: t=0 +₹500, t=1 −₹300, t=2 −₹400. IRR=18%, WACC=12%. Decision?', opts: ['Accept: IRR>WACC', 'Reject: financing project, accept only if IRR<WACC', 'Accept: NPV will be positive', 'Need more data'], ans: 1, exp: 'Positive CF first, negatives later = financing project. Rule reverses. IRR (18%) > WACC (12%) → NPV < 0 → Reject.' },
    { q: 'Cash flows: −1000, +3000, −2500, +800. How many IRRs can exist?', opts: ['Exactly 1', 'Up to 3', 'Up to 2', 'Exactly 0'], ans: 1, exp: 'By Descartes Rule: max IRRs = number of sign changes = 3 (−,+; +,−; −,+). So up to 3 positive IRRs.' },
    { q: 'Which situation makes IRR rule unreliable?', opts: ['Project has a high NPV', 'Cash flows change sign twice', 'WACC is higher than IRR', 'Project lasts only 2 years'], ans: 1, exp: 'Multiple sign changes → multiple IRRs → no unique decision rate. The NPV crosses zero more than once.' }
  ],
  dupont: [
    { q: 'NPM=12%, ATO=1.5, ROE=27%. Equity Multiplier = ?', opts: ['1.5', '1.25', '2.0', '1.8'], ans: 0, exp: 'EM = ROE / (NPM × ATO) = 0.27 / (0.12 × 1.5) = 0.27 / 0.18 = 1.5' },
    { q: 'ROE rises from 18% to 27%. NPM and ATO are unchanged. What happened?', opts: ['Asset efficiency improved', 'Profitability improved', 'Leverage increased', 'Risk-free rate fell'], ans: 2, exp: 'Since NPM×ATO is constant, the only DuPont driver that changed is EM (Equity Multiplier = leverage). Higher EM → higher ROE.' }
  ],
  fcff: [
    { q: 'EBIT=₹80,000, Tax=30%, Dep=₹12,000, ΔNWC=₹5,000, Capex=₹8,000. FCFF=?', opts: ['₹55,000', '₹63,000', '₹55,000', '₹61,000'], ans: 1, exp: 'FCFF = 80,000×0.70 + 12,000 − 5,000 − 8,000 = 56,000 + 12,000 − 5,000 − 8,000 = ₹55,000. Correct answer is ₹55,000.' },
    { q: 'Why is an INCREASE in NWC subtracted when computing FCFF?', opts: ['It reduces accounting profit', 'Cash is tied up in operations and unavailable to investors', 'It increases depreciation', 'It raises the tax rate'], ans: 1, exp: 'When NWC rises, cash gets locked in inventory, receivables, prepayments. It is not available to debt or equity holders — hence subtracted from free cash flow.' }
  ]
};

function renderQuiz(topic, containerId) {
  const qs = allQ[topic] || [];
  const wrap = document.getElementById(containerId);
  if (!wrap || !qs.length) return;
  let cur = 0, score = 0, answered = Array(qs.length).fill(null), done = false;

  function render() {
    if (done) {
      const pct = Math.round(score / qs.length * 100);
      wrap.innerHTML = `<div class="quiz-card" style="text-align:center;padding:28px">
        <div class="score-ring">${score}/${qs.length}</div>
        <h3 style="margin-bottom:8px">${pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good effort' : '📚 Keep revising'}</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:16px">${pct}% score on ${topic.toUpperCase()} questions</p>
        <button class="quiz-btn" id="retry-${topic}">Try again</button>
      </div>`;
      document.getElementById(`retry-${topic}`).onclick = () => {
          wrap.innerHTML = '';
          renderQuiz(topic, containerId);
      };
      return;
    }
    const q = qs[cur];
    const a = answered[cur];
    const pct = Math.round(cur / qs.length * 100);
    let opts = q.opts.map((o, i) => {
      let cls = 'opt';
      if (a !== null) {
        if (i === q.ans) cls += ' correct';
        else if (i === a) cls += ' wrong';
      }
      const letters = ['A','B','C','D'];
      return `<div class="${cls}" data-idx="${i}"><span class="opt-key">${letters[i]}</span>${o}</div>`;
    }).join('');
    let fb = '';
    if (a !== null) {
      const ok = a === q.ans;
      fb = `<div class="feedback ${ok?'ok':'bad'}"><strong>${ok ? '✓ Correct!' : '✗ Incorrect.'}</strong> ${q.exp}</div>`;
    }
    const isLast = cur === qs.length - 1;
    wrap.innerHTML = `<div class="quiz-wrap">
      <div class="quiz-header"><span>Q${cur+1} of ${qs.length}</span><span>Score: ${score}</span></div>
      <div class="qprog"><div class="qprog-fill" style="width:${pct}%"></div></div>
      <div class="quiz-card">
        <div class="quiz-q">${q.q}</div>
        <div class="options-container">${opts}</div>
        ${fb}
        ${a !== null ? `<button class="quiz-btn" id="next-${topic}">${isLast ? 'See results →' : 'Next →'}</button>` : ''}
      </div>
    </div>`;

    wrap.querySelectorAll('.opt').forEach(opt => {
        opt.onclick = () => {
            if (answered[cur] !== null) return;
            const idx = parseInt(opt.dataset.idx);
            answered[cur] = idx;
            if (idx === q.ans) score++;
            render();
        };
    });

    if (a !== null) {
        document.getElementById(`next-${topic}`).onclick = () => {
            if (isLast) done = true;
            else cur++;
            render();
        };
    }
  }
  render();
}

// ── FULL EXAM ──
const examQ = [
  { q: 'The market risk premium is 6%. A stock has beta 2.5, risk-free rate 5%. Expected return =', opts: ['A) 20%', 'B) 22%', 'C) 17.5%', 'D) 25%'], ans: 0, exp: 'CAPM: 5% + 2.5 × 6% = 20%. Market Risk Premium is constant at 6%.' },
  { q: 'Which statement about beta is FALSE?', opts: ['A) It measures systematic risk', 'B) It is the risk of the market itself', 'C) Daily beta > annual beta typically', 'D) It assumes constant volatility'], ans: 1, exp: 'Beta is the market risk of THE STOCK. The risk of the market is the SD of NIFTY50.' },
  { q: 'NPM=10%, ATO=1.2, ROE=15%. Equity Multiplier =', opts: ['A) 1.5', 'B) 1.25', 'C) 2.0', 'D) 1.0'], ans: 1, exp: 'EM = ROE/(NPM×ATO) = 0.15/(0.10×1.2) = 0.15/0.12 = 1.25' },
  { q: 'FCFF 2013 = ₹31,357. WACC=12%, perpetual g=7%. Terminal value =', opts: ['A) ₹6,71,040', 'B) ₹6,27,140', 'C) ₹5,00,000', 'D) ₹7,13,280'], ans: 0, exp: 'TV = 31,357×(1.07)/(0.12−0.07) = 33,552/0.05 = ₹6,71,040. Must apply (1+g) to get next period CF.' },
  { q: 'EBIT=₹24,383, Tax=35%, Dep=₹7,710, no NWC or Capex. FCFF =', opts: ['A) ₹10,545', 'B) ₹24,383', 'C) ₹23,559', 'D) ₹18,255'], ans: 2, exp: 'FCFF = 24,383×(1−0.35) + 7,710 = 15,849 + 7,710 = ₹23,559' },
  { q: 'Cash flows: +₹400, +₹400, −₹1,056. IRR=14%, WACC=10%. Decision?', opts: ['A) Accept — IRR > WACC', 'B) Reject — financing project, accept only if WACC > IRR', 'C) Accept — NPV is positive', 'D) Need more data'], ans: 1, exp: 'Positive CFs first = financing project. Rule reverses: accept only if IRR < WACC. Since 14% > 10%, reject.' },
  { q: 'Why must terminal growth rate ≤ nominal GDP growth?', opts: ['A) Regulatory requirement', 'B) No company can grow faster than economy forever', 'C) WACC always equals GDP growth', 'D) Terminal value becomes negative otherwise'], ans: 1, exp: 'In perpetuity, if a company grew faster than GDP, it would eventually BE the economy — impossible. So g is capped at nominal GDP.' },
  { q: 'Increase in NWC is SUBTRACTED in FCFF calculation because:', opts: ['A) It increases depreciation', 'B) It reduces accounting profit', 'C) Cash is locked in operations, unavailable to investors', 'D) It raises the effective tax rate'], ans: 2, exp: 'When NWC rises, cash is tied up in inventory, receivables. It is not available to capital providers — hence subtracted from free cash flow.' },
  { q: 'Cash flows: −1000, +2000, −1500, +600. How many positive IRRs can exist?', opts: ['A) 1', 'B) Up to 3', 'C) Exactly 2', 'D) 0'], ans: 1, exp: 'Descartes Rule: max IRRs = sign changes. Signs: −,+,−,+ = 3 changes → up to 3 positive IRRs. IRR rule inapplicable.' },
  { q: 'Which is TRUE about firm-specific risk?', opts: ['A) Investors are compensated for holding it', 'B) It cannot be eliminated', 'C) Its risk premium is zero', 'D) It increases with beta'], ans: 2, exp: 'Firm-specific (unsystematic) risk can be eliminated for free by diversifying. Since investors are not forced to bear it, the market offers zero risk premium for it.' }
];

let examS = { cur: 0, answered: [], score: 0, done: false };
function initExam() {
  examS = { cur: 0, answered: Array(examQ.length).fill(null), score: 0, done: false };
  renderExam();
}
function renderExam() {
  const mount = document.getElementById('exam-mount');
  if (examS.done) {
    const pct = Math.round(examS.score / examQ.length * 100);
    mount.innerHTML = `<div class="quiz-card results-card">
      <div class="score-ring">${examS.score}/${examQ.length}</div>
      <h3 style="margin-bottom:8px">${pct>=80?'🎉 Exam Ready!':pct>=60?'👍 Good job — review mistakes':'📚 More revision needed'}</h3>
      <p style="color:var(--text2);font-size:13px">${pct}% — ${pct>=60?'Pass':'Below passing threshold'}</p>
      <div class="results-grid" style="margin-top:16px">
        <div class="stat-card"><div class="n" style="font-size:20px">${examS.score}</div><div class="l">Correct</div></div>
        <div class="stat-card"><div class="n" style="font-size:20px">${examQ.length-examS.score}</div><div class="l">Wrong</div></div>
        <div class="stat-card"><div class="n" style="font-size:20px">${pct}%</div><div class="l">Score</div></div>
      </div>
      <button class="quiz-btn" id="exam-retry">Retake exam</button>
      <button class="quiz-btn secondary" id="exam-home">Back to topics</button>
    </div>`;
    document.getElementById('exam-retry').onclick = initExam;
    document.getElementById('exam-home').onclick = () => nav('home', document.querySelector('[onclick*=home]'));
    return;
  }
  const q = examQ[examS.cur];
  const a = examS.answered[examS.cur];
  const pct = Math.round(examS.cur / examQ.length * 100);
  let opts = q.opts.map((o, i) => {
    let cls = 'opt';
    if (a !== null) {
      if (i === q.ans) cls += ' correct';
      else if (i === a) cls += ' wrong';
    }
    return `<div class="${cls}" data-idx="${i}"><span class="opt-key">${o[0]})</span>${o.slice(3)}</div>`;
  }).join('');
  let fb = '';
  if (a !== null) {
    const ok = a === q.ans;
    fb = `<div class="feedback ${ok?'ok':'bad'}"><strong>${ok?'✓ Correct!':'✗ Incorrect.'}</strong> ${q.exp}</div>`;
  }
  const isLast = examS.cur === examQ.length - 1;
  mount.innerHTML = `<div class="quiz-wrap">
    <div class="quiz-header">
      <span>Question ${examS.cur+1} of ${examQ.length}</span>
      <span>Score: ${examS.score} / ${examS.cur}</span>
    </div>
    <div class="qprog"><div class="qprog-fill" style="width:${pct}%"></div></div>
    <div class="quiz-card">
      <div class="quiz-q">${q.q}</div>
      <div class="options-container">${opts}</div>
      ${fb}
      ${a !== null ? `<button class="quiz-btn" id="exam-next">${isLast ? 'See results →' : 'Next →'}</button>` : ''}
    </div>
  </div>`;

  mount.querySelectorAll('.opt').forEach(opt => {
      opt.onclick = () => {
          if (examS.answered[examS.cur] !== null) return;
          const idx = parseInt(opt.dataset.idx);
          examS.answered[examS.cur] = idx;
          if (idx === q.ans) examS.score++;
          renderExam();
      };
  });

  if (a !== null) {
      document.getElementById('exam-next').onclick = () => {
          if (isLast) examS.done = true;
          else examS.cur++;
          renderExam();
      };
  }
}

// ── AI TUTOR ──
const aiConversation = [];
window.prefill = function(txt) {
  document.getElementById('ai-input').value = txt;
  askAI();
};

window.askAI = async function() {
  const inp = document.getElementById('ai-input');
  const q = inp.value.trim();
  if (!q) return;

  // Use Vite environment variable
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    const history = document.getElementById('ai-history');
    history.innerHTML += `<div class="ai-msg bot">Error: API Key not found in environment variables (.env). Please check your setup.</div>`;
    return;
  }

  inp.value = '';
  const history = document.getElementById('ai-history');
  history.innerHTML += `<div class="ai-msg user">${q}</div>`;
  history.innerHTML += `<div class="ai-msg bot" id="ai-pending"><span class="spinner"></span> Thinking...</div>`;
  history.scrollTop = history.scrollHeight;
  aiConversation.push({ role: 'user', content: q });
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an expert SFM (Strategic Financial Management) tutor for a university exam. Topics in scope: CAPM, Beta, systematic vs unsystematic risk, DCF valuation, Terminal Value (Gordon Growth Model), NPV, IRR (including failure cases: financing projects and multiple IRR), DuPont analysis (ROE decomposition), FCFF computation (EBIT method), WACC, Net Working Capital (subtract vs add logic), reinvestment rate. Answer concisely (4-7 lines). Use plain text, no markdown. Show formulas and plug in numbers when relevant. Focus on what matters for exams — common mistakes, traps, and the intuition behind the answer.`
          },
          ...aiConversation
        ]
      })
    });
    const d = await r.json();

    if (r.status === 401) {
      document.getElementById('ai-pending').outerHTML = `<div class="ai-msg bot">Invalid API Key in .env. Please check your configuration.</div>`;
      return;
    }

    const reply = d.choices?.[0]?.message?.content || 'Sorry, could not get a response. Try again.';
    aiConversation.push({ role: 'assistant', content: reply });
    document.getElementById('ai-pending').outerHTML = `<div class="ai-msg bot">${reply}</div>`;
  } catch (e) {
    document.getElementById('ai-pending').outerHTML = `<div class="ai-msg bot">Error reaching AI. Check your connection or API key and try again.</div>`;
  }
  history.scrollTop = history.scrollHeight;
};

// Initialize topic quizzes
setTimeout(() => {
  ['capm','dcf','irr','dupont','fcff'].forEach(t => {
    const el = document.getElementById(t + '-quiz');
    if (el) renderQuiz(t, t + '-quiz');
  });
}, 300);

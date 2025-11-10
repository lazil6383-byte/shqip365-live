const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function fmtDate(d){
  const dt = new Date(d);
  const day = dt.toLocaleDateString('sq-AL', { weekday:'short', day:'2-digit', month:'short' });
  const time = dt.toLocaleTimeString('sq-AL', { hour:'2-digit', minute:'2-digit' });
  return `${day} • ${time}`;
}

function statusBadge(s){
  if (s === 'IN_PLAY') return `<span class="badge live">LIVE</span>`;
  if (s === 'FINISHED') return `<span class="badge fin">Përfunduar</span>`;
  return `<span class="badge soon">Së shpejti</span>`;
}

function card(m){
  const home = m.homeTeam?.name || '—';
  const away = m.awayTeam?.name || '—';
  const scH = m.score?.fullTime?.home ?? '';
  const scA = m.score?.fullTime?.away ?? '';
  const score = (m.status === 'IN_PLAY' || m.status === 'FINISHED') ? `${scH} - ${scA}` : '—';
  const lg = m.league?.name || '';
  const when = fmtDate(m.utcDate);

  return `
  <div class="card">
    <div class="league">
      <span>${lg}</span>
      <span>${statusBadge(m.status)}</span>
    </div>
    <div class="row">
      <div class="team"><span class="name">${home}</span></div>
      <div class="vs">
        <div class="score">${score}</div>
        <div class="kick">${when}</div>
      </div>
      <div class="team" style="justify-content:flex-end"><span class="name" style="text-align:right">${away}</span></div>
    </div>
  </div>`;
}

async function load(endpoint, targetSel){
  const el = $(targetSel);
  el.innerHTML = `<div class="card">Duke ngarkuar…</div>`;
  try{
    const r = await fetch(endpoint);
    const data = await r.json();
    const list = data.matches || [];
    if (!list.length){
      el.innerHTML = `<div class="card">S’ka të dhëna për tani.</div>`;
      return;
    }
    el.innerHTML = list.map(card).join('');
  }catch(e){
    el.innerHTML = `<div class="card">Gabim gjatë ngarkimit.</div>`;
  }
}

function wireTabs(){
  $$('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const t = btn.dataset.target;
      $$('.panel').forEach(p=>p.classList.remove('visible'));
      $('#'+t).classList.add('visible');
      // ringarko kur hapet paneli
      if (t==='live') load('/api/live','#liveList');
      if (t==='upcoming') load(`/api/upcoming?days=${$('#upcDays').value}`,'#upcomingList');
      if (t==='finished') load(`/api/finished?days=${$('#finDays').value}`,'#finishedList');
    });
  });
}

function wireFilters(){
  $('#upcDays').addEventListener('change', ()=>{
    load(`/api/upcoming?days=${$('#upcDays').value}`,'#upcomingList');
  });
  $('#finDays').addEventListener('change', ()=>{
    load(`/api/finished?days=${$('#finDays').value}`,'#finishedList');
  });
}

async function bootstrap(){
  wireTabs();
  wireFilters();
  // ringarko automatikisht “live” çdo 30s
  setInterval(()=> load('/api/live','#liveList'), 30000);

  // ngarkesat e para
  await load('/api/live','#liveList');
  await load(`/api/upcoming?days=${$('#upcDays').value}`,'#upcomingList');
  await load(`/api/finished?days=${$('#finDays').value}`,'#finishedList');
}
bootstrap();

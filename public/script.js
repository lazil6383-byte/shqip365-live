const list = document.getElementById('list');
const loading = document.getElementById('loading');
const empty = document.getElementById('empty');
const tabs = document.querySelectorAll('.tab');

let activeTab = 'live';

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    load();
  });
});

function badge(txt){ return `<span class="badge">${txt}</span>`; }
function fmtDate(d){
  try{
    return new Date(d).toLocaleString('sq-AL',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'});
  }catch{ return d || '' }
}

function normalize(items){
  const out = [];
  // SportMonks
  if (items.sportmonks?.data){
    for (const fx of items.sportmonks.data){
      const home = fx?.participants?.find?.(p => p?.meta?.location === 'home')?.name || fx?.localteam?.name || '';
      const away = fx?.participants?.find?.(p => p?.meta?.location === 'away')?.name || fx?.visitorteam?.name || '';
      const league = fx?.league?.name || fx?.league?.data?.name || 'Liga';
      const status = fx?.state?.name || fx?.time?.status || fx?.status || '';
      const scoreH = fx?.scores?.localteam_score ?? fx?.scores?.localteam?.score ?? fx?.result?.home;
      const scoreA = fx?.scores?.visitorteam_score ?? fx?.scores?.visitorteam?.score ?? fx?.result?.away;
      out.push({
        source: 'SM',
        league,
        home, away,
        score: (scoreH!=null && scoreA!=null) ? `${scoreH} - ${scoreA}` : '',
        starts: fx?.starting_at || fx?.time?.starting_at || fx?.time?.startingAt,
        status
      });
    }
  }
  // Football-Data
  if (items.footballdata?.matches){
    for (const m of items.footballdata.matches){
      out.push({
        source: 'FD',
        league: m?.competition?.name || 'Liga',
        home: m?.homeTeam?.name,
        away: m?.awayTeam?.name,
        score: (m?.score?.fullTime?.homeTeam != null && m?.score?.fullTime?.awayTeam != null)
                ? `${m.score.fullTime.homeTeam} - ${m.score.fullTime.awayTeam}` : '',
        starts: m?.utcDate,
        status: m?.status
      });
    }
  }
  return out;
}

async function load(){
  loading.classList.remove('hidden');
  empty.classList.add('hidden');
  list.innerHTML = '';

  let endpoint = '/api/live';
  if (activeTab === 'upcoming') endpoint = '/api/upcoming';
  if (activeTab === 'finished') endpoint = '/api/finished';

  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    const data = await res.json();
    const combined = normalize(data);

    // filtro sipas tabit
    const filtered = combined.filter(row => {
      const st = (row.status || '').toUpperCase();
      if (activeTab === 'live') return ['LIVE','IN_PLAY','INPLAY','PLAYING'].some(s => st.includes(s)) || st === '1H' || st === '2H';
      if (activeTab === 'upcoming') return ['NS','TIMED','SCHEDULED','NOT_STARTED'].some(s => st.includes(s)) || row.score === '';
      if (activeTab === 'finished') return ['FT','FINISHED','AET','PEN'].some(s => st.includes(s));
      return true;
    });

    if (!filtered.length){
      empty.classList.remove('hidden');
    } else {
      for (const m of filtered){
        const card = document.createElement('div');
        card.className = 'card' + (activeTab==='live' ? ' live' : '');
        card.innerHTML = `
          <div class="league">${m.league} ${badge(m.source)}</div>
          <div class="row">
            <div class="team">${m.home || '-'}</div>
            <div class="vs">vs</div>
            <div class="team">${m.away || '-'}</div>
          </div>
          <div class="row">
            <div class="status">${m.status || ''}</div>
            <div class="time">${m.score || fmtDate(m.starts)}</div>
          </div>
        `;
        list.appendChild(card);
      }
    }
  } catch (e){
    empty.classList.remove('hidden');
    empty.textContent = 'S’u morën dot ndeshjet. Provo përsëri.';
  } finally {
    loading.classList.add('hidden');
  }
}

// ngarko fillimisht dhe rifresko çdo 60s
load();
setInterval(load, 60000);

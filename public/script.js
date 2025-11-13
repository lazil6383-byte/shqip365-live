const list = document.getElementById('list');
const loading = document.getElementById('loading');
const empty = document.getElementById('empty');
const tabs = document.querySelectorAll('.tab');

let activeTab = 'live';

// Tabs
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    load();
  });
});

function badge(txt){ 
  return `<span class="badge">${txt}</span>`; 
}

function formatDate(date){
  try {
    return new Date(date).toLocaleString('sq-AL',{
      hour:'2-digit',
      minute:'2-digit',
      day:'2-digit',
      month:'short'
    });
  } catch {
    return date;
  }
}

// NORMALIZIMI NGA API PIRATE
function normalize(data){
  const out = [];

  if (data.data) {
    data.data.forEach(m => {
      out.push({
        league: m.league_name || "Liga",
        home: m.home || "-",
        away: m.away || "-",
        score: m.score || "",
        time: m.time || "",
        status: m.status || "",
        source: "LS"
      });
    });
  }

  return out;
}

// LOAD
async function load(){
  loading.classList.remove('hidden');
  empty.classList.add('hidden');
  list.innerHTML = '';

  let endpoint = '/api/live';
  if(activeTab === 'upcoming') endpoint = '/api/upcoming';
  if(activeTab === 'finished') endpoint = '/api/finished';

  try{
    const res = await fetch(endpoint, { cache: "no-store" });
    const data = await res.json();

    const games = normalize(data);

    if(games.length === 0){
      empty.classList.remove('hidden');
      return;
    }

    games.forEach(m => {
      const box = document.createElement('div');
      box.className = "match";

      box.innerHTML = `
        <div class="league">${m.league} ${badge(m.source)}</div>

        <div class="teams">
          <div>${m.home}</div>
          <div class="vs">vs</div>
          <div>${m.away}</div>
        </div>

        <div class="info">
          <span>${m.status}</span>
          <span>${m.score || formatDate(m.time)}</span>
        </div>
      `;

      list.appendChild(box);
    });

  } catch (err){
    empty.classList.remove('hidden');
    empty.textContent = 'S’u morën dot ndeshjet. Provo përsëri.';
  } finally {
    loading.classList.add('hidden');
  }
}

load();
setInterval(load, 30000);

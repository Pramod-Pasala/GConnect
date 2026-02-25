// ── Live random background ──
(function () {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  const COLORS = [
    [56, 189, 248],   // sky blue
    [167, 139, 250],  // violet
    [244, 114, 182],  // pink
    [52, 211, 153],   // emerald
    [251, 146, 60],   // orange
    [129, 140, 248],  // indigo
    [45, 212, 191],   // teal
  ];

  let orbs = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createOrb() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const radius = randomBetween(120, 350);
    return {
      x: randomBetween(-radius, w + radius),
      y: randomBetween(-radius, h + radius),
      radius,
      color,
      opacity: randomBetween(0.08, 0.25),
      vx: randomBetween(-0.3, 0.3),
      vy: randomBetween(-0.2, 0.2),
      drift: randomBetween(0.3, 1.2),
      phase: randomBetween(0, Math.PI * 2),
      pulseSpeed: randomBetween(0.002, 0.008),
      pulseAmp: randomBetween(0.15, 0.35),
    };
  }

  function initOrbs() {
    const count = Math.floor(randomBetween(10, 16));
    orbs = [];
    for (let i = 0; i < count; i++) {
      orbs.push(createOrb());
    }
  }

  function drawOrb(orb) {
    const pulse = 1 + Math.sin(orb.phase) * orb.pulseAmp;
    const r = orb.radius * pulse;
    const [cr, cg, cb] = orb.color;

    const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},${orb.opacity})`);
    grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${orb.opacity * 0.4})`);
    grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

    ctx.beginPath();
    ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    for (const orb of orbs) {
      // Move
      orb.x += orb.vx + Math.sin(orb.phase * 0.7) * orb.drift * 0.15;
      orb.y += orb.vy + Math.cos(orb.phase * 0.5) * orb.drift * 0.1;
      orb.phase += orb.pulseSpeed;

      // Wrap around edges with padding
      const pad = orb.radius * 1.5;
      if (orb.x < -pad) orb.x = w + pad;
      if (orb.x > w + pad) orb.x = -pad;
      if (orb.y < -pad) orb.y = h + pad;
      if (orb.y > h + pad) orb.y = -pad;

      drawOrb(orb);
    }

    requestAnimationFrame(animate);
  }

  resize();
  initOrbs();
  animate();

  window.addEventListener('resize', () => {
    resize();
  }, { passive: true });
})();

// ── Supabase config ──
const SUPABASE_URL = "https://osmaoufzgyaqbkqaekwx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uKzdWa4FzOFpxJTtGnzzBg_v5z9tzoD";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ── DOM elements ──
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const statsBar = document.getElementById('statsBar');
const contactBadge = document.getElementById('contactBadge');
const backToTop = document.getElementById('backToTop');

let rows = [];

// ── Avatar color palette ──
const AVATAR_COLORS = [
  'linear-gradient(135deg, #38bdf8, #818cf8)',
  'linear-gradient(135deg, #a78bfa, #f472b6)',
  'linear-gradient(135deg, #34d399, #38bdf8)',
  'linear-gradient(135deg, #fb923c, #f472b6)',
  'linear-gradient(135deg, #38bdf8, #34d399)',
  'linear-gradient(135deg, #818cf8, #c084fc)',
  'linear-gradient(135deg, #f472b6, #fb923c)',
  'linear-gradient(135deg, #fbbf24, #f97316)',
  'linear-gradient(135deg, #2dd4bf, #3b82f6)',
  'linear-gradient(135deg, #e879f9, #6366f1)',
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getAvatarColor(name) {
  return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];
}

// ── Skeleton loader ──
function showSkeletons(count = 6) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton-card';
    skel.style.animationDelay = `${i * 0.08}s`;
    skel.innerHTML = `
      <div class="skeleton-header">
        <div class="skeleton-circle"></div>
        <div class="skeleton-lines">
          <div class="skeleton-row" style="width:65%"></div>
          <div class="skeleton-row" style="width:45%"></div>
        </div>
      </div>
      <div class="skeleton-row" style="width:40%"></div>
      <div style="display:flex;gap:0.65rem;margin-top:auto;">
        <div class="skeleton-row" style="flex:1;height:36px;border-radius:10px"></div>
        <div class="skeleton-row" style="flex:1;height:36px;border-radius:10px"></div>
      </div>
    `;
    grid.appendChild(skel);
  }
}

// ── Stats ──
function updateStats(data) {
  const totalContacts = data.length;
  const companies = new Set(data.map(r => r.company).filter(Boolean));
  const locations = new Set(data.map(r => r.location).filter(Boolean));

  document.getElementById('statContacts').textContent = totalContacts;
  document.getElementById('statCompanies').textContent = companies.size;
  document.getElementById('statLocations').textContent = locations.size;
  statsBar.style.display = 'flex';

  document.getElementById('badgeCount').textContent = totalContacts;
  contactBadge.style.display = 'inline-flex';
}

// ── Render cards ──
function render(data) {
  grid.innerHTML = '';

  if (!data.length) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  data.forEach((person, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${i * 0.06}s`;

    const initials = getInitials(person.name);
    const avatarBg = getAvatarColor(person.name);

    const emailIcon = `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>`;
    const linkedInIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
    const locationIcon = `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>`;

    card.innerHTML = `
      <div class="card-header">
        <div class="avatar" style="background:${avatarBg}">${initials}</div>
        <div class="card-header-text">
          <div class="name" title="${person.name}">${person.name}</div>
          <div class="role">${person.position || ''} ${person.position && person.company ? '·' : ''} ${person.company || ''}</div>
        </div>
      </div>
      <div class="meta">
        ${person.location ? `<span>${locationIcon} ${person.location}</span>` : ''}
      </div>
      <div class="actions">
        ${person.email ? `<a class="btn" href="mailto:${person.email}">${emailIcon} Email</a>` : ''}
        ${person.linkedin_profile ? `<a class="btn primary" href="${person.linkedin_profile}" target="_blank" rel="noopener">${linkedInIcon} LinkedIn</a>` : ''}
      </div>
    `;

    grid.appendChild(card);
  });
}

// ── Load data ──
async function loadData() {
  showSkeletons();

  const { data, error } = await supabaseClient.rpc('get_public_contacts');

  if (error) {
    console.error(error);
    grid.innerHTML = '<div class="empty">Failed to load data</div>';
    return;
  }

  rows = (data || []).filter(r => r.email || r.linkedin_profile);
  updateStats(rows);
  render(rows);
}

// ── Search ──
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  clearBtn.style.display = q ? 'flex' : 'none';

  const filtered = rows.filter(r =>
    [r.name, r.position, r.company, r.location]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
  render(filtered);
});

// ── Clear button ──
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.style.display = 'none';
  searchInput.focus();
  render(rows);
});

// ── Back to top ──
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Init ──
loadData();

// 1. Replace with your Supabase credentials
    const SUPABASE_URL = "https://osmaoufzgyaqbkqaekwx.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uKzdWa4FzOFpxJTtGnzzBg_v5z9tzoD";

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const grid = document.getElementById('grid');
    const empty = document.getElementById('empty');
    const searchInput = document.getElementById('searchInput');

    let rows = [];

    async function loadData() {
      const { data, error } = await supabaseClient
        .rpc('get_public_contacts');

      if (error) {
        console.error(error);
        grid.innerHTML = '<div class="empty">Failed to load data</div>';
        return;
      }

      // Enforce: email OR linkedin must exist
      rows = (data || []).filter(r => r.email || r.linkedin_profile);
      render(rows);
    }

    function render(data) {
      grid.innerHTML = '';

      if (!data.length) {
        empty.style.display = 'block';
        return;
      }

      empty.style.display = 'none';

      data.forEach(person => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
          <h3 class="name">${person.name}</h3>
          <div class="role">${person.position} · ${person.company}</div>
          <div class="meta">
            <span>${person.location}</span>
          </div>
          <div class="actions">
            ${person.email ? `<a class="btn" href="mailto:${person.email}">Email</a>` : ''}
            ${person.linkedin_profile ? `<a class="btn primary" href="${person.linkedin_profile}" target="_blank">LinkedIn</a>` : ''}
          </div>
        `;

        grid.appendChild(card);
      });
    }

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const filtered = rows.filter(r =>
        [r.name, r.position, r.company, r.location]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
      render(filtered);
    });

    loadData();

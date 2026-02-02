// 1. Replace with your Supabase credentials
    const SUPABASE_URL = "https://osmaoufzgyaqbkqaekwx.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbWFvdWZ6Z3lhcWJrcWFla3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODUwMzQsImV4cCI6MjA4NDI2MTAzNH0.HWD_DaOXXTKvyM5M-YQuhW2c32Y-uiX2vQKdPOWfp8A";

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const grid = document.getElementById('grid');
    const empty = document.getElementById('empty');
    const searchInput = document.getElementById('searchInput');

    let rows = [];

    async function loadData() {
      const { data, error } = await supabaseClient
        .from('contacts') // <-- your table name
        .select('name, position, company, location, email, linkedin_profile');

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
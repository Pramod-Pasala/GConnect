const SUPABASE_URL = "https://osmaoufzgyaqbkqaekwx.supabase.c";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbWFvdWZ6Z3lhcWJrcWFla3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODUwMzQsImV4cCI6MjA4NDI2MTAzNH0.HWD_DaOXXTKvyM5M-YQuhW2c32Y-uiX2vQKdPOWfp8A";

async function loadContacts() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/gconnect_contacts?select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const data = await res.json();
  const container = document.getElementById("cards");

  data.forEach(person => {
    const card = document.createElement("div");
    card.className = "card";

    let contacts = "";
    if (person.contact_email) {
      contacts += `<a href="mailto:${person.contact_email}">📧 Email</a>`;
    }
    if (person.contact_linkedin) {
      contacts += `<a href="${person.contact_linkedin}" target="_blank">🔗 LinkedIn</a>`;
    }

    card.innerHTML = `
      <h3>${person.name}</h3>
      <p>${person.position || ""}</p>
      <p><strong>${person.company || ""}</strong></p>
      <p>${person.location || ""}</p>
      <div class="contact">${contacts}</div>
    `;

    container.appendChild(card);
  });
}

loadContacts();

fetch('https://osmaoufzgyaqbkqaekwx.supabase.co/rest/v1/jobs?approved=eq.true&order=created_at.desc',{
 headers: {
   apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbWFvdWZ6Z3lhcWJrcWFla3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODUwMzQsImV4cCI6MjA4NDI2MTAzNH0.HWD_DaOXXTKvyM5M-YQuhW2c32Y-uiX2vQKdPOWfp8A'
 } 
})
  .then(res => {
    if (!res.ok) throw new Error('Failed to load jobs');
    return res.json();
  })
  .then(jobs => {
    document.getElementById('job-count').textContent = jobs.length;
    const grid = document.getElementById('jobs-grid');
    grid.innerHTML = '';

    jobs.forEach(job => {
      const card = document.createElement('div');
      card.className =
        "bg-white rounded-lg border p-4 shadow-sm hover:shadow-lg transition";

      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold text-lg">${job.title}</h3>
          <span class="px-2 py-1 rounded text-xs font-medium ${
            job.type === 'Full-time'
              ? 'bg-green-100 text-green-800'
              : job.type === 'Internship'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-yellow-100 text-yellow-800'
          }">${job.type}</span>
        </div>
        <p class="text-sm text-gray-500 mb-2">${job.company}</p>
        <p class="text-sm text-gray-400 mb-2">
          ${job.location} • <span class="font-medium">${job.start}</span>
        </p>
        <ul class="list-disc list-inside text-sm mb-2">
          ${(job.requirements || []).map(req => `<li>${req}</li>`).join('')}
        </ul>
        <p class="text-sm text-indigo-600 font-medium">
          Apply: ${job.apply}
        </p>
      `;

      grid.appendChild(card);
    });
  })
  .catch(err => console.error(err));

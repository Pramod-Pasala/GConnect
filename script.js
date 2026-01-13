<script>
fetch('./jobs.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load data');
    return res.json();
  })
  .then(data => {
    document.getElementById('data-title').textContent = data.title;

    const list = document.getElementById('data-list');
    list.innerHTML = '';

    data.stats.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
      list.appendChild(li);
    });
  })
  .catch(err => {
    document.getElementById('data-title').textContent = 'Error loading data';
    console.error(err);
  });
</script>

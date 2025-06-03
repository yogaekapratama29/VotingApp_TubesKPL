loadPollings();

async function createPolling() {
  const contributor = document.getElementById('contributor').value;
  const title = document.getElementById('title').value;
  const options = document.getElementById('options').value
    .split(',')
    .map((option) => option.trim());

  await fetch('/pollings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contributor,
      title,
      options,
    }),
  });

  alert('Polling berhasil dibuat!');
  
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCreate')).hide();
  contributor.value = '';
  title.value = '';
  options.value = '';

  loadPollings();
}

async function loadPollings() {
  const container = document.getElementById('pollings');
  
  const res = await fetch('/pollings');
  const pollings = await res.json();
  
  container.innerHTML = '';

  pollings.forEach(poll => {
    const div = document.createElement('div');
    
    div.innerHTML = `
      <div class="mb-3 p-3 shadow rounded">
        <p>${poll.title} by ${poll.contributor}</p>
        
        <div class="mb-3">
          <select id="choice-${poll.contributor}" class="form-control">
            ${poll.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </div>
        <div class="mb-3">
          <input type="text" id="voter-${poll.contributor}" placeholder="Nama Anda" class="form-control">
        </div>
        <div class="mb-3 d-grid gap-2 d-md-flex">
          <button class="btn btn-primary flex-fill" onclick="vote('${poll.contributor}')">Vote</button>
          <button class="btn btn-secondary flex-fill" onclick="showResults('${poll.contributor}')">Lihat Hasil</button>
          <button class="btn btn-danger flex-fill" onclick="deletePolling('${poll.contributor}')">Hapus Polling</button>
        </div>
        
        <div id="result-${poll.contributor}"></div>
      </div>
    `;

    container.appendChild(div);
  });
}

async function vote(contributor) {
  const voterName = document.getElementById(`voter-${contributor}`).value;
  const choice = document.getElementById(`choice-${contributor}`).value;

  await fetch(`/pollings/${contributor}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      voterName,
      choice,
    }),
  });
  alert('Vote berhasil!');
}
async function deletePolling(contributor) {
  const confirmDelete = confirm('Apakah Anda yakin ingin menghapus polling ini?');
  if (!confirmDelete) return;

  const res = await fetch(`/pollings/${contributor}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    alert('Polling berhasil dihapus.');
    loadPollings();
  } else {
    const errorData = await res.json();
    alert('Gagal menghapus polling: ' + errorData.message);
  }
}

async function showResults(contributor) {
  const res = await fetch(`/pollings/${contributor}/results`);
  const results = await res.json();
  const container = document.getElementById(`result-${contributor}`);
  container.innerHTML = '';

  for (const [option, count] of Object.entries(results)) {
    container.innerHTML += `<p>${option}: ${count} suara</p>`;
  }
}

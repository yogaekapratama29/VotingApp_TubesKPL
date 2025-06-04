loadPollings();

async function createPolling() {
  const kode = document.getElementById('kode').value;
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
      kode,
      contributor,
      title,
      options,
    }),
  });

  alert('Polling berhasil dibuat!');
  
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCreate')).hide();
  document.getElementById('kode').value = '';
  document.getElementById('contributor').value = '';
  document.getElementById('title').value = '';
  document.getElementById('options').value = '';

  loadPollings();
}

async function findPolling() {
  const container = document.getElementById('polling');
  const kode = document.getElementById('kodePolling').value;

  const res = await fetch(`/pollings/${kode}`);
  const polling = await res.json();

  container.innerHTML = '';
  const div = document.createElement('div');
  div.innerHTML = polling.contributor ? 
    `
    <div>
      <p>${polling?.title} by ${polling?.contributor} #${polling?.kode}</p>
      
      <div class="mb-3">
        <select id="choice-${polling?.kode}-create" class="form-control">
          ${polling?.options?.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      </div>
      <div class="mb-3">
        <input type="text" id="voter-${polling?.kode}-create" placeholder="Nama Anda" class="form-control">
      </div>
      <div class="mb-3 d-grid gap-2 d-md-flex">
        <button class="btn btn-primary flex-fill" onclick="vote('${polling?.kode}', 'create')">Vote</button>
      </div>
    </div>
  ` : `<p class="text-center text-muted">Polling not found</p>`;

  container.appendChild(div);
  document.getElementById('kodePolling').value = '';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPolling')).show();
}

async function findPollingManajemen() {
  const container = document.getElementById('pollingManajemen');
  const kode = document.getElementById('kodePollingManajemen').value;
  // const password = document.getElementById('passwordPollingManajemen').value;

  const res = await fetch(`/pollings/${kode}`);
  const polling = await res.json();
  console.log(polling);

  container.innerHTML = '';
  const div = document.createElement('div');
  div.innerHTML = polling.contributor ? 
    `
    <div>
      <p>${polling?.title} by ${polling?.contributor} #${polling?.kode}</p>
      
      <div class="mb-3">
        <select id="choice-${polling?.kode}-manajemen" class="form-control">
          ${polling?.options?.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      </div>
      <div class="mb-3">
        <input type="text" id="voter-${polling?.kode}-manajemen" placeholder="Nama Anda" class="form-control">
      </div>
      <div class="mb-3 d-grid gap-2 d-md-flex">
        <button class="btn btn-primary flex-fill" onclick="vote('${polling.kode}', 'manajemen')">Vote</button>
        <button class="btn btn-secondary flex-fill" onclick="showResults('${polling?.kode}', 'manajemen')">Lihat Hasil</button>
        <button class="btn btn-danger flex-fill" onclick="deletePolling('${polling?.kode}', 'manajemen')">Hapus Polling</button>
      </div>
      
      <div id="result-${polling?.kode}-manajemen"></div>
    </div>
  ` : `<p class="text-center text-muted">Polling not found</p>`;

  container.appendChild(div);
  document.getElementById('kodePollingManajemen').value = '';
  // document.getElementById('password').value = '';
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
        <p>${poll.title} by ${poll.contributor} #${poll.kode}</p>
        
        <div class="mb-3">
          <select name="choice-${poll.kode}-daftar" id="choice-${poll.kode}-daftar" class="form-control">
            ${poll.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </div>
        <div class="mb-3">
          <input type="text" name="voter-${poll.kode}-daftar" id="voter-${poll.kode}-daftar" placeholder="Nama Anda" class="form-control">
        </div>
        <div class="mb-3 d-grid gap-2 d-md-flex">
          <button class="btn btn-primary flex-fill" onclick="vote('${poll.kode}', 'daftar')">Vote</button>
          <button class="btn btn-secondary flex-fill" onclick="showResults('${poll.kode}', 'daftar')">Lihat Hasil</button>
          <button class="btn btn-danger flex-fill" onclick="deletePolling('${poll.kode}', 'daftar')">Hapus Polling</button>
        </div>
        
        <div id="result-${poll.kode}-daftar"></div>
      </div>
    `;

    container.appendChild(div);
  });
}

async function vote(kode, location) {
  const voterName = document.getElementById(`voter-${kode}-${location}`).value;
  const choice = document.getElementById(`choice-${kode}-${location}`).value;

  console.log(voterName, choice);

  await fetch(`/pollings/${kode}/vote`, {
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
  voterName.value = '';

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPolling')).hide();
}

async function deletePolling(kode, location) {
  const confirmDelete = confirm('Apakah Anda yakin ingin menghapus polling ini?');
  if (!confirmDelete) return;

  const res = await fetch(`/pollings/${kode}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    alert('Polling berhasil dihapus.');
    findPollingManajemen();
    loadPollings();
  } else {
    const errorData = await res.json();
    alert('Gagal menghapus polling: ' + errorData.message);
  }
}

async function showResults(kode, location) {
  const res = await fetch(`/pollings/${kode}/results`);
  const results = await res.json();
  const container = document.getElementById(`result-${kode}-${location}`);
  container.innerHTML = '';

  for (const [option, count] of Object.entries(results)) {
    container.innerHTML += `<p>${option}: ${count} suara</p>`;
  }

  console.log(results);
}

async function createPolling() {
  const contributor = document.getElementById('contributor').value;
  const title = document.getElementById('title').value;
  const options = document
    .getElementById('options')
    .value.split(',')
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
  loadPollings();
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

async function batalVote(contributor) {
    const voterName = document.getElementById(`voter-${contributor}`).value;
  
    if (!voterName) {
      alert('Masukkan nama Anda untuk membatalkan vote!');
      return;
    }
  
    const confirmCancel = confirm(`Yakin ingin membatalkan vote untuk ${voterName}?`);
    if (!confirmCancel) return;
  
    await fetch(`/pollings/${contributor}/cancelVote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterName })
    });
  
    alert('Vote berhasil dibatalkan!');
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

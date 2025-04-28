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

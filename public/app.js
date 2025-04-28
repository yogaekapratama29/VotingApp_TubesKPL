async function createPolling(){
    const contributor = document.getElementById('contributor').value;
    const title = document.getElementById('title').value;
    const options = document.getElementById('options').value.split(',').map(option => option.trim());

    await fetch('/pollings', {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
        },
        body : JSON.stringify({
            contributor,
            title,
            options,
        })
    });

    loadPollings();
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
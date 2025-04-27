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

/* 3. Fungsi untuk melakukan voting*/
async function vote(contributor) {
  //Mendapatkan nilai dari input form:
  // 1. Nama voter dari elemen dengan ID 'voter-{contributor}'
  const voterName = document.getElementById(`voter-${contributor}`).value;
  // 2. Pilihan vote dari dropdown/select dengan ID 'choice-{contributor}'
  const choice = document.getElementById(`choice-${contributor}`).value;

  // Mengirimkan data vote ke server menggunakan fetch API
  await fetch(`/pollings/${contributor}/vote`, {
    method: 'POST', // Metode HTTP POST
    headers: {
      'Content-Type': 'application/json', // Spesifikasikan tipe konten JSON
    },
    // Mengubah objek JavaScript ke format JSON
    body: JSON.stringify({
      voterName, // Nama voter yang mengisi form
      choice, //Pilihan yang dipilih
    }),
  });
  // Menampilkan notifikasi bahwa vote berhasil
  alert('Vote berhasil!');
}

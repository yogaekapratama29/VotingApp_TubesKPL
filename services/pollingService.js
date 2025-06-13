class PollingService {
  constructor() {
    // Implementasi Singleton: Pastikan hanya ada satu instansi PollingService
    if (PollingService.instance) {
      return PollingService.instance;
    }

    this.pollings = new Map();

    // Inisialisasi dengan data polling awal
    this.pollings.set('177013', {
      kode: '177013',
      contributor: 'Nizar',
      title: 'Anime Terbaik',
      options: ['Naruto', 'Wanpis', 'Bengdrim'],
      votes: new Map(),
      isClosed: false,
    });

    PollingService.instance = this;
  }

  getAllPollings() {
    return Array.from(this.pollings.values()).map((p) => ({
      kode: p.kode,
      contributor: p.contributor,
      title: p.title,
      options: p.options,
      isClosed: p.isClosed,
    }));
  }

  createPolling(pollingData) {
    const { kode, contributor, title, options } = pollingData;

    if (!kode || !contributor || !title || !options) {
      return { success: false, message: 'Data tidak valid' };
    }

    if (this.pollings.has(kode)) {
      return { success: false, message: 'Polling dengan kode ini sudah ada.' };
    }

    this.pollings.set(kode, {
      kode,
      contributor,
      title,
      options,
      votes: new Map(),
      isClosed: false,
    });
    return { success: true, message: 'Polling berhasil dibuat' };
  }

  getPollingByKode(kode) {
    const polling = this.pollings.get(kode);
    if (!polling) {
      return { success: false, message: 'Polling tidak ditemukan' };
    }
    return {
      success: true,
      polling: {
        kode: polling.kode,
        contributor: polling.contributor,
        title: polling.title,
        options: polling.options,
        isClosed: polling.isClosed,
      },
    };
  }

  deletePolling(kode) {
    if (!this.pollings.has(kode)) {
      return { success: false, message: 'Polling tidak ditemukan' };
    }
    this.pollings.delete(kode);
    return { success: true, message: 'Polling berhasil dihapus' };
  }

  recordVote(kode, voterName, choice) {
    const polling = this.pollings.get(kode);
    if (!polling || polling.isClosed) {
      return { success: false, message: 'Polling tidak ditemukan atau sudah ditutup' };
    }
    if (!polling.options.includes(choice)) { // Tambahan validasi: pilihan harus ada di opsi polling
      return { success: false, message: 'Pilihan suara tidak valid' };
    }
    polling.votes.set(voterName, choice);
    return { success: true, message: 'Suara berhasil disimpan' };
  }

  getPollingResults(kode) {
    const polling = this.pollings.get(kode);
    if (!polling) {
      return { success: false, message: 'Polling tidak ditemukan' };
    }
    const result = {};
    polling.options.forEach(opt => result[opt] = 0);
    for (const vote of polling.votes.values()) {
      result[vote]++;
    }
    return { success: true, results: result };
  }

  // Metode untuk pengujian: reset state
  _resetState() {
    this.pollings.clear();
    this.pollings.set('177013', {
      kode: '177013',
      contributor: 'Nizar',
      title: 'Anime Terbaik',
      options: ['Naruto', 'Wanpis', 'Bengdrim'],
      votes: new Map(),
      isClosed: false,
    });
  }

  // Metode untuk pengujian: mendapatkan polling tertentu untuk manipulasi langsung (misal isClosed)
  _getRawPolling(kode) {
    return this.pollings.get(kode);
  }
}

// Ekspor instansi tunggal dari PollingService
module.exports = new PollingService();
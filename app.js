const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.static('public'));

// Endpoint pencarian MapTiler
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    const apiKey = 'kFejrQljGKQoCC4cElQG';

    if (!query) {
        return res.status(400).json({ message: 'Query pencarian tidak boleh kosong' });
    }

    try {
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}`;
        const response = await axios.get(url);

        if (response.data.features && response.data.features.length > 0) {
            const feature = response.data.features[0];
            const context = feature.context || [];

            // Ambil data wilayah dari context MapTiler
            const countryObj = context.find(c => c.id.startsWith('country'));
            const regionObj = context.find(c => c.id.startsWith('region') || c.id.startsWith('province'));
            const subregionObj = context.find(c => c.id.startsWith('subregion') || c.id.startsWith('district') || c.id.startsWith('municipality'));

            // Mengirim data JSON yang sesuai dengan ID di index.html
            res.json({
                negara: countryObj ? countryObj.text : 'Indonesia',
                provinsi: regionObj ? regionObj.text : '-',
                kecamatan: subregionObj ? subregionObj.text : (feature.text || '-'),
                longitude: feature.center[0],
                latitude: feature.center[1]
            });
        } else {
            res.status(404).json({ message: 'Lokasi tidak ditemukan' });
        }
    } catch (error) {
        console.error("Error MapTiler API:", error.message);
        res.status(500).json({ message: 'Gagal mengambil data dari MapTiler' });
    }
});

app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});
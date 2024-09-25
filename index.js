const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.get('/laptops', async (req, res) => {
    try {
        const response = await axios.get('https://webscraper.io/test-sites/e-commerce/static/computers/laptops');
        // Aqui faremos o scraping da página
        res.json(response.data);
    } catch (error) {
        console.log('fetchData() - Erro ao acessar os dados:', error);
        res.status(500).send('Erro ao acessar os dados');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

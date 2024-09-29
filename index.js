const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = 3000;

app.get('/laptops', async (req, res) => {
    try {
        const response = await axios.get('https://webscraper.io/test-sites/e-commerce/static/computers/laptops');
        const html = response.data;
        const $ = cheerio.load(html);

        let laptops = [];

        $('.thumbnail').each((index, element) => {
            const title = $(element).find('.title').text();
            const price = $(element).find('.price').text().replace('$', '');
            const description = $(element).find('.description').text();
            const reviews = $(element).find('.ratings .review-count').text();


            laptops.push({
                title,
                price: parseFloat(price),
                description,
                reviews,

            });
        });

        laptops.sort((a, b) => a.price - b.price);

        res.json(laptops);
    } catch (error) {
        console.log('fetchData() - Erro ao acessar os dados:', error);
        res.status(500).send('Erro ao acessar os dados');
    }
});



app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

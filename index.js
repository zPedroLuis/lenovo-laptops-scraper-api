const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = 3000;

app.get('/laptops', async (req, res) => {
    try {
        let page = 1;
        let laptops = [];
        let hasNextPage = true;

        while (hasNextPage) {
            const response = await axios.get(`https://webscraper.io/test-sites/e-commerce/static/computers/laptops?page=${page}`);
            const html = response.data;
            const $ = cheerio.load(html);

            let laptopsOnPage = [];

            $('.thumbnail').each((index, element) => {
                const title = $(element).find('.title').text().trim();

                const price = $(element).find('.price').text().replace('$', '');
                const description = $(element).find('.description').text();
                const reviews = $(element).find('.ratings.review-count').text();
                const stars = $(element).find('.ratings.ws-icon-star').length;
                const image = $(element).find('img').attr('src');
                const productUrl = 'https://webscraper.io' + $(element).find('.title').attr('href');

                laptopsOnPage.push({
                    title,
                    price: parseFloat(price),
                    description,
                    reviews,
                    stars,
                    image,
                    productUrl
                });
            });

            if (laptopsOnPage.length === 0) {
                hasNextPage = false;
            } else {
                laptops = laptops.concat(laptopsOnPage);
                page++;
            }
        }

        // Aplicar a condição de filtro aqui
        const filteredLaptops = laptops.filter(item =>
            item.title.toLowerCase().includes('lenovo')
        );

        // Ordenar os resultados
        filteredLaptops.sort((a, b) => a.price - b.price);

        res.json(filteredLaptops);
    } catch (error) {
        console.log('fetchData() - Erro ao acessar os dados:', error);
        res.status(500).send('Erro ao acessar os dados');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

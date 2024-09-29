const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = 3000;

// Função para extrair detalhes de cada produto
const fetchProductDetails = async (productUrl) => {
    try {
        const productPage = await axios.get(productUrl);
        const productHtml = productPage.data;
        const $productPage = cheerio.load(productHtml);
        const fullTitle = $productPage('.caption h4.card-title').text().trim();
        return fullTitle;
    } catch (error) {
        console.log(`Erro ao acessar página de produto: ${productUrl}`, error);
        return null; // Caso de erro, retornar null
    }
};

app.get('/laptops', async (req, res) => {
    try {
        let page = 1;
        let laptops = [];
        let hasNextPage = true;

        while (hasNextPage) {
            const response = await axios.get(`https://webscraper.io/test-sites/e-commerce/static/computers/laptops?page=${page}`);
            const html = response.data;
            const $ = cheerio.load(html);

            const productRequests = $('.thumbnail').map(async (index, element) => {
                const productUrl = 'https://webscraper.io' + $(element).find('.title').attr('href');
                const price = $(element).find('.price').text().replace('$', '');
                const description = $(element).find('.description').text();
                const reviews = $(element).find('.ratings .review-count').text().trim();
                const stars = $(element).find('.ratings .ws-icon-star').length;
                const image = $(element).find('img').attr('src');

                // Fazendo uma requisição para a página de detalhes do produto
                const fullTitle = await fetchProductDetails(productUrl);

                return {
                    title: fullTitle,
                    price: parseFloat(price),
                    description,
                    reviews,
                    stars,
                    image,
                    productUrl
                };
            }).get();

            const laptopsOnPage = await Promise.all(productRequests);

            if (laptopsOnPage.length === 0 || laptopsOnPage.every(item => item === null)) {
                hasNextPage = false;
            } else {
                laptops = laptops.concat(laptopsOnPage.filter(item => item !== null));
                page++;
            }
        }

        // Filtrar apenas os produtos Lenovo e ordenar
        const filteredLaptops = laptops.filter(item =>
            item.title && item.title.toLowerCase().includes('lenovo')
        );
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

const input = require('input');
const axios = require('axios');
const qs = require('querystring');
const crypto = require('crypto');
const config = require('../config.json');

function encode(apisecret, requestData) {
    return crypto.createHmac('sha256', apisecret).update(requestData).digest('hex');
}

async function request(method, endpoint, request, data) {
    data.timestamp = Date.now();
    let apikey = config.keys.apiKey;
    let apisecret = config.keys.apiSecret;

    const dataQueryString = qs.stringify(data);
    const signature = encode(apisecret, dataQueryString);
    const requestConfig = {
        method: method,
        url: endpoint + request + '?' + dataQueryString + '&signature=' + signature,
        headers: {
            'X-MBX-APIKEY': apikey
        }
    };

    try {
        const response = await axios(requestConfig).then(r => r.data);
        return response;
    }
    catch (err) {
        return err.response.data;
    }
}

async function main() {
    const network = await input.text("Сеть:");
    const token = await input.text("Токен:");
    const amount = await input.text("Количество:");
    
    config.addresses.forEach(async (_address) => {
        let data = await request(
            'POST',
            'https://api.binance.com',
            '/sapi/v1/capital/withdraw/apply',
            {
                coin: token,
                network: network,
                address: _address,
                amount: amount
            }
        );

        console.log('\n', data);
    });
}

main();
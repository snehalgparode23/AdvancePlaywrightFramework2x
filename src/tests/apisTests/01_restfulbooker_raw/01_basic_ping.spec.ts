import {test, expect} from '@playwright/test';
//https://restful-booker.herokuapp.com

    test('Ping-request-GET', async ({ request }) => {
        const responsedata = await request.get('https://restful-booker.herokuapp.com/ping');
        console.log(responsedata);
        expect(responsedata.status()).toBe(201);
    });

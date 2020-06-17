import {serve} from 'https://deno.land/std@0.53.0/http/server.ts'
import getEnv  from 'https://raw.githubusercontent.com/yababay/deno-env-filter/master/mod.js'
import Abaya   from './mod.js'

const port = +getEnv('HTTP_PORT')
const abaya = new Abaya()

console.log(`http:\/\/localhost:${port}/`)

for await (const req of serve({port})) {
    console.log(req.url)
    console.log(req.method)
    let body = JSON.stringify(true), status = 200, contentType = 'application/json'
    try{
        const query = await abaya.transformRequest(req)
        console.log(query)
    }
    catch(err){
        console.log(err)
        body = 'Error'
        status = typeof err == 'number' && err || 599
        contentType = 'text/plain'
    }
    const headers = new Map([['content-type', contentType]])
    req.respond({body, headers, status})
}


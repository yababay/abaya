import getEnv from 'https://raw.githubusercontent.com/yababay/deno-env-filter/master/mod.js'

const API_SPLITTER = getEnv('API_SPLITTER') || 'ABAYA' 
const PATH_PREFIX = 'API_PATH'
const paramsReg = /\$\{[a-z0-9_]+\}/g

let API_PREFIX   = getEnv('API_PREFIX') || '/'
if(!API_PREFIX.match(/\/$/)) API_PREFIX += '/'


export default class RequestTransformer {

    transformRequest(req){
        if(!req.url.startsWith(API_PREFIX)) return false
        const urlParts = req.url.split('/')
        if(urlParts.length != this.routeParts.length) return false
        const query = this.getQuery(req.method)
        return urlParts.reduce((acc, urlPart, i)=> {
            if(!acc) return false
            let routePart = this.routeParts[i]
            if(!routePart.startsWith(':')) return routePart == urlPart ? acc : false
            routePart = routePart.substring(1)
            routePart = `\$\{${routePart}\}`
            return acc.replace(routePart, urlPart)
        }, query)
    }

    getQuery(method){
        if(method.toUpperCase() != this.method) return false
        return getEnv(this.envKey)
    }

    getFullRoute(){
        return this.routeParts.join('/')
    }

    getEnvKey(){
        return this.envKey
    }

    constructor(route, method){
        if(!route) throw 'The route parameter must present in constructor.'
        this.method = method && method.toUpperCase() || 'GET'
        route = route.toLowerCase()
        if(!route.match(/^[a-z0-9_\-\:\/]+$/)) throw 'The route parameter contains illegal symbols.'
        this.envKey = `${PATH_PREFIX}_${this.method}_${route.replace(/\:/g, `${API_SPLITTER}_`).replace(/\//g, '_').toUpperCase()}`
        this.routeParts = `${API_PREFIX}${route}`.split('/')
    }
}
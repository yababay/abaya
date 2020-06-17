import getEnv from 'https://raw.githubusercontent.com/yababay/deno-env-filter/master/mod.js'

const API_SPLITTER = getEnv('API_SPLITTER') || 'ABAYA' 
const PATH_PREFIX  = getEnv('PATH_PREFIX')  || 'API_PATH'
const API_PREFIX   = `${getEnv('API_PREFIX') || ''}`
const METHODS      = ['GET', 'DELETE', 'POST', 'PUT']

const paramsReg = /\$\{[a-z0-9_]+\}/g
const bracefy = param=> `\$\{${param}\}`
let regEnv = new RegExp(`${API_SPLITTER}_`, 'g')

const parseEnv = (env)=> {
    env = env.substring(PATH_PREFIX.length + 1).replace(regEnv, ':').replace(/_/g, '/').toLowerCase()
    const obj = {}
    for(const method of METHODS){
        const withSlash = `${method.toLowerCase()}/`
        if(!env.startsWith(withSlash)) continue
        obj.method = method.toUpperCase()
        obj.path = `${API_PREFIX}/${env.replace(withSlash, '')}`
    } 
    return obj
}

export default class RequestTransformer {

    constructor(){
        const routes = getEnv(env=> Object.keys(env)
            .filter(key=> key.startsWith(PATH_PREFIX))
            .map(key=> [key, getEnv(key)])
            .map(arr=> [parseEnv(arr[0]), arr[1]])
        )
        regEnv = null
        this.routes = new Map(routes)
    }

    mapRequest(req){
        const {method, url} = req
        const urlParts = url.replace(/\?.*$/, '').replace(API_PREFIX, '').split('/')
        for(const key of this.routes.keys()){
            let query = this.routes.get(key)
            if(method != key.method) continue
            if(!url.startsWith(API_PREFIX)) continue
            const pathParts = key.path.replace(API_PREFIX, '').split('/')
            if(pathParts.length != urlParts.length) continue
            for(const i in urlParts){
                const pathPart = pathParts[i]
                const urlPart = urlParts[i]
                const hasParam = pathPart.startsWith(':')
                if(!hasParam && urlPart != pathPart){
                    query = false
                    break
                }
                if(!hasParam) continue
                const param = pathPart.substring(1)
                query = query.replace(bracefy(param), decodeURIComponent(urlPart))
            }
            if(!query) continue
            return query
        }
        return false
    }

    async transformRequest(req, connection){
        let query = this.mapRequest(req)
        if(!query) throw 404
        if(METHODS.slice(0, 2).includes(req.method)) return connection && JSON.stringify((await connection.query(query)).rows) || query
        const params = req.params && JSON.parse(req.params) || JSON.parse(new TextDecoder().decode(await Deno.readAll(req.body)))
        Object.keys(params).forEach(key=> query = query.replace(bracefy(key), params[key]))
        if(query.match(paramsReg)) throw `The query is not fullfilled: ${query}`
        return connection && JSON.stringify((await connection.query(query)).rows) || query
    }
}

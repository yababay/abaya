import {assertEquals} from "https://deno.land/std/testing/asserts.ts"
import RequestTransformer from "./mod.js"

Deno.test("get request", () => {
    const method = 'GET'
    const url    = '/api/v1/manufacturers/123'
    const trans  = new RequestTransformer(':table/:id')
    const route  = trans.getFullRoute()
    const envKey = trans.getEnvKey()
    const query  = trans.getQuery(method)
    const result = trans.transformRequest({method, url})
    assertEquals(route,  '/api/v1/:table/:id')
    assertEquals(envKey, 'API_PATH_GET_PARAM_TABLE_PARAM_ID')
    assertEquals(query,  'select * from ${table} where id = ${id}')
    assertEquals(result, 'select * from manufacturers where id = 123')
})

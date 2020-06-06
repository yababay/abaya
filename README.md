# One more url to query builder

This module for Deno transforms http urls into queries (sql and not only). The query templates are read from .env file:

```
    /api/v1/:table/:id
  + 
    select * from ${table} where id = ${id}
  + 
    /api/v1/manufacturers/123
    ==========================================
    select * from manufacturers where id = 123
```

The method of http request is also involved into query building.

## Why this project is named Abaya?

Abaya is a kind of arabian clothes, but I am not an arabian and not yet an amateur of eastern exotics. I have choosen this word because it is, at first, relatively rare and so can be used in declarative configuration without substitution.  (Please look into the source code and `.env` configuration file). Moreover, my nickmane (Yababay) consonants with the abaya word. That's why :) .

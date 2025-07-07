local cjson = require "cjson"

local path_only = string.match(ngx.var.request_uri, "([^?]+)")

local res = ngx.location.capture("/component", {
    method = ngx.HTTP_POST,
    body = cjson.encode({
        method = ngx.var.request_method,
        path = path_only,
        
    }),
    headers = {
        ["Content-Type"] = "application/json",
        ["Authorization"] = ngx.var.http_authorization
    }
})

if res.status ~= 200 then
    local body = cjson.decode(res.body)
    ngx.var.target_upstream = body.matched_endpoint.api_url
else
    ngx.status = 200
    ngx.header["Content-Type"] = "application/json"

    ngx.say(res.body)
    ngx.exit(200)
end

--[[


local httpc = http.new()
httpc:set_timeout(5000) -- 5 segundos timeout

local request_data = {
    method = ngx.var.request_method,
    uri = ngx.var.request_uri,
    remote_addr = ngx.var.remote_addr,
    user_agent = ngx.var.http_user_agent,
    -- Agregar más datos según necesites
}

-- Realizar consulta al servicio de control
local res, err = httpc:request_uri("http://component-services:5002/", {
    method = "POST",
    body = cjson.encode(request_data),
    headers = {
        ["Content-Type"] = "application/json",
    }
})]]

-- Devuelve un mensaje de ejemplo y bloquea el acceso

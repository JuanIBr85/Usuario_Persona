import { isAdmin, hasRol, hasToken, isSuperAdmin } from "@/context/AuthContext";

function get_env(env, orDefault=[]){
    if(!import.meta.env[env]) return orDefault;
    return import.meta.env[env].split(';').filter((rol) => rol.trim() !== '')
}
const ADMIN_ROLES = get_env("VITE_ADMIN_ROLES");
const ADMIN_PERSONA = get_env("VITE_ADMIN_PERSONA");
const ADMIN_COMPONENTES = get_env("VITE_ADMIN_COMPONENTES");
const ADMIN_LOG = get_env("VITE_ADMIN_LOG");

function makeAuthRouteConfig({ roles = [], loginRequired = true, isAdmin = true }) {
    return {
        roles,
        loginRequired,
        isAdmin
    }
}

export const AuthRouteConfig = {
    "*": makeAuthRouteConfig({ loginRequired: false }),  
    // Rutas públicas (sin autenticación)
    "/auth/login": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/logout": makeAuthRouteConfig({ loginRequired: true, isAdmin: false }),
    "/auth/sign": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/forgotpassword": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/resetpassword": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/otpvalidation": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/otpregister": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/otpregisterrecovery": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/redirect": makeAuthRouteConfig({ loginRequired: false }),
    "/faq/termsofservice": makeAuthRouteConfig({ loginRequired: false }),
    "/faq/privacypolicy": makeAuthRouteConfig({ loginRequired: false }),
    "/faq/faq": makeAuthRouteConfig({ loginRequired: false }),

    // Rutas de administrador
    "/": makeAuthRouteConfig({ isAdmin: true }),
    "/adminpanel": makeAuthRouteConfig({  isAdmin: true }),
    "/logs": makeAuthRouteConfig({roles: ADMIN_LOG, isAdmin: true }),
    "/adminpersons": makeAuthRouteConfig({ roles: ADMIN_PERSONA, isAdmin: true }),
    "/adminservices": makeAuthRouteConfig({ roles: ADMIN_COMPONENTES, isAdmin: true }),
    "/adminroles": makeAuthRouteConfig({ roles: ADMIN_ROLES, isAdmin: true }),
    "/adminservices/components": makeAuthRouteConfig({ roles: ADMIN_COMPONENTES, isAdmin: true }),
    "/adminservices/components/:id": makeAuthRouteConfig({ roles: ADMIN_COMPONENTES, isAdmin: true }),
    "/adminservices/endpoints-research": makeAuthRouteConfig({ roles: ADMIN_COMPONENTES, isAdmin: true }),
    "/persondetails/:id": makeAuthRouteConfig({ roles: ADMIN_PERSONA, isAdmin: true }),

    // Rutas de usuario
    "/profile": makeAuthRouteConfig({  isAdmin: false }),
    "/createperfil": makeAuthRouteConfig({  isAdmin: false }),
    "/searchprofile": makeAuthRouteConfig({  isAdmin: false }),
    "/profileconnect": makeAuthRouteConfig({  isAdmin: false }),

};

export const hasAccess = (path) => {
    const routeConfig = AuthRouteConfig[path.toLowerCase()];

    if(!routeConfig){
        alert(`Ruta sin configurar: ${path}`);
        return false;
    }

     //Si el usuario es super administrador se permite acceso
     if(isSuperAdmin()) return true;

    //Si la ruta no requiere autenticacion se permite acceso
    if (!routeConfig.loginRequired) return true;
    //Si no hay token se deniega acceso
    if (!hasToken()) return false;
    //Si la ruta requiere de un administrador y el usuario no es administrador se deniega acceso
    if (routeConfig.isAdmin && !isAdmin()) return false;
    //Si la ruta no requiere un rol especifico se permite acceso
    if (routeConfig.roles.length === 0) return true;
    //Si la ruta requiere de un rol y el usuario no tiene el rol se deniega acceso

    //Compruebo primero los roles obligatorios para acceder a esta area

    const required_roles = Array
    .from(routeConfig.roles)
    //Filtro los roles que empiezan con "!"
    .filter((rol) => rol.startsWith("!"))
    //Quito el "!" del rol
    .map((rol) => rol.slice(1).toLowerCase());

    //Compruebo que el usuario tenga ninguno de los roles 
    const every = required_roles.every(hasRol);

    //Si el usuario no tiene ninguno de los roles obligatorios se deniega acceso
    if (!every && required_roles.length!==0) return false;

    //Compruebo los roles opcionales para acceder a esta area
    const opcionales = Array
    .from(routeConfig.roles)
    //Filtro los roles que no empiezan con "!"
    .filter((rol) => !rol.startsWith("!"))
    .map((rol) => rol.toLowerCase())
    //Compruebo que el usuario tenga almenos uno de estos roles
    .some(hasRol)||false;

    
    //Si el usuario no tiene ninguno de los roles opcionales se deniega acceso
    if (!opcionales && !every) return false;

    return true;
}
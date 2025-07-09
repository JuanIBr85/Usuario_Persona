import { isAdmin, hasRol, hasToken, isSuperAdmin } from "@/context/AuthContext";

/**
 *La idea de esto es poder definir los permisos de acceso a distintas rutas del front
 *Solo se implemento la parte de roles 
 */


function makeAuthRouteConfig({ roles = [], loginRequired = true, isAdmin = true }) {
    return {
        roles,
        loginRequired,
        isAdmin
    }
}

export const AuthRouteConfig = {
    // Rutas públicas (sin autenticación)
    "/auth/login": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/sign": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/forgotpassword": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/resetpassword": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/otpvalidation": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/otpregister": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/otpregisterrecovery": makeAuthRouteConfig({ loginRequired: false }),
    "/auth/redirect": makeAuthRouteConfig({ loginRequired: false }),
    "/termsofservice": makeAuthRouteConfig({ loginRequired: false }),
    "/faq/privacypolicy": makeAuthRouteConfig({ loginRequired: false }),
    "/faq/faq": makeAuthRouteConfig({ loginRequired: false }),

    // Rutas de administrador
    "/": makeAuthRouteConfig({ isAdmin: true }),
    "/adminpanel": makeAuthRouteConfig({  isAdmin: true }),
    "/logs": makeAuthRouteConfig({roles: ["admin-persona"], isAdmin: true }),
    "/adminpersons": makeAuthRouteConfig({ roles: ["admin-persona"], isAdmin: true }),
    "/adminservices": makeAuthRouteConfig({ roles: ["admin-componentes"], isAdmin: true }),
    "/adminroles": makeAuthRouteConfig({ roles: ["admin-roles"], isAdmin: true }),
    "/adminservices/components": makeAuthRouteConfig({ roles: ["admin-componentes"], isAdmin: true }),
    "/adminservices/components/:id": makeAuthRouteConfig({ roles: ["admin-componentes"], isAdmin: true }),
    "/adminservices/endpoints-research": makeAuthRouteConfig({ roles: ["admin-componentes"], isAdmin: true }),
    "/persondetails/:id": makeAuthRouteConfig({ roles: ["admin-persona"], isAdmin: true }),

    // Rutas de usuario
    "/profile": makeAuthRouteConfig({  isAdmin: false }),
    "/createperfil": makeAuthRouteConfig({  isAdmin: false }),
    "/perfilconnect": makeAuthRouteConfig({  isAdmin: false }),

    // Ruta de cierre de sesión
    "/auth/logout": makeAuthRouteConfig({ isAdmin: false })
};

export const hasAccess = (path) => {
    //Si el usuario es super administrador se permite acceso
    if(isSuperAdmin()) return true;

    const routeConfig = AuthRouteConfig[path];
    //Si la ruta no requiere autenticacion se permite acceso
    if (!routeConfig.loginRequired) return true;
    //Si no hay token se deniega acceso
    if (!hasToken()) return false;
    //Si la ruta requiere de un administrador y el usuario no es administrador se deniega acceso
    if (routeConfig.isAdmin && !isAdmin()) return false;
    //Si la ruta no requiere un rol especifico se permite acceso
    if (routeConfig.roles.length === 0) return true;
    //Si la ruta requiere de un rol y el usuario no tiene el rol se deniega acceso
    return Array.isArray(routeConfig.roles) ? Array.from(routeConfig.roles).every(hasRol) : hasRol(routeConfig.roles);;
}
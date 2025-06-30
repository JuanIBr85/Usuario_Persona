// Nuevo hook personalizado useRoles.js
import { useState, useEffect } from "react";
import { roleService } from "@/services/roleService";
import { permisoService } from "@/services/permisoService";
import { userService } from "@/services/userService";

export function useRoles(showError = (msg) => console.error(msg)) {
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [isTimeout, setIsTimeout] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.get_all();
        const transformedRoles = data.roles.map((role) => ({
          id: role.id_rol,
          name: role.nombre_rol,
          permissions: role.permisos,
        }));
        setRoles(transformedRoles);
      } catch (error) {
        showError("Error al cargar los roles desde el servidor.");
        console.error(error);
      }
    };

    const fetchUsuarios = async () => {
      try {
        const userData = await userService.getAllUsers();
        setUsuarios(Array.isArray(userData) ? userData : []);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchPermisos = async () => {
      try {
        const data = await permisoService.get_all();
        const transformedPermisos = data.permisos.map((permiso) => ({
          id: permiso.id_permiso,
          name: permiso.nombre_permiso,
        }));
        setAvailablePermissions(transformedPermisos);
      } catch (error) {
        showError("Error al cargar los permisos desde el servidor.");
        console.error(error);
      }
    };

    fetchPermisos();
    fetchRoles();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const usuarioSeleccionado = usuarios.find(
        (u) => u.id === Number(selectedUserId)
      );
      if (usuarioSeleccionado) {
        setSelectedRoleIds(usuarioSeleccionado.roles_ids || []);
      }
    } else {
      setSelectedRoleIds([]);
    }
  }, [selectedUserId, usuarios]);

  useEffect(() => {
    let intervalId;
    if (roles.length > 0) {
      setIsTimeout(false);
    } else {
      if (countdown > 0) {
        intervalId = setInterval(() => {
          setCountdown((prevCount) => prevCount - 1);
        }, 1000);
      } else {
        setIsTimeout(false);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [roles, countdown]);

  return {
    roles,
    setRoles,
    usuarios,
    setUsuarios,
    availablePermissions,
    selectedUserId,
    setSelectedUserId,
    selectedRoleIds,
    setSelectedRoleIds,
    isTimeout,
    countdown,
  };
}

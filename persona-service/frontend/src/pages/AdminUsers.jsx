import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  User, 
  Filter, 
  ArrowUpDown,
  Check,
  UserPlus,
  Mail,
  Shield
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

// Mock data - replace with API calls in a real application
const mockUsers = [
  {
    id: 1,
    nombre: "Juan Pérez",
    rol: "Profesor",
    email: "juan.perez@email.com",
    status: "Activo",
    fechaRegistro: "15/03/2023",
    ultimoAcceso: "Hace 2 horas",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 2,
    nombre: "Lucía Gómez",
    rol: "Alumno",
    email: "lucia.gomez@email.com",
    status: "Egresado",
    fechaRegistro: "22/01/2023",
    ultimoAcceso: "Ayer",
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    rol: "Administrador",
    email: "carlos.rodriguez@email.com",
    status: "Activo",
    fechaRegistro: "10/02/2023",
    ultimoAcceso: "Hace 30 minutos",
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: 4,
    nombre: "María López",
    rol: "Alumno",
    email: "maria.lopez@email.com",
    status: "Inactivo",
    fechaRegistro: "05/01/2023",
    ultimoAcceso: "Hace 1 semana",
    avatar: "https://i.pravatar.cc/150?img=4"
  },
  {
    id: 5,
    nombre: "Roberto Sánchez",
    rol: "Profesor",
    email: "roberto.sanchez@email.com",
    status: "Activo",
    fechaRegistro: "18/03/2023",
    ultimoAcceso: "Hoy",
    avatar: "https://i.pravatar.cc/150?img=5"
  },
];

const ROLES = [
  { value: "todos", label: "Todos" },
  { value: "administrador", label: "Administrador" },
  { value: "profesor", label: "Profesor" },
  { value: "alumno", label: "Alumno" },
];

const STATUSES = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "egresado", label: "Egresado" },
];

const SORT_OPTIONS = [
  { value: "nombre-asc", label: "Nombre (A-Z)" },
  { value: "nombre-desc", label: "Nombre (Z-A)" },
  { value: "fecha-asc", label: "Fecha de registro (Antiguos primero)" },
  { value: "fecha-desc", label: "Fecha de registro (Recientes primero)" },
];

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'activo':
      return { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' };
    case 'egresado':
      return { variant: 'secondary', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
    case 'inactivo':
      return { variant: 'outline', className: 'bg-gray-100 text-gray-800 dark:text-gray-200 hover:bg-gray-100' };
    default:
      return { variant: 'outline', className: 'bg-yellow-50 text-yellow-800 hover:bg-yellow-50' };
  }
};

const getRoleBadge = (role) => {
  const roleColors = {
    'administrador': 'bg-purple-100 text-purple-800',
    'profesor': 'bg-blue-100 text-blue-800',
    'alumno': 'bg-green-100 text-green-800',
  };
  
  const colorClass = roleColors[role?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  
  return (
    <Badge className={`${colorClass} hover:opacity-90 capitalize`}>
      <Shield className="w-3 h-3 mr-1" />
      {role}
    </Badge>
  );
};

function AdminUsers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState(mockUsers);
  const [filters, setFilters] = useState({
    rol: "todos",
    status: "todos",
    sortBy: "nombre-asc"
  });

  // Apply filters and sorting
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filters.rol === "todos" || 
        user.rol.toLowerCase() === filters.rol.toLowerCase();
      
      const matchesStatus = filters.status === "todos" || 
        user.status.toLowerCase() === filters.status.toLowerCase();
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'nombre-asc':
          return a.nombre.localeCompare(b.nombre);
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre);
        case 'fecha-asc':
          return new Date(a.fechaRegistro) - new Date(b.fechaRegistro);
        case 'fecha-desc':
          return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
        default:
          return 0;
      }
    });

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const handleEdit = (id) => {
    navigate(`/admin/users/edit/${id}`);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
      // In a real app, you would call an API here
      console.log("Eliminar usuario con id:", id);
      // setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/userdetails/${id}`);
  };

  const handleSendEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <AdminLayout 
      title="Gestión de Usuarios"
      description="Administra los usuarios del sistema"
    >
      <AdminBreadcrumb items={[
        { label: "Usuarios" }
      ]} />

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>
                {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'} en total
              </CardDescription>
            </div>
            <Button asChild>
              <Link to="/admin/users/new" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Nuevo Usuario
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <div className="p-4 border-b bg-muted/20">
          <div className="flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    {filters.rol === 'todos' ? 'Filtrar por rol' : 
                      ROLES.find(r => r.value === filters.rol)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  {ROLES.map((role) => (
                    <DropdownMenuItem 
                      key={role.value}
                      onClick={() => handleFilterChange('rol', role.value)}
                      className={filters.rol === role.value ? 'bg-accent' : ''}
                    >
                      {filters.rol === role.value && <Check className="mr-2 h-4 w-4" />}
                      {role.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    {filters.status === 'todos' ? 'Filtrar por estado' : 
                      STATUSES.find(s => s.value === filters.status)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  {STATUSES.map((status) => (
                    <DropdownMenuItem 
                      key={status.value}
                      onClick={() => handleFilterChange('status', status.value)}
                      className={filters.status === status.value ? 'bg-accent' : ''}
                    >
                      {filters.status === status.value && <Check className="mr-2 h-4 w-4" />}
                      {status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Ordenar por
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[240px]">
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => handleFilterChange('sortBy', option.value)}
                      className={filters.sortBy === option.value ? 'bg-accent' : ''}
                    >
                      {filters.sortBy === option.value && <Check className="mr-2 h-4 w-4" />}
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const statusVariant = getStatusVariant(user.status);
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage src={user.avatar} alt={user.nombre} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.nombre}</span>
                            <span className="text-xs text-muted-foreground">
                              Registrado el {user.fechaRegistro}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.rol)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 opacity-70" />
                          <span className="truncate max-w-[180px] md:max-w-none">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={statusVariant.variant}
                          className={statusVariant.className}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <div className="hidden md:flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(user.id)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(user.id)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendEmail(user.email)}
                              title="Enviar correo"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(user.id, user.nombre)}
                              title="Eliminar"
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="md:hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendEmail(user.email)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Enviar correo
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(user.id, user.nombre)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron usuarios que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t bg-muted/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{filteredUsers.length}</span> de <span className="font-medium">{users.length}</span> usuarios
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
export default AdminUsers;

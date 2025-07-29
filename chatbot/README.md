# CREUS WhatsApp Bot

Este proyecto es un bot automatizado de WhatsApp para CREUS desarrollado en Python y Flask. Permite atender consultas frecuentes de estudiantes y registrar todas las interacciones en una base de datos MySQL.

---

## Funcionalidades

- Responde automáticamente a mensajes de WhatsApp con:
  - Horarios de atención
  - Carreras con inscripción abierta
  - Información de contacto
  - Últimas noticias publicadas
  - Preguntas frecuentes
- Registra los mensajes entrantes y salientes en una base de datos MySQL
- Integración con la API oficial de WhatsApp Cloud

---

## Requisitos

- Python 3.8 o superior
- MySQL
- Una cuenta de Facebook Developer y acceso a WhatsApp Cloud API
- Un servidor con dominio propio.

---

## Despliegue

- El bot expone el endpoint `/webhook/` para la integración con WhatsApp Cloud API.
- Debés tener tu bot accesible mediante una URL pública.
- Configura el webhook en Facebook Developers con la URL:  
  `https://TU_DOMINIO/webhook/`

---

## Variables de entorno

El archivo `.env` debe contener:

```
BASE_API_URL=...
CREUS_BASE_URL=...
WA_TOKEN=...
WA_PHONE_ID=...
VERIFY_TOKEN=...
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
```

---

# Guía de configuración de API WhatsApp

A continuación, una guía paso a paso para obtener los valores de `WA_TOKEN`, `WA_PHONE_ID` y `VERIFY_TOKEN` requeridos en el archivo `.env`:

Esta guía asume que el usuario tiene el bot hosteado con dominio propio.

---

### 1) Ir al panel de apps de Facebook

Accede a [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)

---
### 2) Haz click en "Crear App"
<img width="1628" height="403" alt="image-24" src="https://github.com/user-attachments/assets/596ea0c1-8889-4cf4-9be9-382f8a6f20f7" />

---
### 3) Elige nombre de la app y correo de contacto

<img width="1101" height="500" alt="image-26" src="https://github.com/user-attachments/assets/e7045503-4371-43dd-8c66-c0462a8d6368" />

---
### 4) En "caso de uso" selecciona "otro"

<img width="1101" height="500" alt="image-28" src="https://github.com/user-attachments/assets/d90676dc-236e-4011-a786-90e8d22201a5" />
<img width="1101" height="500" alt="image-30" src="https://github.com/user-attachments/assets/1251662d-461d-4aa2-997e-518daf5ec0f9" />

---
### 5) Selecciona tipo de app: Negocios

<img width="1096" height="434" alt="image-32" src="https://github.com/user-attachments/assets/897d2a70-dcfd-4eb0-904f-06a0de71f51f" />

---
### 6) Completa los datos de la app

El portafolio comercial es opcional por ahora.

<img width="1114" height="591" alt="image-34" src="https://github.com/user-attachments/assets/5944952b-f22e-45f0-9bd2-e9a637862204" />

---
### 7) Después de crear la app, entrarás al panel de administrador. Haz click en "WhatsApp" en el menú lateral.

<img width="1112" height="886" alt="image-36" src="https://github.com/user-attachments/assets/74e03a7c-aaf9-41b1-bc6c-2e7e88a1e9e3" />

---
### 8) Selecciona o crea un portafolio comercial

Facebook te guiará por el proceso. En este ejemplo, el portafolio se llamó "CREUS".

[Más info sobre portafolios comerciales](https://www.facebook.com/business/help/1710077379203657/)

<img width="1112" height="886" alt="image-38" src="https://github.com/user-attachments/assets/8e277286-d0c1-4c48-af8a-18cf5adc2fc0" />

### 9) Haz click en "Empezar a usar la API"

<img width="1112" height="886" alt="image-41" src="https://github.com/user-attachments/assets/763965f5-3604-4f40-a905-a2101a5d2c25" />

---
### 10) Elige un número como destinatario

Facebook debería proporcionarte un número de prueba, pero si falla, intenta agregar un número real como origen.

<img width="1112" height="886" alt="image-43" src="https://github.com/user-attachments/assets/655959bb-c7cd-4f5c-bbdb-9e2b2d4e4a95" />

---
### 11) Configuración básica de la app

Ve a "Configuración de la app > Básica" y completa los datos requeridos:  
- Nombre de la app  
- Correo de contacto  
- Política de privacidad  
- Dominio principal, por ejemplo: [https://www.creus.edu.ar](https://www.creus.edu.ar)

La política de privacidad es obligatoria (ejemplo: [https://www.creus.edu.ar/privacy-policy](https://www.creus.edu.ar/privacy-policy)).  
El dominio debe ser solo el principal, sin rutas.

<img width="1625" height="738" alt="image-45" src="https://github.com/user-attachments/assets/1b34b77a-5dbf-4c33-9678-3f3eae961b7c" />

---
### 12) WhatsApp > Configuración de la API

- Elige un número de prueba, un número de destino y genera un token de acceso.

<img width="1552" height="777" alt="image-48" src="https://github.com/user-attachments/assets/0d940e45-bc71-410e-8bcb-5758ba154685" />

---
### 13) Facebook pedirá a qué cuenta le das acceso

Dale acceso a la cuenta de testeo creada automáticamente.

---
### 14) Al crear un token podrás enviar un mensaje de prueba

Usa el número de destino configurado.

<img width="660" height="833" alt="image-50" src="https://github.com/user-attachments/assets/900989c2-42d5-475d-a074-e1b2662523b3" />

Al crear un token, vamos a poder enviar un mensaje de prueba  al número de destino que configuramos.

<img width="1350" height="752" alt="image-52" src="https://github.com/user-attachments/assets/563e4a30-a286-43d6-b956-b66b12e4a759" />
<img width="1271" height="326" alt="image-54" src="https://github.com/user-attachments/assets/b81a236d-6135-455d-a456-117b92f10d00" />

### 15) Debes tener hosteado el bot

El bot espera un HTTP request al endpoint `/webhook/`.  
En WhatsApp > Configuración > "URL de devolución de llamada", pon tu URL terminando en `/webhook/` (ejemplo: [http://creus.edu.ar/webhook/](http://creus.edu.ar/webhook/)).

### 16) Configura el token de verificación

En la pestaña "token de verificación" ingresa un token que tú creas.  
Debe coincidir en Facebook y en el código del bot (`VERIFY_TOKEN`).

El bot espera un HTTP request al endpoint /webhook/.
En WhatsApp > Configuración > "URL de devolución de llamada", pon tu URL terminando en /webhook/ (ejemplo: http://creus.edu.ar/webhook/).

Facebook enviará un HTTP GET al endpoint para confirmar el token y un HTTP POST para enviar mensajes.

<img width="1731" height="690" alt="image-56" src="https://github.com/user-attachments/assets/56e9ffa3-5c42-4dc2-b6cc-5c22803d7788" />

---
### 17) En los campos de webhook selecciona la opción "messages"

La variable `token_verificacion` debe coincidir con el token de verificación que ingresaste.
<img width="1158" height="715" alt="image-59" src="https://github.com/user-attachments/assets/7d4c66ff-800c-470b-8f7a-3e04d6d5fbe2" />
<img width="1158" height="715" alt="image-61" src="https://github.com/user-attachments/assets/8368de33-4015-42e9-9581-d07251db9aab" />

---
### 18) Genera un token temporal y copia el ID del número de teléfono de testeo

- El token generado será tu `WA_TOKEN`.
- El ID del número será tu `WA_PHONE_ID`.

Actualiza estos valores en tu archivo `.env` o en las variables del código.

<img width="1549" height="778" alt="image-65" src="https://github.com/user-attachments/assets/8c139943-f8cb-4b42-9762-c623cffbd84a" />

---
### 19) Ahora el número de prueba funcionará como tu bot
---
### 20) Para la configuración final, agrega tu propio número y genera un token permanente

En WhatsApp > Configuración de la API > Agregar número de teléfono.  
Sigue los pasos para obtener el nuevo token y el ID correspondiente.

<img width="1549" height="778" alt="image-70" src="https://github.com/user-attachments/assets/2740ae0b-0772-4705-a467-e123b79baabc" />
<img width="873" height="589" alt="image-75" src="https://github.com/user-attachments/assets/6811c51b-071a-4bad-ad5a-86fb24510dd8" />

---
### 21) Completa la verificación básica

Ve a Configuración de la app > Básica > Completar verificación.
<img width="1628" height="736" alt="image-79" src="https://github.com/user-attachments/assets/19e99467-4d25-41ad-a62b-9d8480a51ef0" />

---
### 22) Crea un usuario Admin

En "Usuarios > Usuarios del sistema", crea un usuario Admin.
<img width="1586" height="758" alt="image-90" src="https://github.com/user-attachments/assets/48193cb0-c1aa-465b-ba56-b840a7b5cf81" />
<img width="1073" height="685" alt="image-92" src="https://github.com/user-attachments/assets/a0f63952-e3b3-4627-90f1-4d5309e2c8f5" />

---
### 23) Asigna activos y permisos

Click en Asignar activos, elige la app y, en "Asignar permisos", otorga "Control total - Administrar app".

<img width="1082" height="847" alt="image-98" src="https://github.com/user-attachments/assets/a7fa2984-faff-4d7a-acf8-fd7d24fd4987" />
<img width="1082" height="847" alt="image-104" src="https://github.com/user-attachments/assets/1968dde6-e9d6-4044-a2e3-57247122b4e9" />
<img width="1082" height="847" alt="image-108" src="https://github.com/user-attachments/assets/729f2901-ed37-424d-90e3-42434e54ee84" />
<img width="873" height="632" alt="image-110" src="https://github.com/user-attachments/assets/40bf02f5-67e5-432c-9ebe-399ad2507ed3" />
<img width="873" height="632" alt="image-116" src="https://github.com/user-attachments/assets/346bbd06-d29b-4ed9-85cd-4f173208c8ef" />

---

### 24) Usa el nuevo token permanente y el identificador de teléfono real

Asegúrate de actualizar en `.env`:
- `WA_TOKEN` (token permanente)
- `WA_PHONE_ID` (identificador de teléfono real)

<img width="863" height="411" alt="clipboard_image_69be2fc5636f (Edit)-144" src="https://github.com/user-attachments/assets/75eae54d-bee5-46e0-8a38-d8f0162b5daa" />

---


### 25) Cambia la app de "desarrollo" a "activo"

<img width="725" height="682" alt="clipboard_image_18059a7618bb (Edit)-124" src="https://github.com/user-attachments/assets/1c7aa85e-b1c9-4015-90c9-7e7f032497e1" />

¡Listo! El bot está listo para funcionar con WhatsApp Cloud API.

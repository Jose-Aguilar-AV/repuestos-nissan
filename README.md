# Sistema de Repuestos Nissan

Aplicación web fullstack para la gestión y compra de repuestos de vehículos Nissan.
Incluye autenticación de usuarios, catálogo de productos, carrito de compras y gestión de pedidos.

---

## 📸 Vista previa

![preview](https://via.placeholder.com/900x400?text=Nissan+Store+Preview)

---

## Funcionalidades

* 🔐 Login de usuarios
* 🛒 Carrito de compras
* 📦 Creación de pedidos
* 📋 Historial de pedidos por usuario
* 📦 Gestión de repuestos
* 🔎 Visualización de stock

---

## Tecnologías

### Frontend

* React (Vite)
* React Router
* CSS inline / estilos personalizados

### Backend

* Node.js
* Express

### Base de Datos

* MySQL (XAMPP)

---

## Estructura del proyecto

```
proyecto/
│
├── client/        # Frontend (React)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── store/
│
├── server/        # Backend (Node + Express)
│   ├── index.js
│
└── README.md
```

---

## Instalación

### 1. Clonar repositorio

```
git clone https://github.com/Jose-Aguilar-AV/repuestos-nissan.git
cd repuestos-nissan
```

---

### 2. Backend

```
cd server
npm install
node index.js
```

Servidor en:

```
http://localhost:3000
```

---

### 3. Frontend

```
cd client
npm install
npm run dev
```

App en:

```
http://localhost:5173
```

---

## Base de Datos

Importar en MySQL (XAMPP):

* Crear base de datos
* Ejecutar scripts SQL (tablas de usuario, repuesto, pedido, detalle_pedido)

---

## Autenticación

El sistema usa:

* Token guardado en `localStorage`
* Protección de rutas en frontend
* Validación de sesión antes de crear pedidos

---

## Flujo de compra

1. Usuario inicia sesión
2. Navega por el catálogo
3. Agrega repuestos al carrito
4. Confirma pedido
5. Visualiza historial de pedidos

---

## Mejoras futuras

* ✅ Sistema de roles (admin / usuario)
* ✅ Gestión de inventario automática
* ✅ Filtros por modelo de vehículo
* ✅ Pasarela de pagos
* ✅ Deploy en la nube

---

## Autor

**Jose Aguilar**
Proyecto académico / portafolio

---

## Licencia

## Este proyecto es de uso educativo.

# Capitalia - Plataforma de Transacciones

Plataforma web para simular y gestionar transacciones financieras, permitiendo a los usuarios visualizar su saldo, historial de transacciones y rendimiento de portafolios de inversión de manera clara e interactiva.

---

## Tecnologías utilizadas

- Frontend: React.js, Chart.js, react-chartjs-2, react-router-dom
- Backend: Node.js, Express
- Base de datos: MySQL
- Servidor local opcional: XAMPP
- Gestión de peticiones HTTP: Axios

---

## Instalación

1. Clonar el repositorio:
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

2. Instalar dependencias del frontend:
cd client
npm install

3. Instalar dependencias del backend:
cd ../server
npm install

4. Configurar la base de datos MySQL:
- Crear una base de datos llamada 'transacciones'.
- Ejecutar los scripts SQL de creación de tablas en '/server/db'.
- Ajustar credenciales en 'server/config.js' o archivo de configuración correspondiente.

5. Iniciar la aplicación:
# Backend
cd server
npm start

# Frontend
cd ../client
npm start

La aplicación estará disponible en http://localhost:3000

---

## Funcionalidades principales

- Registro de transacciones de compra y venta.
- Visualización de saldo actual y portafolio.
- Gráficos interactivos de rendimiento histórico.
- Tarjetas informativas expandibles para cada sección.
- Sistema modular para agregar nuevas acciones o inversiones.

---

## Configuración adicional

- MySQL debe correr en el puerto configurado (por defecto 3306).
- Ejecutar XAMPP como administrador si se usa Windows.
- Revisar logs en 'xampp/mysql/data/mysql_error.log' ante errores de MySQL.

---

## Estructura del proyecto

/client        # Frontend en React
/server        # Backend en Node.js/Express
/server/db     # Scripts SQL para la base de datos

---

## Contribuciones

Para agregar funcionalidades o mejoras:

1. Hacer fork del repositorio.
2. Crear una rama con la nueva funcionalidad:
git checkout -b nueva-funcionalidad
3. Hacer commit y push.
4. Crear un Pull Request describiendo los cambios.

---

## Licencia

Este proyecto está bajo la licencia MIT.

---

## Autores

- Jose Aguilar - 2221889
- Yiber Romero - 2221835
- Emerson Lopez - 2225507

Grupo: Ipsum dolor
Plataforma: Capitalia

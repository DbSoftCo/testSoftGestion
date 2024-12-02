# Testing Workflow

Este repositorio está diseñado para contener las pruebas de integración del backend. A continuación se describe el flujo de trabajo de prueba:

1. **Integración con el Backend**:
   - Este repositorio se clona automáticamente en el flujo de trabajo del backend cada vez que hay un `push` en la rama `main` del backend.

2. **Ejecución de Pruebas**:
   - Las pruebas de integración se ejecutan contra el servidor del backend en funcionamiento. Esto permite verificar que el backend responda correctamente a las solicitudes y que la lógica de la aplicación funcione como se espera.

3. **Configuración de Pruebas**:
   - Asegúrate de que todas las dependencias necesarias estén definidas en el archivo `package.json` y que las pruebas estén correctamente configuradas para que el flujo de trabajo funcione sin problemas.

4. **Resultados de las Pruebas**:
   - Los resultados de las pruebas se registran en los logs del flujo de trabajo del backend. Esto facilita la revisión y solución de problemas en caso de que alguna prueba falle.
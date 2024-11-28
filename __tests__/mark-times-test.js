import Chance from 'chance';
import pactum, { response } from 'pactum';
import { z } from 'zod';

const baseUrl = 'http://localhost:3000/mark-times';
const chance = new Chance();
let token;
let markTimeId; // Para almacenar el ID de la marca de tiempo creada

describe('Login', () => {
  test('Login exitoso rol user', async () => {
    const response = await pactum
      .spec()
      .post('http://localhost:3000/auth')
      .withJson({
        email: 'ignaciogomezjais@gmail.com',
        password: 'Nackgomez14@',
      })
      .expectStatus(201);
    token = `Bearer ${response.body.access_token}`;
  });
});

describe('Crear Marca de Tiempo', () => {
  test('Creación de marca de tiempo con datos válidos', async () => {
    const requestData = {
      day: new Date().toISOString(),
      entrance: {
        latitude: chance.latitude().toString(),
        longitude: chance.longitude().toString(),
        hour: new Date().toISOString(),
      },
      exit: {
        latitude: chance.latitude().toString(),
        longitude: chance.longitude().toString(),
        hour: new Date().toISOString(),
      },
    };

    const response = await pactum
      .spec()
      .post(`${baseUrl}`)
      .withHeaders('Authorization', token)
      .withJson(requestData)
      .expectStatus(201);

    markTimeId = response.body._id; // Guardar el ID de la marca de tiempo creada

    const responseSchema = z.object({
      _id: z.string(),
      day: z.string(),
      entrance: z.object({
        latitude: z.string(),
        longitude: z.string(),
        hour: z.string(),
      }),
      exit: z
        .object({
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          hour: z.string().optional(),
        })
        .optional(),
      userId: z.string(),
      __v: z.number(),
    });

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });
});

describe('Obtener Marcas de Tiempo', () => {
  test('Obtener todas las marcas de tiempo de un usuario', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/getAll/66fa1240c6070d7f98d54f72`) // Asegúrate de que el userId esté disponible
      .withHeaders('Authorization', token)
      .expectStatus(200);

    const responseSchema = z.array(
      z.object({
        _id: z.string(),
        day: z.string(),
        entrance: z.object({
          latitude: z.string(),
          longitude: z.string(),
          hour: z.string(),
        }),
        exit: z
          .object({
            latitude: z.string().optional(),
            longitude: z.string().optional(),
            hour: z.string().optional(),
          })
          .optional(),
        userId: z.string(),
        __v: z.number(),
      })
    );

    // Validar la respuesta con el esquema
    const result = responseSchema.safeParse(response.body.docs); // Aquí se evalúa el esquema contra docs

    // Verifica que el arreglo docs sea un arreglo de objetos o esté vacío
    expect(Array.isArray(response.body.docs)).toBe(true);
    expect(result.success).toBe(true); // Ahora result está definido
  });

  test('Buscar una marca de tiempo por ID', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/${markTimeId}`)
      .withHeaders('Authorization', token)
      .expectStatus(200);

    const responseSchema = z.object({
      _id: z.string(),
      day: z.string(),
      entrance: z.object({
        latitude: z.string(),
        longitude: z.string(),
        hour: z.string(),
      }),
      exit: z
        .object({
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          hour: z.string().optional(),
        })
        .optional(),
      userId: z.object({
        _id: z.string(),
        name: z.string(),
        lastname: z.string(),
        gender: z.string(),
        birthDate: z.string(),
        phone: z.string(),
        image: z.string(),
        companyId: z.string(),
        address: z.object({
          country: z.string(),
          state: z.string(),
          city: z.string(),
          apartment: z.boolean(),
          houseNumber: z.number(),
          floor: z.string(),
          door: z.string(),
          street: z.string(),
          postalCode: z.string(),
        }),
        authData: z.object({
          email: z.string(),
          firstLogin: z.boolean(),
          status: z.boolean(),
        }),
        workDetails: z.object({
          role: z.string(),
          supervisor: z.boolean(),
          activityStartDate: z.string(),
          employeeType: z.string(),
          workIn: z.array(z.string()),
        }),
        createdAt: z.string(),
        updatedAt: z.string(),
        __v: z.number(),
        cuit: z.string(),
        dni: z.string(),
      }),
      __v: z.number(),
    });

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  describe('Actualizar Marca de Tiempo - Registrar Salida', () => {
    test('Actualizar marca de tiempo para registrar salida', async () => {
      const exitData = {
        latitude: chance.latitude().toString(),
        longitude: chance.longitude().toString(),
        hour: new Date().toISOString(),
      };

      const response = await pactum
        .spec()
        .put(`${baseUrl}/markExit/${markTimeId}`)
        .withHeaders('Authorization', token)
        .withJson(exitData)
        .expectStatus(200);

      const responseSchema = z.object({
        message: z.string(),
        // Si hay otros campos en la respuesta, agréguelos aquí
      });

      const result = responseSchema.safeParse(response.body);
      expect(result.success).toBe(true);
      expect(response.body.message).toBe('Exit marked successfully');
    });
  });

  describe('Buscar Marcas de Tiempo por Día', () => {
    test('Buscar marcas de tiempo por día específico', async () => {
      const day = new Date().toISOString().split('T')[0]; // Obtener solo la fecha sin la hora

      const response = await pactum
        .spec()
        .get(`${baseUrl}/getOneByDay/66fa1240c6070d7f98d54f72?day=${day}`)
        .withHeaders('Authorization', token)
        .expectStatus(200);

      const responseSchema = z.array(
        z.object({
          _id: z.string(),
          day: z.string(),
          entrance: z.object({
            latitude: z.string(),
            longitude: z.string(),
            hour: z.string(),
          }),
          exit: z
            .object({
              latitude: z.string().optional(),
              longitude: z.string().optional(),
              hour: z.string().optional(),
            })
            .optional(),
          userId: z.string(),
          __v: z.number(),
        })
      );

      const result = responseSchema.safeParse(response.body);
      expect(result.success).toBe(true);
    });

    describe('Crear Marca de Tiempo - Casos de Error', () => {
      test('Error al crear marca de tiempo sin datos de entrada', async () => {
        const response = await pactum
          .spec()
          .post(`${baseUrl}`)
          .withHeaders('Authorization', token)
          .withJson({}) // Enviar un cuerpo vacío
          .expectStatus(400); // Esperar un error 400

        expect(response.body.message).toEqual(
          expect.arrayContaining(['day must be a valid ISO 8601 date string'])
        ); // Verificar que el mensaje de error esté en el arreglo
      });
    });

    test('Error al crear marca de tiempo con datos inválidos', async () => {
      const requestData = {
        day: 'invalid-date', // Fecha inválida
        entrance: {
          latitude: 'invalid-latitude',
          longitude: 'invalid-longitude',
          hour: 'invalid-hour',
        },
      };

      const response = await pactum
        .spec()
        .post(`${baseUrl}`)
        .withHeaders('Authorization', token)
        .withJson(requestData)
        .expectStatus(400); // Espera un error 400 (Bad Request)
    });
  });

  describe('Obtener Marca de Tiempo - Casos de Error', () => {
    test('Error al buscar marca de tiempo con ID no válido', async () => {
      const invalidId = 'invalid-id';

      await pactum
        .spec()
        .get(`${baseUrl}/${invalidId}`)
        .withHeaders('Authorization', token)
        .expectStatus(400); // Espera un error 400 (Bad Request)
    });

    test('Error al buscar una marca de tiempo que no existe', async () => {
      const nonExistentId = '60b8d8f4c3f8c12b8c0e1f5a'; // Asegúrate de que este ID no exista en la base de datos

      await pactum
        .spec()
        .get(`${baseUrl}/${nonExistentId}`)
        .withHeaders('Authorization', token)
        .expectStatus(404) // Espera un error 404 (Not Found)
        .expectBodyContains(`Mark time with ID: ${nonExistentId} not found.`); // Ajusta esto según el mensaje de error esperado
    });
  });

  describe('Actualizar Marca de Tiempo - Casos de Error', () => {
    test('Error al actualizar marca de tiempo que no existe', async () => {
      const invalidId = '60b8d8f4c3f8c12b8c0e1f5a'; // Asegúrate de que este ID no exista en la base de datos
      const exitData = {
        latitude: chance.latitude().toString(),
        longitude: chance.longitude().toString(),
        hour: new Date().toISOString(),
      };

      await pactum
        .spec()
        .put(`${baseUrl}/markExit/${invalidId}`)
        .withHeaders('Authorization', token)
        .withJson(exitData)
        .expectStatus(404) // Espera un error 404 (Not Found)
        .expectBodyContains(`Mark time with ID: ${invalidId} not found.`); // Ajusta esto según el mensaje de error esperado
    });
  });
});

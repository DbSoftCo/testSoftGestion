import Chance from 'chance';
import pactum from 'pactum';
import { z } from 'zod';

const baseUrl = 'http://localhost:3000/works';
const chance = new Chance();
let token;
let workId;

describe('Login', () => {
  test('Login exitoso rol admin', async () => {
    const response = await pactum
      .spec()
      .post('http://localhost:3000/auth')
      .withJson({
        email: 'nacgosh@gmail.com',
        password: 'Nackgomez14@',
      })
      .expectStatus(201);
    token = `Bearer ${response.body.access_token}`;
  });
});

describe('Work Module', () => {
  beforeAll(async () => {
    // Autenticación y obtención del token
    const response = await pactum
      .spec()
      .post('http://localhost:3000/auth')
      .withJson({
        email: 'nacgosh@gmail.com',
        password: 'Nackgomez14@',
      })
      .expectStatus(201);
    token = `Bearer ${response.body.access_token}`;
  });

  test('Creación de trabajo con datos válidos', async () => {
    const response = await pactum
      .spec()
      .post(baseUrl)
      .withHeaders('Authorization', token)
      .withJson({
        name: 'Proyecto de Prueba',
        userContractor: '66fa1240c6070d7f98d54f72', // Asegúrate de que este ID sea válido
        supervisors: ['66fa1240c6070d7f98d54f72'], // Asegúrate de que este ID sea válido
        workType: 'Desarrollo',
        status: 'Activo',
        location: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Buenos Aires',
          apartment: true,
          houseNumber: 123,
          street: 'Av. Corrientes',
          postalCode: '1045',
          floor: '6',
          door: 'B',
        },
        estimatedDateInit: '2024-01-01T00:00:00.000Z',
        estimatedDateFinish: '2024-12-31T00:00:00.000Z',
        subContractor: false,
        fromCompany: '64503ab482d7efa8c22edd5b', // Asegúrate de que este ID sea válido
        usersAssigned: ['66fa1240c6070d7f98d54f72'], // Asegúrate de que este ID sea válido
      })
      .expectStatus(201);

    workId = response.body.data._id;

    // Validación del cuerpo de la respuesta usando Zod
    const responseSchema = z.object({
      _id: z.string(),
      name: z.string(),
      userContractor: z.string(),
      supervisors: z.array(z.string()),
      workType: z.string(),
      status: z.string(),
      archived: z.boolean(),
      location: z.object({
        country: z.string(),
        state: z.string(),
        city: z.string(),
        apartment: z.boolean(),
        houseNumber: z.number(),
        street: z.string(),
        postalCode: z.string(),
        floor: z.string().optional(),
        door: z.string().optional(),
      }),
      estimatedDateInit: z.string(),
      estimatedDateFinish: z.string(),
      subContractor: z.boolean(),
      fromCompany: z.string(),
      usersAssigned: z.array(z.string()),
    });

    const result = responseSchema.safeParse(response.body.data);
    expect(result.success).toBe(true);
  });

  test('Obtener todos los trabajos', async () => {
    const response = await pactum
      .spec()
      .get(baseUrl)
      .withHeaders('Authorization', token)
      .expectStatus(200);

    // Validar que la respuesta sea un array
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Obtener trabajo por ID', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/${workId}`)
      .withHeaders('Authorization', token)
      .expectStatus(200);

    // Validación del cuerpo de la respuesta usando Zod
    const responseSchema = z.object({
      _id: z.string(),
      name: z.string(),
      supervisors: z.array(
        z.object({
          _id: z.string(),
          name: z.string(),
          lastname: z.string(),
          gender: z.string(),
          birthDate: z.string(),
          phone: z.string(),
          image: z.string(),
          companyId: z.string(),
          address: z.object({}).passthrough(), // Puedes definir más campos si son necesarios
          authData: z.object({}).passthrough(), // Puedes definir más campos si son necesarios
          workDetails: z.object({}).passthrough(), // Puedes definir más campos si son necesarios
          createdAt: z.string(),
          updatedAt: z.string(),
          __v: z.number(),
          cuit: z.string(),
          dni: z.string(),
        })
      ),
      workType: z.string(),
      status: z.string(),
      archived: z.boolean(),
      location: z.object({
        country: z.string(),
        state: z.string(),
        city: z.string(),
        apartment: z.boolean(),
        houseNumber: z.number(),
        street: z.string(),
        postalCode: z.string(),
        floor: z.string().optional(),
        door: z.string().optional(),
      }),
      estimatedDateInit: z.string(),
      estimatedDateFinish: z.string(),
      subContractor: z.boolean(),
      fromCompany: z.string(),
      usersAssigned: z.array(
        z.object({
          _id: z.string(),
          name: z.string(),
          lastname: z.string(),
          gender: z.string(),
          birthDate: z.string(),
          phone: z.string(),
          image: z.string(),
          companyId: z.string(),
          address: z.object({}).passthrough(), // Puedes definir más campos si son necesarios
          authData: z.object({}).passthrough(), // Puedes definir más campos si son necesarios
          workDetails: z.object({}).passthrough(), // Puedes definir más campos si son necesarios
          createdAt: z.string(),
          updatedAt: z.string(),
          __v: z.number(),
          cuit: z.string(),
          dni: z.string(),
        })
      ),
      statusWorkHistory: z
        .array(
          z.object({
            status: z.string(),
            comment: z.string(),
            date: z.string(),
          })
        )
        .optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
      __v: z.number(),
    });

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  test('Cambiar estado de trabajo', async () => {
    const response = await pactum
      .spec()
      .patch(`${baseUrl}/${workId}/changeStatus`)
      .withHeaders('Authorization', token)
      .withJson({
        status: 'Finalizado',
        comment: 'Trabajo completado exitosamente',
      })
      .expectStatus(200);

    // Validación del cuerpo de la respuesta usando Zod
    const responseSchema = z.object({
      _id: z.string(),
      name: z.string(),
      supervisors: z.array(z.string()),
      workType: z.string(),
      status: z.string(),
      archived: z.boolean(),
      location: z.object({
        country: z.string(),
        state: z.string(),
        city: z.string(),
        apartment: z.boolean(),
        houseNumber: z.number(),
        floor: z.string().optional(),
        door: z.string().optional(),
        street: z.string(),
        postalCode: z.string(),
      }),
      estimatedDateInit: z.string(),
      estimatedDateFinish: z.string(),
      subContractor: z.boolean(),
      fromCompany: z.string(),
      usersAssigned: z.array(z.string()),
      statusWorkHistory: z.array(
        z.object({
          status: z.string(),
          comment: z.string(),
          date: z.string(),
        })
      ),
      createdAt: z.string(),
      updatedAt: z.string(),
      __v: z.number(),
    });

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  test('Agregar supervisores a un trabajo', async () => {
    const response = await pactum
      .spec()
      .patch(`${baseUrl}/${workId}/addSupervisor`)
      .withHeaders('Authorization', token)
      .withJson({
        supervisors: ['66fa1240c6070d7f98d54f72'], // Asegúrate de que este ID sea válido
      })
      .expectStatus(200);

    // Validación del cuerpo de la respuesta usando Zod
    const responseSchema = z.object({
      _id: z.string(),
      name: z.string(),
      supervisors: z.array(z.string()),
      workType: z.string(),
      status: z.string(),
      archived: z.boolean(),
      location: z.object({
        country: z.string(),
        state: z.string(),
        city: z.string(),
        apartment: z.boolean(),
        houseNumber: z.number(),
        street: z.string(),
        postalCode: z.string(),
        floor: z.string().optional(),
        door: z.string().optional(),
      }),
      estimatedDateInit: z.string(),
      estimatedDateFinish: z.string(),
      subContractor: z.boolean(),
      fromCompany: z.string(),
      usersAssigned: z.array(z.string()),
      statusWorkHistory: z
        .array(
          z.object({
            status: z.string(),
            comment: z.string(),
            date: z.string(),
          })
        )
        .optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
      __v: z.number(),
    });

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  test('Agregar empleados a un trabajo', async () => {
    const response = await pactum
      .spec()
      .patch(`${baseUrl}/${workId}/addEmployees`)
      .withHeaders('Authorization', token)
      .withJson({
        employees: ['66fa1240c6070d7f98d54f72'], // Asegúrate de que este ID sea válido
      })
      .expectStatus(200);

    // Validación del cuerpo de la respuesta usando Zod
    const responseSchema = z.object({
      _id: z.string(),
      name: z.string(),
      supervisors: z.array(z.string()),
      workType: z.string(),
      status: z.string(),
      archived: z.boolean(),
      location: z.object({
        country: z.string(),
        state: z.string(),
        city: z.string(),
        apartment: z.boolean(),
        houseNumber: z.number(),
        street: z.string(),
        postalCode: z.string(),
        floor: z.string().optional(),
        door: z.string().optional(),
      }),
      estimatedDateInit: z.string(),
      estimatedDateFinish: z.string(),
      subContractor: z.boolean(),
      fromCompany: z.string(),
      usersAssigned: z.array(z.string()),
      statusWorkHistory: z
        .array(
          z.object({
            status: z.string(),
            comment: z.string(),
            date: z.string(),
          })
        )
        .optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
      __v: z.number(),
    });

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  test('Crear trabajo con datos inválidos', async () => {
    const response = await pactum
      .spec()
      .post(baseUrl)
      .withHeaders('Authorization', token)
      .withJson({
        name: '', // Nombre vacío
        userContractor: 'invalid_id', // ID inválido
        supervisors: [], // Sin supervisores
        workType: 'Desarrollo',
        status: 'Activo',
        location: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Buenos Aires',
          apartment: true,
          houseNumber: 123,
          street: 'Av. Corrientes',
          postalCode: '1045',
        },
        estimatedDateInit: 'invalid_date', // Fecha inválida
        estimatedDateFinish: '2024-12-31T00:00:00.000Z',
        subContractor: false,
        fromCompany: '64503ab482d7efa8c22edd5b',
        usersAssigned: ['invalid_id'], // ID inválido
      })
      .expectStatus(400); // Esperamos un error de validación
  });

  test('Obtener trabajo por ID que no existe', async () => {
    const invalidWorkId = '66fa1240c6070d7f98d54f72'; // Un ID que no existe
    const response = await pactum
      .spec()
      .get(`${baseUrl}/${invalidWorkId}`)
      .withHeaders('Authorization', token)
      .expectStatus(404); // Esperamos un 404 Not Found
  });

  test('Cambiar estado de trabajo con ID inválido', async () => {
    const invalidWorkId = 'invalid_work_id'; // Un ID que no existe
    const response = await pactum
      .spec()
      .patch(`${baseUrl}/${invalidWorkId}/changeStatus`)
      .withHeaders('Authorization', token)
      .withJson({
        status: 'Finalizado',
        comment: 'Trabajo completado exitosamente',
      })
      .expectStatus(400); // Esperamos un 404 Not Found
  });

  test('Agregar empleados a un trabajo que no existe', async () => {
    const invalidWorkId = 'invalid_work_id'; // Un ID que no existe
    const response = await pactum
      .spec()
      .patch(`${baseUrl}/${invalidWorkId}/addEmployees`)
      .withHeaders('Authorization', token)
      .withJson({
        employees: ['66fa1240c6070d7f98d54f72'], // Asegúrate de que este ID sea válido
      })
      .expectStatus(400); // Esperamos un 404 Bad Request
  });

  test('Crear trabajo con token inválido', async () => {
    const invalidToken = 'Bearer invalid_token'; // Token inválido

    const response = await pactum
      .spec()
      .post(baseUrl)
      .withHeaders('Authorization', invalidToken)
      .withJson({
        name: 'Proyecto de Prueba',
        userContractor: '66fa1240c6070d7f98d54f72', // Asegúrate de que este ID sea válido
        supervisors: ['66fa1240c6070d7f98d54f72'], // Asegúrate de que este ID sea válido
        workType: 'Desarrollo',
        status: 'Activo',
        location: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Buenos Aires',
          apartment: true,
          houseNumber: 123,
          street: 'Av. Corrientes',
          postalCode: '1045',
          floor: '6',
          door: 'B',
        },
        estimatedDateInit: '2024-01-01T00:00:00.000Z',
        estimatedDateFinish: '2024-12-31T00:00:00.000Z',
        subContractor: false,
        fromCompany: '64503ab482d7efa8c22edd5b', // Asegúrate de que este ID sea válido
        usersAssigned: ['66fa1240c6070d7f98d54f72'], // Asegúrate de que este ID sea válido
      })
      .expectStatus(401); // Esperamos un 401 Unauthorized
  });
});

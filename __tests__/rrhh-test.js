import Chance from 'chance';
import pactum from 'pactum';
import { z } from 'zod'; // Importar Zod
const baseUrl = 'http://localhost:3000/rrhh';

const chance = new Chance();
let token;
let tokenUnauthorized;

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
    tokenUnauthorized = `Bearer ${response.body.access_token}`;
  });
});

describe('Login admin', () => {
  test('Login exitoso con rol admin', async () => {
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

describe('TESTING CREATEUSER', () => {
  test('Creación de usuario con datos válidos de forma exitosa', async () => {
    const cuit = chance
      .integer({ min: 20000000000, max: 20999999999 })
      .toString();
    const dni = chance.integer({ min: 10000000, max: 99999999 }).toString();
    const phone = `+5493834${chance
      .integer({ min: 100000, max: 999999 })
      .toString()}`;
    const email = chance.email();

    const response = await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson({
        name: 'FAKE',
        lastname: 'TEST',
        cuit: cuit,
        gender: 'M',
        birthDate: '2001-09-14T00:00:00.000Z',
        dni: dni,
        phone: phone,
        image: 'https://example.com/image1.png',
        companyId: '659c7626ecbb78591228bd01',
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          apartment: true,
          houseNumber: 123,
          floor: '3',
          door: 'B',
          street: 'Av. Córdoba',
          postalCode: '1045',
        },
        authData: {
          email: email,
          password: 'Nackgomez14@',
        },
        workDetails: {
          role: 'user',
          supervisor: true,
          activityStartDate: '2024-09-30T23:35:29.473Z',
          employeeType: 'INFORMAL',
          workIn: ['646fb77f089f94ee9945a5a1'],
        },
      })
      .expectStatus(201);

    // Validación del cuerpo de la respuesta usando Zod
    const responseSchema = z.object({
      _id: z.string(),
      name: z.string(),
      lastname: z.string(),
      cuit: z.string(),
      gender: z.string(),
      birthDate: z.string(),
      dni: z.string(),
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
        email: z.string().email(),
        password: z.string(),
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
    });

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  test('error de usuario sin token de autorización unauthorized', async () => {
    await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withJson({
        name: 'Lucía',
        lastname: 'Martínez ',
        cuit: '20565646502',
        gender: 'F',
        birthDate: '1992-07-15T00:00:00.000Z',
        dni: '31011223',
        phone: '+541122334466',
        image: 'https://example.com/image2.png',
        companyId: '659c7626ecbb78591228bd02',
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          apartment: false,
          houseNumber: 456,
          street: 'Av. Santa Fe',
          postalCode: '1054',
        },
        authData: {
          email: 'luciam@example.com',
          password: 'securePasswordLucia123@',
        },
        workDetails: {
          role: 'employee',
          supervisor: false,
          activityStartDate: '2024-10-01T00:00:00.000Z',
          employeeType: 'FULL_TIME',
          workIn: ['646fb77f089f94ee9945a5a2'],
        },
      })
      .expectStatus(401); // Espera un error 401 (No autorizado)
  });

  test('error por falta de datos bad request', async () => {
    await pactum
      .spec()
      .post('http://localhost:3000/rrhh ')
      .withHeaders('Authorization', token)
      .withJson({
        name: '', // Nombre vacío
        lastname: 'Rodríguez',
        cuit: '20565646503',
        gender: 'M',
        birthDate: '1990-03-20T00:00:00.000Z',
        dni: '32011223',
        phone: '+541122334477',
        image: 'https://example.com/image3.png',
        companyId: '659c7626ecbb78591228bd03',
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          apartment: true,
          houseNumber: 789,
          floor: '2',
          door: 'C',
          street: 'Av. Rivadavia',
          postalCode: '1063',
        },
        authData: {
          email: 'rodriguezm@example.com',
          password: 'securePasswordRodriguez123@',
        },
        workDetails: {
          role: 'user',
          supervisor: false,
          activityStartDate: '2024-10-01T00:00:00.000Z',
          employeeType: 'PART_TIME',
          workIn: ['646fb77f089f94ee9945a5a3'],
        },
      })
      .expectStatus(400)
      .expectBodyContains('name must be longer than or equal to 2 characters');
  });

  test('Error en Creación de usuario con cuit inválido', async () => {
    await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson({
        name: 'Jorge',
        lastname: 'Pérez',
        cuit: '123', // cuit inválido
        gender: 'M',
        birthDate: '1988-04-25T00:00:00.000Z',
        dni: '33011223',
        phone: '+541122334488',
        image: 'https://example.com/image4.png',
        companyId: '659c7626ecbb78591228bd04',
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          apartment: true,
          houseNumber: 101,
          floor: '7',
          door: 'D',
          street: 'Av. Belgrano',
          postalCode: '1070',
        },
        authData: {
          email: 'jorgep@example.com',
          password: 'securePasswordJorge123@',
        },
        workDetails: {
          role: 'admin',
          supervisor: true,
          activityStartDate: '2024-10-01T00:00:00.000Z',
          employeeType: 'INFORMAL',
          workIn: ['646fb77f089f94ee9945a5a4'],
        },
      })
      .expectStatus(400) // Error 400 (Bad Request)
      .expectBodyContains('cuit must be longer than or equal to 8 characters');
  });

  test('Error en Creación de usuario con fecha de nacimiento inválida', async () => {
    await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson({
        name: 'Ana',
        lastname: 'López',
        birthDate: '1990-13-01', // Fecha inválida
        cuit: '20565646504',
        dni: '34011223',
        phone: '+541122334499',
        image: 'https://example.com/image5.png',
        companyId: '659c7626ecbb78591228bd05',
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          apartment: true,
          houseNumber: 102,
          floor: '8',
          door: 'E',
          street: 'Av. Callao',
          postalCode: '1084',
        },
        authData: {
          email: 'anal@example.com',
          password: 'securePasswordAna123@',
        },
        workDetails: {
          role: 'employee',
          supervisor: false,
          activityStartDate: '2024-10-01T00:00:00.000Z',
          employeeType: 'INFORMAL',
          workIn: ['646fb77f089f94ee9945a5a5'],
        },
      })
      .expectStatus(400)
      .expectBodyContains('birthDate must be a valid ISO 8601 date string');
  });

  test('Error en Creación de usuario con companyId inválido', async () => {
    const response = await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson({
        name: 'Pedro',
        lastname: 'Ramírez',
        cuit: '20565646505',
        gender: 'M',
        birthDate: '1992-12-01T00:00:00.000Z',
        dni: '35011223',
        phone: '+541122334411',
        image: 'https://example.com/image6.png',
        companyId: '123', // companyId inválido
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          apartment: true,
          houseNumber: 103,
          floor: '9',
          door: 'F',
          street: 'Av. Corrientes',
          postalCode: '1094',
        },
        authData: {
          email: 'pedror@example.com',
          password: 'securePasswordPedro123@',
        },
        workDetails: {
          role: 'admin',
          supervisor: true,
          activityStartDate: '2024-10-01T00:00:00.000Z',
          employeeType: 'INFORMAL',
          workIn: ['646fb77f089f94ee9945a5a6'],
        },
      })
      .expectStatus(400)
      .expectBodyContains('Invalid ObjectId: 123');
  });
});

describe('findAll - RRHH Service', () => {
  test('Acceso exitoso a findAll con un token válido', async () => {
    await pactum
      .spec()
      .get(baseUrl)
      .withHeaders('Authorization', token)
      .expectStatus(200);
  });

  test('Acceso denegado a findAll sin token de autorización', async () => {
    await pactum
      .spec()
      .get(baseUrl)
      .expectStatus(401)
      .expectBodyContains('Unauthorized');
  });

  test('Acceso denegado a findAll con token inválido', async () => {
    await pactum
      .spec()
      .get(baseUrl)
      .withHeaders(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI156NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZmExMjQwYzYwNzBkN2Y5OGQ1NGY3MiIsImNvbXBhbnlJZCI6IjY1MWYyNDRkZmFkY2RiZjM0MjVjN2Q3NSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyNzg3OTcxNywiZXhwIjoxNzI3ODgzMzE3fQ.2GLiqjMB8OrIJo3mWxWF6NN3UIbua11PvwXaVChYUgw'
      )
      .expectStatus(401)
      .expectBodyContains('Unauthorized');
  });

  test('Acceso denegado a findAll sin rol de admin', async () => {
    await pactum
      .spec()
      .get(baseUrl)
      .withHeaders('Authorization', tokenUnauthorized)
      .expectStatus(403)
      .expectBodyContains('No tienes permisos para acceder a este recurso');
  });
});

describe('findOne - RRHH Service', () => {
  // 1. Búsqueda exitosa con ID válido
  test('Buscar un usuario por ID con éxito', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/findOne/66fa1240c6070d7f98d54f72`)
      .withHeaders('Authorization', token)
      .withQueryParams('identificator', 'id')
      .expectStatus(200);

    // Validación del cuerpo de la respuesta usando Zod
    const responseSchema = z.object({
      _id: z.string(),
      name: z.string(),
      lastname: z.string(),
      cuit: z.string(),
      gender: z.string(),
      birthDate: z.string(),
      dni: z.string(),
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
        email: z.string().email(),
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
    });

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  // 2. Búsqueda fallida con ID inválido
  test('Buscar un usuario con un ID inválido (no ObjectId)', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/findOne/66fa1240c6070d7f98d54f722`)
      .withHeaders('Authorization', token)
      .expectStatus(400); // Un ID inválido debería devolver un error 400
  });

  // 3. Búsqueda sin proporcionar ID
  test('Buscar un usuario sin ID', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/findOne/`)
      .withHeaders('Authorization', token)
      .withQueryParams('identificator', 'id')
      .expectStatus(404); // Espera un error 404 (No se encontró la ruta)
  });

  // 5. Búsqueda de usuario inexistente (error 404)
  test('Buscar un usuario que no existe', async () => {
    const id = '60b8d8f4c3f8c12b8c0e1f5a'; // Asegúrate de que este ID no exista en la base de datos
    const expectedMessage = `User with id: \"${id}\" was not found!`;

    await pactum
      .spec()
      .get(`${baseUrl}/findOne/${id}`)
      .withHeaders('Authorization', token)
      .expectStatus(404)
      .withQueryParams('identificator', 'id')
      .expectBodyContains({
        message: expectedMessage,
        error: 'Not Found',
        statusCode: 404,
      });
  });
});

describe('findAvailibleEmpleoyee - RRHH Service', () => {
  test('Obtener empleados disponibles con un workId válido', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/availibeEmpleoyees/646fb77f089f94ee9945a5a1`)
      .withHeaders('Authorization', token)
      .expectStatus(200);

    // Esquema de validación de la respuesta usando Zod (esperando un array)
    const responseSchema = z.array(
      z.object({
        _id: z.string(),
        name: z.string(),
        lastname: z.string(),
        gender: z.string(),
        birthDate: z.string(),
        dni: z.string(),
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
          email: z.string().email(),
          firstLogin: z.boolean(),
          status: z.boolean(),
        }),
        workDetails: z.object({
          role: z.string(),
          supervisor: z.boolean(),
          activityStartDate: z.string(),
          employeeType: z.string(),
          workIn: z.array(z.string()), // Ajusta esto si "workIn" tiene un tipo diferente
        }),
        createdAt: z.string(),
        updatedAt: z.string(),
        __v: z.number(),
        cuit: z.string(),
      })
    );

    const result = responseSchema.safeParse(response.body);

    expect(result.success).toBe(true);
  });

  test('Error al obtener empleados disponibles con un workId inválido', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/availibeEmpleoyees/4845646561`)
      .withHeaders('Authorization', token)
      .expectStatus(400)
      .expectBodyContains({
        message: 'Invalid ObjectId',
        error: 'Bad Request',
        statusCode: 400,
      });
  });

  test('Acceso denegado a obtener empleados disponibles sin token', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/availibeEmpleoyees/646fb77f089f94ee9945a5e9`)
      .expectStatus(401)
      .expectBodyContains('Unauthorized');
  });
});

describe('employeesStatusChanges - RRHH Service', () => {
  test('should return employee status changes for valid company and date range', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/employeesStatusChanges`)
      .withHeaders('Authorization', token)
      .withQueryParams({
        startDate: '2015-01-01',
        endDate: '2024-09-31',
      })
      .expectStatus(200);

    const responseSchema = z.array(
      z.object({
        // Define aquí el esquema de respuesta esperado
        _id: z.string(),
        name: z.string(),
        statusChangeDate: z.string(),
        // Otros campos según tu modelo
      })
    );

    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  test('should return 401 for unauthorized access', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/employeesStatusChanges`)
      .expectStatus(401);
  });
});

describe('employeesAmmount - RRHH Service', () => {
  test('should return the amount of employees for a valid company and date range', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/employeesAmmount`)
      .withHeaders('Authorization', token)
      .withQueryParams({
        startDate: '2015-01-01',
        endDate: '2024-09-31',
      })
      .expectStatus(200);

    const responseSchema = z.tuple([z.number(), z.number(), z.number()]); // Suponiendo que devuelve un array con 3 números
    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
  });

  test('should return 401 for unauthorized access', async () => {
    await pactum.spec().get(`${baseUrl}/employeesAmmount`).expectStatus(401);
  });

  test('should return 400 for invalid date range', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/employeesAmmount`)
      .withHeaders('Authorization', token)
      .withQueryParams({
        startDate: 'invalid-date',
        endDate: 'invalid-date',
      })
      .expectStatus(400);
  });

  test('should return 400 for future date range', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/employeesAmmount`)
      .withHeaders('Authorization', token)
      .withQueryParams({
        startDate: '3000-01-01',
        endDate: '3000-12-31',
      })
      .expectStatus(400);
  });

  test('should return correct amount of employees with no records', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/employeesAmmount`)
      .withHeaders('Authorization', token)
      .withQueryParams({
        startDate: '2019-01-01',
        endDate: '2019-01-02',
      })
      .expectStatus(200);

    const responseSchema = z.tuple([z.number(), z.number(), z.number()]); // Debería devolver [0, 0, 0]
    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
    expect(response.body).toEqual([0, 0, 0]); // Asegúrate de que el resultado sea [0, 0, 0]
  });

  test('should return correct amount of employees with out of range dates', async () => {
    const response = await pactum
      .spec()
      .get(`${baseUrl}/employeesAmmount`)
      .withHeaders('Authorization', token)
      .withQueryParams({
        startDate: '2020-01-01',
        endDate: '2020-01-31',
      })
      .expectStatus(200);

    const responseSchema = z.tuple([z.number(), z.number(), z.number()]); // Debería devolver un resultado acorde
    const result = responseSchema.safeParse(response.body);
    expect(result.success).toBe(true);
    // Asegúrate de que el resultado sea correcto según tus datos de prueba
  });
});

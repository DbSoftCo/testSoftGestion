import Chance from 'chance';
import pactum from 'pactum';
import { ObjectId } from 'mongodb'; // Importar ObjectId de MongoDB
import { userResponseSchema } from '../zodSchemas/userSchema';

const baseUrl = 'http://localhost:3000/rrhh';
let token;
let tokenUnauthorized;

const chance = new Chance();

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
  let createdUserId; // Variable para almacenar el ID del usuario creado

  test('Creación de usuario con datos válidos de forma exitosa', async () => {
    const cuit = chance.integer({ min: 20000000000, max: 20999999999 }).toString();
        const dni = chance.integer({ min: 10000000, max: 99999999 }).toString();
        const phone = `+5493834${chance.integer({ min: 100000, max: 999999 }).toString()}`;
        const email = chance.email();
    const userData = {
                    "name": "FAKE",
                    "lastname": "TEST",
                    "CUIT": cuit,
                    "gender": "M",
                    "birthDate": "2001-09-14T00:00:00.000Z",
                    "DNI": dni,
                    "phone": phone,
                    "image": "https://example.com/image1.png",
                    "companyId": "659c7626ecbb78591228bd01",
                    "address": {
                        "country": "Argentina",
                        "state": "Buenos Aires",
                        "city": "Ciudad Autónoma de Buenos Aires",
                        "apartment": true,
                        "houseNumber": 123,
                        "floor": "3",
                        "door": "B",
                        "street": "Av. Córdoba",
                        "postalCode": "1045"
                    },
                    "authData": {
                        "email": email,
                        "password": "Nackgomez14@"
                    },
                    "workDetails": {
                        "role": "user",
                        "supervisor": true,
                        "activityStartDate": "2024-09-30T23:35:29.473Z",
                        "employeeType": "INFORMAL",
                        "workIn": [
                            "646fb77f089f94ee9945a5a1"
                        ]
                    }
                }

    const response = await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson(userData)
      .expectStatus(201);

    createdUserId = response.body._id; // Almacenar el ID del usuario creado

    // Validar la respuesta con Zod
    userResponseSchema.parse(response.body);
  });

  test('Error de usuario sin token de autorización (unauthorized)', async () => {
    await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withJson({
        name: 'Lucía',
        lastname: 'Martínez',
        CUIT: '20565646502',
        gender: 'F',
        birthDate: '1992-07-15T00:00:00.000Z',
        DNI: '31011223',
        phone: '+541122334466',
        image: 'https://example.com/image2.png',
        companyId: new ObjectId().toString(), // Generar un ObjectId válido
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
          workIn: [new ObjectId().toString()], // Generar un array con un ObjectId válido
        },
      })
      .expectStatus(401); // Espera un error 401 (No autorizado)
  });

  test('Error por falta de datos (bad request)', async () => {
    await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson({
        name: '', // Nombre vacío
        lastname: 'Rodríguez',
        CUIT: '20565646503',
        gender: 'M',
        birthDate: '1990-03-20T00:00:00.000Z',
        DNI: '32011223',
        phone: '+541122334477',
        image: 'https://example.com/image3.png',
        companyId: new ObjectId().toString(), // Generar un ObjectId válido
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
          workIn: [new ObjectId().toString()], // Generar un array con un ObjectId válido
        },
      })
      .expectStatus(400)
      .expectBodyContains('name must be longer than or equal to 2 characters');
  });

  test('Error en Creación de usuario con CUIT inválido', async () => {
    await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson({
        name: 'Jorge',
        lastname: 'Pérez',
        CUIT: '123', // CUIT inválido
        gender: 'M',
        birthDate: '1988-04-25T00:00:00.000Z',
        DNI: '33011223',
        phone: '+541122334488',
        image: 'https://example.com/image4.png',
        companyId: new ObjectId().toString(), // Generar un ObjectId válido
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
          workIn: [new ObjectId().toString()], // Generar un array con un ObjectId válido
        },
      })
      .expectStatus(400) // Error 400 (Bad Request)
      .expectBodyContains('CUIT must be longer than or equal to 8 characters');
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
        CUIT: '20565646504',
        DNI: '34011223',
        phone: '+541122334499',
        image: 'https://example.com/image5.png',
        companyId: new ObjectId().toString(), // Generar un ObjectId válido
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
          workIn: [new ObjectId().toString()], // Generar un array con un ObjectId válido
        },
      })
      .expectStatus(400)
      .expectBodyContains('birthDate must be a valid ISO 8601 date string');
  });

  test('Error en Creación de usuario con companyId inválido', async () => {
    await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson({
        name: 'Pedro',
        lastname: 'Ramírez',
        CUIT: '20565646505',
        gender: 'M',
        birthDate: '1992-12-01T00:00:00.000Z',
        DNI: '35011223',
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
          workIn: [new ObjectId().toString()], // Generar un array con un ObjectId válido
        },
      })
      .expectStatus(400)
      .expectBodyContains('companyId must be a MongoDB ObjectId instance');
  });
});

describe('findOne - RRHH Service', () => {
  // 1. Búsqueda exitosa con ID válido
  test('Buscar un usuario por ID con éxito', async () => {
    const id = "6716f0ffbb1f2bca67c12cdf"; // Generar un ObjectId válido
    const userData = {
      name: chance.name(),
      lastname: chance.last(),
      CUIT: chance.integer({ min: 20000000000, max: 20999999999 }).toString(),
      gender: chance.gender(),
      birthDate: chance.date().toISOString(),
      DNI: chance.integer({ min: 10000000, max: 99999999 }).toString(),
      phone: `+5493834${chance
        .integer({ min: 100000, max: 999999 })
        .toString()}`,
      image: chance.url(),
      companyId: new ObjectId().toString(), // Generar un ObjectId válido
      address: {
        country: 'Argentina',
        state: 'Buenos Aires',
        city: 'Ciudad Autónoma de Buenos Aires',
        apartment: chance.bool(),
        houseNumber: chance.integer({ min: 1, max: 1000 }),
        floor: chance.integer({ min: 1, max: 10 }).toString(),
        door: chance.character({ alpha: true }),
        street: chance.street(),
        postalCode: chance.zip(),
      },
      authData: {
        email: chance.email(),
        password: 'Nackgomez14@',
      },
      workDetails: {
        role: 'user',
        supervisor: chance.bool(),
        activityStartDate: chance.date().toISOString(),
        employeeType: chance.pickone(['INFORMAL', 'FORMAL']),
        workIn: [new ObjectId().toString()], // Generar un array con un ObjectId válido
      },
    };

    await pactum
      .spec()
      .post('http://localhost:3000/rrhh')
      .withHeaders('Authorization', token)
      .withJson(userData)
      .expectStatus(201);

    const response = await pactum
      .spec()
      .get(`${baseUrl}/findOne/${id}`)
      .withHeaders('Authorization', token)
      .withQueryParams('identificator', 'id') // Agrega esto si se necesita en la query
      .expectStatus(200)
      .expectJsonLike({
        _id: id,
        name: userData.name,
        lastname: userData.lastname,
        CUIT: userData.CUIT,
        gender: userData.gender,
        birthDate: userData.birthDate,
        DNI: userData.DNI,
        phone: userData.phone,
        image: userData.image,
        companyId: userData.companyId,
        address: userData.address,
        authData: userData.authData,
        workDetails: userData.workDetails,
      });
  });
});

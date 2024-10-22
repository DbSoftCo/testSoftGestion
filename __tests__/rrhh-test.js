import Chance from 'chance';
import pactum from 'pactum';
import { z } from 'zod'; // Importar Zod para la validación de esquemas
import { userResponseSchema } from '../zodSchemas/userSchema';

const baseUrl = 'http://localhost:3000/rrhh';
let token;
let createdUserId; // Declarar aquí para que sea accesible en todo el archivo

const chance = new Chance();

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
    const userData = {
      name: 'FAKE',
      lastname: 'TEST',
      CUIT: cuit,
      gender: 'M',
      birthDate: '2001-09-14T00:00:00.000Z',
      DNI: dni,
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
    };

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
});

describe('findOne - RRHH Service', () => {
  test('Buscar un usuario por ID con éxito', async () => {
    // Imprimir el ID para verificar su valor
    console.log('Buscando usuario con ID:', createdUserId);

    // Asegúrate de que createdUser Id no sea undefined o null
    expect(createdUserId).toBeDefined();

    const response = await pactum
      .spec()
      .get(`${baseUrl}/findOne/${createdUserId}`)
      .withHeaders('Authorization', token)
      .expectStatus(200);

    // Definición del esquema de Zod del cuerpo de la respuesta
    const responseSchema = z.object({
      _id: z.string(),
      name: z.string(),
      lastname: z.string(),
      CUIT: z.string().length(11),
      gender: z.string(),
      birthDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
        message: 'Invalid date',
      }),
      DNI: z.string(),
      phone: z.string(),
      image: z.string().url(),
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
        activityStartDate: z
          .string()
          .refine((date) => !Number.isNaN(Date.parse(date)), {
            message: 'Invalid date',
          }),
        employeeType: z.string(),
        workIn: z.array(z.string()),
      }),
    });

    // Validar el cuerpo de la respuesta usando Zod
    const result = responseSchema.safeParse(response.body);

    // Verificar si el esquema es válido
    if (!result.success) {
      console.error(result.error.format());
    }

    expect(result.success).toBe(true);
  });
});

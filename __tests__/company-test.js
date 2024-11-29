import Chance from 'chance';
import pactum from 'pactum';
import { z } from 'zod';

const baseUrl = 'http://localhost:3000/companies';
const chance = new Chance();
let token;
const usedCompanyNames = new Set();
let companyId; // Definir companyId aquí para que sea accesible en todo el archivo

// Función para generar un nombre de empresa único
const generateUniqueCompanyName = () => {
  let companyName;

  do {
    const randomId = chance.integer({ min: 1000, max: 9999 });
    companyName = `${chance.company()} ${randomId}`;
  } while (usedCompanyNames.has(companyName));

  usedCompanyNames.add(companyName);
  return companyName;
};

// Esquema de validación para la respuesta de la compañía
const companySchema = z.object({
  _id: z.string(),
  address: z.object({
    country: z.string(),
    state: z.string(),
    city: z.string(),
    street: z.string(),
    apartment: z.boolean(),
    houseNumber: z.number(),
    postalCode: z.string(),
    floor: z.string(),
    door: z.string(),
  }),
  owner: z.string(),
  cuit: z.string(),
  name: z.string(),
  type: z.string(),
  enabled: z.boolean(),
  billing: z.string(),
  paymentPeriod: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  __v: z.number(),
});

describe('Company Module Tests', () => {
  beforeAll(async () => {
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

  describe('Create Company', () => {
    test('should create a company successfully', async () => {
      const validCompanyData = {
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          street: 'Av. Corrientes',
          apartment: true,
          houseNumber: 71,
          postalCode: '43203',
          floor: '3',
          door: 'F',
        },
        owner: '66fa1240c6070d7f98d54f72', // Asegúrate de que este sea un ObjectId válido
        type: 'constructora',
        cuit: '20-12345678-9',
        name: generateUniqueCompanyName(),
        enabled: true,
        billing: 'Monthly',
        paymentPeriod: 'semestral',
      };

      const response = await pactum
        .spec()
        .post(baseUrl)
        .withHeaders('Authorization', token)
        .withJson(validCompanyData)
        .expectStatus(201);

      expect(response.body).toMatchObject(validCompanyData);
      expect(response.body._id).toBeDefined();
      companyId = response.body._id; // Guardar el ID de la compañía creada
    });

    test('should return 400 if company data is invalid', async () => {
      const invalidCompanyData = {
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          street: 'Av. Corrientes',
          apartment: true,
          houseNumber: 71,
          postalCode: '43203',
          floor: '3',
          door: 'F',
        },
        owner: '', // Owner is required but empty
        cuit: '20-12345678-9',
        name: '', // Name is required but empty
        type: 'logistica',
        enabled: true,
        billing: 'Monthly',
        paymentPeriod: 'semestral',
      };

      const response = await pactum
        .spec()
        .post(baseUrl)
        .withHeaders('Authorization', token)
        .withJson(invalidCompanyData)
        .expectStatus(400);

      expect(response.body.message).toEqual([
        'name should not be empty',
        'owner should not be empty',
      ]);
    });
  });

  describe('Get Company ', () => {
    test('should get a company by ID', async () => {
      expect(companyId).toBeDefined();
      const response = await pactum
        .spec()
        .get(`${baseUrl}/${companyId}`)
        .withHeaders('Authorization', token)
        .expectStatus(200);

      const result = companySchema.safeParse(response.body);
      expect(result.success).toBe(true);
      expect(response.body._id).toBe(companyId);
    });

    test('should return 404 if company not found', async () => {
      const nonExistentCompanyId = '507f1f77bcf86cd799439011';

      const response = await pactum
        .spec()
        .get(`${baseUrl}/${nonExistentCompanyId}`)
        .withHeaders('Authorization', token)
        .expectStatus(404);

      expect(response.body.message).toBe(
        `La compañía con ID: ${nonExistentCompanyId} no fue encontrada.`
      );
    });
  });

  describe('Update Company', () => {
    test('should update a company successfully', async () => {
      const updatedData = {
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          street: 'Av. Corrientes',
          apartment: true,
          houseNumber: 71,
          postalCode: '43203',
          floor: '3',
          door: 'F',
        },
        owner: '66fa1240c6070d7f98d54f72',
        type: 'constructora',
        cuit: '20-12345678-9',
        name: `Updated Company Name ${chance.integer({
          min: 1000,
          max: 9999,
        })}`,
        enabled: false,
        billing: 'Monthly',
        paymentPeriod: 'semestral',
      };

      const response = await pactum
        .spec()
        .patch(`${baseUrl}/${companyId}`)
        .withHeaders('Authorization', token)
        .withJson(updatedData)
        .expectStatus(200);

      const result = companySchema.safeParse(response.body);
      expect(result.success).toBe(true);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.enabled).toBe(updatedData.enabled);
    });

    test('should return 400 if update data is invalid', async () => {
      const updatedData = {
        address: {
          country: 'Argentina',
          state: 'Buenos Aires',
          city: 'Ciudad Autónoma de Buenos Aires',
          street: 'Av. Corrientes',
          apartment: true,
          houseNumber: 71,
          postalCode: '43203',
          floor: '3',
          door: 'F',
        },
        owner: '66fa1240c6070d7f98d54f72',
        type: 'constructora',
        cuit: '20-12345678-9',
        name: '', // Nombre vacío
        enabled: false,
      };

      const response = await pactum
        .spec()
        .patch(`${baseUrl}/invalidCompanyId`) // Usar un ID inválido
        .withHeaders('Authorization', token)
        .withJson(updatedData)
        .expectStatus(400);

      expect(response.body.message).toEqual('Invalid ObjectId');
    });
  });

  describe('Change Company Status', () => {
    test('should change the status of a company', async () => {
      const response = await pactum
        .spec()
        .put(`${baseUrl}/${companyId}/changeStatus`)
        .withHeaders('Authorization', token)
        .expectStatus(200);

      const result = companySchema.safeParse(response.body);
      expect(result.success).toBe(true);
      expect(response.body.enabled).toBe(true);
    });
  });

  describe('Change Company Owner', () => {
    test('should change the owner of a company', async () => {
      const newOwnerData = {
        owner: '60d5ec49f1b2c8b1f8c8e8e9', // Asegúrate de que este sea un ObjectId válido
      };

      const response = await pactum
        .spec()
        .put(`${baseUrl}/${companyId}/changeOwner`)
        .withHeaders('Authorization', token)
        .withJson(newOwnerData)
        .expectStatus(200);

      const result = companySchema.safeParse(response.body);
      expect(result.success).toBe(true);
      expect(response.body.owner).toBe(newOwnerData.owner);
    });

    test('should return 400 if change owner fails', async () => {
      const newOwnerData = {
        owner: '', // Simulando un error al pasar un valor vacío
      };

      const response = await pactum
        .spec()
        .put(`${baseUrl}/${companyId}/changeOwner`)
        .withHeaders('Authorization', token)
        .withJson(newOwnerData)
        .expectStatus(400);

      expect(response.body.message).toEqual([
        'owner must be a mongodb id',
        'owner should not be empty',
      ]);
    });
  });
});

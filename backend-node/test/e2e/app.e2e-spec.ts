import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AddressInfo } from 'node:net';
import request from 'supertest';
import { WebSocket } from 'ws';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/api/configure-app';

describe('Hotel Management API (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let adminToken: string;
  let staffToken: string;
  const hubs: HubConnection[] = [];

  const api = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  const login = async (email: string, password: string): Promise<string> => {
    const res = await api().post('/api/auth/login').send({ email, password }).expect(200);
    return res.body.token as string;
  };

  const connectHub = async (token: string): Promise<HubConnection> => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/reservations`, {
        accessTokenFactory: () => token,
        transport: HttpTransportType.WebSockets,
      })
      .configureLogging(LogLevel.None)
      .build();
    await connection.start();
    hubs.push(connection);
    return connection;
  };

  const nextEvent = <T>(connection: HubConnection, event: string): Promise<T> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), 5000);
      connection.on(event, (payload: T) => {
        clearTimeout(timer);
        resolve(payload);
      });
    });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.listen(0);
    baseUrl = `http://localhost:${(app.getHttpServer().address() as AddressInfo).port}`;

    adminToken = await login('admin@hotel.local', 'Admin123!');
    staffToken = await login('staff@hotel.local', 'Staff123!');
  });

  afterAll(async () => {
    await Promise.all(hubs.map((hub) => hub.stop()));
    await app.close();
  });

  describe('auth', () => {
    it('returns the current user from the token', async () => {
      const res = await api().get('/api/auth/me').set(auth(adminToken)).expect(200);
      expect(res.body).toEqual({ userId: 1, email: 'admin@hotel.local', fullName: 'Hotel Administrator' });
    });

    it('rejects requests without a valid token', async () => {
      await api().get('/api/rooms').expect(401);
      await api().get('/api/rooms').set(auth('not-a-jwt')).expect(401);
    });

    it('registers a user, refuses duplicates and reports validation errors per field', async () => {
      await api()
        .post('/api/auth/register')
        .send({ fullName: 'New Staff', email: 'New@Hotel.local', password: 'secret1' })
        .expect(200);
      const duplicate = await api()
        .post('/api/auth/register')
        .send({ fullName: 'Again', email: 'new@hotel.local', password: 'secret1' })
        .expect(409);
      expect(duplicate.body.title).toBe('Conflict');

      const invalid = await api().post('/api/auth/register').send({ email: 'bad', password: '1' }).expect(400);
      expect(invalid.body).toEqual({
        status: 400,
        title: 'Validation Failed',
        errors: {
          FullName: ['Full Name is required.'],
          Email: ['A valid email address is required.'],
          Password: ['Password must be at least 6 characters long.'],
        },
      });
    });
  });

  describe('rooms & reservations', () => {
    it('lists seeded rooms ordered by room number', async () => {
      const res = await api().get('/api/rooms').set(auth(adminToken)).expect(200);
      expect(res.body.map((r: { roomNumber: string }) => r.roomNumber)).toEqual([
        '101', '102', '201', '202', '301', '302', '401',
      ]);
    });

    it('rejects query values that cannot be bound, like ASP.NET model binding', async () => {
      const price = await api().get('/api/rooms/available?minPrice=abc').set(auth(adminToken)).expect(400);
      expect(price.body.errors).toEqual({ MinPrice: ["The value 'abc' is not valid for minPrice."] });

      const date = await api().get('/api/reports/revenue?from=2026-13-01&to=2026-12-31').set(auth(adminToken)).expect(400);
      expect(date.body.errors).toEqual({ From: ["The value '2026-13-01' is not valid for from."] });
    });

    it('returns 404 for unknown or non-numeric ids', async () => {
      await api().get('/api/rooms/9999').set(auth(adminToken)).expect(404);
      await api().get('/api/rooms/abc').set(auth(adminToken)).expect(404);
    });

    it('creates a reservation, rejects an overlapping one and cancels it', async () => {
      const created = await api()
        .post('/api/reservations')
        .set(auth(adminToken))
        .send({ roomId: 7, guestName: 'E2E Guest', checkInDate: '2027-01-10', checkOutDate: '2027-01-13', createdBy: 999 })
        .expect(201);
      expect(created.body).toMatchObject({
        roomNumber: '401',
        nights: 3,
        totalAmount: 1050,
        status: 'Confirmed',
        createdBy: 1,
        createdByName: 'Hotel Administrator',
      });

      await api()
        .post('/api/reservations')
        .set(auth(staffToken))
        .send({ roomId: 7, guestName: 'Overlap', checkInDate: '2027-01-12', checkOutDate: '2027-01-14' })
        .expect(409);

      const deleteBlocked = await api().delete('/api/rooms/7').set(auth(adminToken)).expect(409);
      expect(deleteBlocked.body.detail).toBe('Cannot delete room with active or future confirmed reservations.');

      const cancelled = await api().post(`/api/reservations/${created.body.id}/cancel`).set(auth(adminToken)).expect(200);
      expect(cancelled.body.status).toBe('Cancelled');
      await api().post(`/api/reservations/${created.body.id}/cancel`).set(auth(adminToken)).expect(409);

      const logs = await api().get('/api/audit-logs?take=2').set(auth(adminToken)).expect(200);
      expect(logs.body.map((l: { action: string }) => l.action)).toEqual(['Cancelled', 'Created']);
    });

    it('validates reservation payloads', async () => {
      const res = await api()
        .post('/api/reservations')
        .set(auth(adminToken))
        .send({ roomId: 1, guestName: 'Guest', checkInDate: '2027-01-10', checkOutDate: '2027-01-10' })
        .expect(400);
      expect(res.body.errors).toEqual({ CheckOutDate: ['Check-out date must be after check-in date.'] });
    });

    it('filters reservations by guest name and status', async () => {
      const res = await api()
        .get('/api/reservations?guestName=SMITH&status=confirmed')
        .set(auth(adminToken))
        .expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({ guestName: 'John Smith', checkInDate: '2026-08-01', nights: 4 });
    });
  });

  describe('reports', () => {
    it('serves dashboard, top rooms, revenue and occupancy', async () => {
      await api().get('/api/reports/dashboard').set(auth(adminToken)).expect(200);
      const top = await api().get('/api/reports/top-rooms?take=2').set(auth(adminToken)).expect(200);
      expect(top.body).toHaveLength(2);

      const revenue = await api()
        .get('/api/reports/revenue?from=2026-08-01&to=2026-08-10')
        .set(auth(adminToken))
        .expect(200);
      expect(revenue.body).toMatchObject({ totalReservations: 3, totalNights: 14, totalRevenue: 2020 });

      const occupancy = await api()
        .get('/api/reports/occupancy?from=2026-08-01&to=2026-08-11')
        .set(auth(adminToken))
        .expect(200);
      expect(occupancy.body[0]).toEqual({
        roomNumber: '101',
        roomType: 'Single',
        bookedNights: 5,
        availableNights: 10,
        occupancyPercentage: 50,
      });

      const missing = await api().get('/api/reports/revenue').set(auth(adminToken)).expect(400);
      expect(Object.keys(missing.body.errors)).toEqual(['From', 'To']);
    });
  });

  describe('SignalR hub', () => {
    it('requires authentication to negotiate', async () => {
      await api().post('/hubs/reservations/negotiate?negotiateVersion=1').expect(401);
    });

    it('broadcasts reservation and room events to every connected user', async () => {
      const staffHub = await connectHub(staffToken);
      await connectHub(adminToken);

      const createdEvent = nextEvent<{ guestName: string; createdBy: number }>(staffHub, 'reservationCreated');
      const created = await api()
        .post('/api/reservations')
        .set(auth(adminToken))
        .send({ roomId: 2, guestName: 'Realtime Guest', checkInDate: '2027-03-01', checkOutDate: '2027-03-04' })
        .expect(201);
      expect(await createdEvent).toMatchObject({ guestName: 'Realtime Guest', createdBy: 1 });

      const cancelledEvent = nextEvent<number>(staffHub, 'reservationCancelled');
      await api().post(`/api/reservations/${created.body.id}/cancel`).set(auth(adminToken)).expect(200);
      expect(await cancelledEvent).toBe(created.body.id);

      const roomEvent = nextEvent<{ roomNumber: string }>(staffHub, 'roomCreated');
      await api()
        .post('/api/rooms')
        .set(auth(adminToken))
        .send({ roomNumber: '999', roomType: 'Suite', pricePerNight: 99.5 })
        .expect(201);
      expect(await roomEvent).toMatchObject({ roomNumber: '999', pricePerNight: 99.5 });
    });

    it('accepts the access token from the query string like a browser does, and rejects bad tokens', async () => {
      const negotiate = await api()
        .post('/hubs/reservations/negotiate?negotiateVersion=1')
        .set(auth(adminToken))
        .expect(200);
      const wsUrl = baseUrl.replace('http', 'ws') + '/hubs/reservations';

      const handshake = await new Promise<string>((resolve, reject) => {
        const socket = new WebSocket(`${wsUrl}?id=${negotiate.body.connectionToken}&access_token=${adminToken}`);
        socket.on('open', () => socket.send('{"protocol":"json","version":1}\x1e'));
        socket.on('message', (data) => {
          resolve(data.toString());
          socket.close();
        });
        socket.on('error', reject);
      });
      expect(handshake).toBe('{}\x1e');

      const second = await api().post('/hubs/reservations/negotiate').set(auth(adminToken)).expect(200);
      const status = await new Promise<number>((resolve) => {
        const socket = new WebSocket(`${wsUrl}?id=${second.body.connectionToken}&access_token=${staffToken}`);
        socket.on('unexpected-response', (_req, res) => resolve(res.statusCode ?? 0));
        socket.on('error', () => undefined);
      });
      expect(status).toBe(401);
    });
  });
});

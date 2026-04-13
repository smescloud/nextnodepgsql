const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

function parseUserId(rawId) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function validateUserPayload(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const errors = [];

  if (!name) {
    errors.push('Name is required.');
  }

  if (!email) {
    errors.push('Email is required.');
  } else if (!emailPattern.test(email)) {
    errors.push('Email must be a valid address.');
  }

  return { name, email, errors };
}

async function isEmailTaken(email, excludedUserId) {
  const existingUser = await prisma.user.findFirst({
    where: excludedUserId
      ? {
          email,
          NOT: {
            id: excludedUserId,
          },
        }
      : { email },
  });

  return Boolean(existingUser);
}

function sendUnexpectedError(res, error) {
  console.error(error);
  return res.status(500).json({ message: 'Unexpected server error.' });
}

async function sendHealthStatus(_req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      message: 'API is working',
      database: 'connected',
    });
  } catch (error) {
    console.error(error);

    return res.status(503).json({
      message: 'API is running but the database is unavailable.',
      database: 'disconnected',
    });
  }
}

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'User CRUD API',
    endpoints: [
      'GET /health',
      'GET /users',
      'GET /users/:id',
      'POST /users',
      'PUT /users/:id',
      'DELETE /users/:id',
    ],
  });
});

app.get(['/health', '/test'], sendHealthStatus);

app.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    return sendUnexpectedError(res, error);
  }
});

app.get('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({ message: 'A valid user id is required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return sendUnexpectedError(res, error);
  }
});

app.post('/users', async (req, res) => {
  const { name, email, errors } = validateUserPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(' ') });
  }

  try {
    if (await isEmailTaken(email)) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    return sendUnexpectedError(res, error);
  }
});

app.put('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);
  const { name, email, errors } = validateUserPayload(req.body);

  if (!userId) {
    return res.status(400).json({ message: 'A valid user id is required.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(' ') });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (await isEmailTaken(email, userId)) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    return sendUnexpectedError(res, error);
  }
});

app.delete('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({ message: 'A valid user id is required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    return sendUnexpectedError(res, error);
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function disconnectPrisma(signal) {
  try {
    await prisma.$disconnect();
    console.log(`Prisma disconnected after ${signal}`);
  } catch (error) {
    console.error('Failed to disconnect Prisma cleanly.', error);
  }
}

process.on('SIGINT', () => {
  void disconnectPrisma('SIGINT').finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  void disconnectPrisma('SIGTERM').finally(() => process.exit(0));
});

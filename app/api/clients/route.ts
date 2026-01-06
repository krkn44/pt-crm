import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-better";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/clients - Get all clients (trainer only)
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only trainers can view the client list
    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
      },
      include: {
        clientProfile: true,
        workoutSessions: {
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            workoutSessions: true,
            measurements: true,
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Error fetching clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client (trainer only)
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, phone, goals, notes } = body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, password, first name and last name are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with client profile
    const client = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: "CLIENT",
        clientProfile: {
          create: {
            goals,
            notes,
          },
        },
      },
      include: {
        clientProfile: true,
      },
    });

    // Remove password from response
    const { password: _, ...clientWithoutPassword } = client;

    return NextResponse.json(clientWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Error creating client" },
      { status: 500 }
    );
  }
}

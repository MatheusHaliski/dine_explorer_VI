import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { signupPayloadSchema } from "@/app/signupview/schema";

type SignupPayload = {
    name?: string;
    email?: string;
    password?: string;
};

export async function POST(request: NextRequest): Promise<Response> {
    let body: SignupPayload = {};
    try {
        body = (await request.json()) as SignupPayload;
    } catch {
        body = {};
    }

    const parsed = signupPayloadSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid signup payload." },
            { status: 400 }
        );
    }

    try {
        const db = getAdminFirestore();
        const normalizedEmail = parsed.data.email.trim().toLowerCase();
        const normalizedName = parsed.data.name.trim();
        const existingSnapshot = await db
            .collection("VSusercontrol")
            .where("email", "==", normalizedEmail)
            .limit(1)
            .get();

        if (!existingSnapshot.empty) {
            return NextResponse.json(
                { error: "An account already exists with that email address." },
                { status: 409 }
            );
        }

        const existingNameSnapshot = await db
            .collection("VSusercontrol")
            .where("name", "==", normalizedName)
            .limit(1)
            .get();

        if (!existingNameSnapshot.empty) {
            return NextResponse.json(
                { error: "An account already exists with that name." },
                { status: 409 }
            );
        }

        await db.collection("VSusercontrol").add({
            name: normalizedName,
            email: normalizedEmail,
            password: parsed.data.password,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[Signup API] failed to create account:", error);
        return NextResponse.json(
            { error: "Unable to create your account right now." },
            { status: 500 }
        );
    }
}

import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import { EMAIL_NOT_VERIFIED_USER_MESSAGE } from "@/lib/email-verification-client";

const MESSAGE = EMAIL_NOT_VERIFIED_USER_MESSAGE;

export function blockIfEmailNotVerified(session: Session): NextResponse | null {
  if (session.user.isEmailVerified !== true) {
    return NextResponse.json(
      { error: MESSAGE, code: "EMAIL_NOT_VERIFIED" },
      { status: 403 },
    );
  }
  return null;
}

"use server";

import { z } from "zod";

import { createUser, getUser } from "@/db/queries";
import { signIn } from "../../lib/auth";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    console.log("DEBUG: login validatedData:", validatedData);

    const result = await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });
    console.log("DEBUG: signIn result:", result);

    if (result && result.error) {
      console.error("DEBUG: signIn error:", result.error);
      return { status: "failed" };
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("DEBUG: Validation error in login:", error);
      return { status: "invalid_data" };
    }
    console.error("DEBUG: Unknown error in login:", error);
    return { status: "failed" };
  }
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
}

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    console.log("DEBUG: register validatedData:", validatedData);

    let [user] = await getUser(validatedData.email);
    console.log("DEBUG: getUser in register returned:", user);

    if (user) {
      console.error("DEBUG: User already exists for email:", validatedData.email);
      return { status: "user_exists" } as RegisterActionState;
    } else {
      await createUser(validatedData.email, validatedData.password);
      console.log("DEBUG: User created successfully for email:", validatedData.email);

      const result = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });
      console.log("DEBUG: signIn result after register:", result);

      if (result && result.error) {
        console.error("DEBUG: signIn error after register:", result.error);
        return { status: "failed" };
      }

      return { status: "success" };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("DEBUG: Validation error in register:", error);
      return { status: "invalid_data" };
    }
    console.error("DEBUG: Unknown error in register:", error);
    return { status: "failed" };
  }
};
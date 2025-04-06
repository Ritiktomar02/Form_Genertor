"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { z } from "zod";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL:  "https://models.inference.ai.azure.com" 
});

export const generateForm = async (prevState: unknown, formData: FormData) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "User not found" }
    }

    const schema = z.object({
      description: z.string().min(1, "Description is required")
    });

    const result = schema.safeParse({
      description: formData.get("description") as string
    });

    if (!result.success) {
      return { success: false, message: "Invalid form data", error: result.error.errors }
    }

    const description = result.data.description;

    if (!process.env.GITHUB_TOKEN ) {
      return { success: false, message: "No OpenAI API key found" }
    }

    const prompt = `Generate a JSON response for a form with the following structure. Ensure the keys and format remain constant in every response.
{
  "formTitle": "string",
  "formFields": [
    {
      "label": "string",
      "name": "string",
      "placeholder": "string"
    }
  ]
}
Requirements:
- Use only the given keys: "formTitle", "formFields", "label", "name", "placeholder".
- Always include at least 3 fields in the "formFields" array.
- Keep the field names consistent across every generation for reliable rendering.
- Provide meaningful placeholder text for each field based on its label.
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: `${description} ${prompt}` }],
      model: "gpt-4o", // Azure supports this, fallback for OpenAI is also valid
      temperature: 1,
      max_tokens: 4096,
      top_p: 1
    });

    const formContent = completion.choices[0]?.message.content;
    if (!formContent) {
      return { success: false, message: "Failed to generate form content" }
    }

    console.log("Generated form -> ", formContent);

    const form = await prisma.form.create({
      data: {
        ownerId: user.id,
        content: formContent
      }
    });

    revalidatePath("/dashboard/forms");

    return {
      success: true,
      message: "Form generated successfully.",
      data: form
    }

  } catch (error) {
    console.log("Error generating form", error);
    return { success: false, message: "An error occurred while generating the form" }
  }
}

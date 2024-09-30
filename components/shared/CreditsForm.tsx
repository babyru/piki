"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { updateCredits } from "@/lib/actions/user.action";

export function CreditForm({ clerkId }: { clerkId: string }) {
  const [inputValue, setInputValue] = useState<string>("");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedCredits = Number(values.credits);
    updateCredits(clerkId, updatedCredits);
  }

  const formSchema = z.object({
    credits: z.string().min(1, {
      message: "Expected number.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credits: "",
    },
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (parseInt(e.target.value) >= 0) {
      setInputValue(e.target.value);
    } else {
      setInputValue("");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 space-y-8">
        <FormField
          control={form.control}
          name="credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How many Credits do you want👇</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="20"
                  type="number"
                  value={inputValue}
                  onInput={handleInput}
                />
              </FormControl>
              <FormDescription>
                This is looks 👆 crazy right 🤪,{" "}
                <span className="font-bold italic text-gray-500">
                  ADDING FREE CREDITS
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

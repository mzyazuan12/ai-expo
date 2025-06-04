"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the form schema based on the Challenge model (simplified)
export const challengeFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  body_md: z.string().min(1, { message: "Description is required." }),
  tags: z.string().optional(), // Will handle splitting CSV in submission
  trl: z.coerce.number().min(1).max(9).optional().default(1),
  urgency: z.enum(["low", "medium", "high"]).optional().default("low"),
  domain: z.string().optional().default("general"),
});

interface ChallengeFormProps {
  onSubmit: (data: z.infer<typeof challengeFormSchema>) => void;
  isLoading: boolean;
}

export function ChallengeForm({ onSubmit, isLoading }: ChallengeFormProps) {
  const form = useForm<z.infer<typeof challengeFormSchema>>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      title: "",
      body_md: "",
      tags: "",
      trl: 1,
      urgency: "low",
      domain: "general",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Improve drone battery life" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body_md"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problem Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the challenge in detail..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. ISR, GPS-denied" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TRL (Technology Readiness Level)</FormLabel>
              <FormControl>
                 <Input type="number" placeholder="1-9" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="urgency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urgency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
               <Input placeholder="e.g. search-and-rescue" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Create Challenge"}
        </Button>
      </form>
    </Form>
  );
} 
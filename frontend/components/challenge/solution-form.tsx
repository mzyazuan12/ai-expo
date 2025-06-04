"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { submitSolution } from "@/lib/challenge-service";
import { Loader2, Upload } from "lucide-react";

const formSchema = z.object({
  content: z.string().min(10, "Solution must be at least 10 characters long"),
  attachments: z.array(z.string()).optional(),
  video_url: z.string().url().optional(),
  provider_type: z.enum(["academia", "startup", "industry", "government"]),
  contact_email: z.string().email(),
});

interface SolutionFormProps {
  challengeId: string;
  onSuccess?: () => void;
}

export function SolutionForm({ challengeId, onSuccess }: SolutionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      attachments: [],
      video_url: "",
      provider_type: "industry",
      contact_email: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await submitSolution(challengeId, {
        ...values,
        attachments: files.map(file => file.name), // In a real app, you'd upload these files
      });
      
      toast({
        title: "Success",
        description: "Your solution has been submitted successfully.",
      });
      
      form.reset();
      setFiles([]);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solution</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your solution in detail..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed explanation of your solution, including any relevant technical details.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provider_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Type</FormLabel>
              <FormControl>
                <select
                  className="w-full p-2 border rounded-md"
                  {...field}
                >
                  <option value="academia">Academia</option>
                  <option value="startup">Startup</option>
                  <option value="industry">Industry</option>
                  <option value="government">Government</option>
                </select>
              </FormControl>
              <FormDescription>
                Select your organization type.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a contact email for follow-up communications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/video"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Link to a video demonstration or explanation of your solution.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Attachments (Optional)</FormLabel>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => document.querySelector('input[type="file"]')?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Selected files:</p>
              <ul className="list-disc list-inside text-sm">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Solution"
          )}
        </Button>
      </form>
    </Form>
  );
} 
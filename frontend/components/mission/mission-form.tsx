"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Rocket, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const formSchema = z.object({
  tactics: z
    .string()
    .min(10, { message: "Tactics must be at least 10 characters." })
    .max(1000, { message: "Tactics must not exceed 1000 characters." }),
  imageUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
});

interface MissionFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
  isLoading: boolean;
}

export function MissionForm({ onSubmit, isLoading }: MissionFormProps) {
  const [showImageField, setShowImageField] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tactics: "",
      imageUrl: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(data);
      form.reset();
      setShowImageField(false);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-500" />
          Create New Mission
        </CardTitle>
        <CardDescription>
          Design your drone racing mission with custom tactics and optional
          visualization.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tactics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Tactics</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your racing tactics and instructions here..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detail your drone racing strategy, waypoints, and special maneuvers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showImageField ? (
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide an image URL to visualize your racing course.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowImageField(true)}
              >
                <ImageIcon className="h-4 w-4" />
                Add Course Image
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setShowImageField(false);
              }}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                "Create Mission"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
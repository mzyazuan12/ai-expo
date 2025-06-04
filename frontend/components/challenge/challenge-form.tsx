"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { challengeFormSchema, type ChallengeFormData } from "@/lib/types";
import { z } from "zod";

interface ChallengeFormProps {
  onSubmit: (data: ChallengeFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<ChallengeFormData>;
}

export const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  body_md: z.string().min(20, "Description must be at least 20 characters long"),
  trl: z.number().min(1).max(9),
  urgency: z.enum(["critical", "high", "medium", "low"]),
  classification_level: z.enum(["unclassified", "confidential", "secret", "top_secret"]),
  domain: z.string().min(1, "Domain is required"),
  environment: z.string().min(1, "Environment is required"),
  threats: z.string().optional(),
  wind_kts: z.number().min(0).max(100).optional(),
  laps: z.number().min(1).max(100).optional(),
  tags: z.string().optional().default(""),
  is_anonymous: z.boolean().default(false),
  video_url: z.string().url().optional().or(z.literal("")),
  verification_required: z.boolean().default(false),
  allowed_provider_types: z.array(z.enum(["academia", "startup", "industry"])).default(["academia", "startup", "industry"]),
  required_clearance_level: z.enum(["unclassified", "confidential", "secret", "top_secret"]).optional()
});

export function ChallengeForm({ onSubmit, isLoading = false, defaultValues }: ChallengeFormProps) {
  const form = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      title: "",
      body_md: "",
      trl: 1,
      urgency: "medium",
      classification_level: "unclassified",
      domain: "",
      environment: "",
      threats: "",
      wind_kts: 0,
      laps: 1,
      tags: "",
      is_anonymous: false,
      video_url: "",
      verification_required: false,
      allowed_provider_types: ["academia", "startup", "industry"],
      required_clearance_level: "unclassified",
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: ChallengeFormData) => {
    try {
      const processedData = {
        ...data,
        body_md: data.body_md,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        video_url: data.video_url || null,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      await onSubmit(processedData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter challenge title" {...field} />
              </FormControl>
              <FormDescription>
                A clear and concise title for your challenge.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your challenge in detail..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description of your challenge, including any relevant technical details.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="trl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TRL Level</FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select TRL" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        TRL {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Technology Readiness Level of the challenge.
                </FormDescription>
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
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How urgent is this challenge?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classification_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classification Level</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unclassified">Unclassified</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                    <SelectItem value="secret">Secret</SelectItem>
                    <SelectItem value="top_secret">Top Secret</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Security classification of the challenge.
                </FormDescription>
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
                <FormControl>
                  <Input placeholder="Enter domain" {...field} />
                </FormControl>
                <FormDescription>
                  The domain or field of the challenge.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="environment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Environment</FormLabel>
                <FormControl>
                  <Input placeholder="Enter environment" {...field} />
                </FormControl>
                <FormDescription>
                  The environment where the challenge occurs.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="threats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Threats (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter threats" {...field} />
                </FormControl>
                <FormDescription>
                  Any specific threats or challenges to consider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wind_kts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wind Speed (kts)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Wind speed in knots (0-100).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="laps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Laps</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Number of laps required (1-100).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add relevant tags to help others find your challenge.
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
                Link to a video demonstration or explanation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_anonymous"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <FormLabel className="!mt-0">Submit anonymously</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Challenge...
            </>
          ) : (
            "Create Challenge"
          )}
        </Button>
      </form>
    </Form>
  );
} 
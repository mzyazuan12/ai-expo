"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const verificationSchema = z.object({
  role: z.enum(["warfighter", "academia", "startup", "industry"]),
  organization: z.string().min(2, "Organization name is required"),
  clearance_level: z.enum(["unclassified", "confidential", "secret", "top_secret"]),
  verification_method: z.enum(["cac", "email", "manual"]),
  dod_email: z.string().email("Must be a valid DoD email address"),
  provider_details: z.object({
    type: z.enum(["academia", "startup", "industry"]),
    institution_name: z.string().optional(),
    department: z.string().optional(),
    website: z.string().url().optional(),
    expertise_areas: z.string().optional(),
    trl_capabilities: z.string().optional(),
  }).optional(),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface VerificationFormProps {
  onSubmit: (data: VerificationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function VerificationForm({ onSubmit, isLoading = false }: VerificationFormProps) {
  const { toast } = useToast();
  const [isProvider, setIsProvider] = useState(false);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      role: "warfighter",
      organization: "",
      clearance_level: "unclassified",
      verification_method: "email",
      dod_email: "",
      provider_details: {
        type: "academia",
        institution_name: "",
        department: "",
        website: "",
        expertise_areas: "",
        trl_capabilities: "",
      },
    },
  });

  const handleSubmit = async (data: VerificationFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Verification request submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setIsProvider(value !== "warfighter");
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="warfighter">DoD Warfighter</SelectItem>
                  <SelectItem value="academia">Academic</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select your role in the platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <Input placeholder="Enter your organization name" {...field} />
              </FormControl>
              <FormDescription>
                Your organization or institution name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clearance_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clearance Level</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select clearance level" />
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
                Your security clearance level.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verification_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Method</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select verification method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cac">CAC Card</SelectItem>
                  <SelectItem value="email">DoD Email</SelectItem>
                  <SelectItem value="manual">Manual Verification</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How would you like to verify your identity?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dod_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DoD Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your DoD email address"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your official DoD email address for verification.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isProvider && (
          <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-medium">Provider Details</h3>
            
            <FormField
              control={form.control}
              name="provider_details.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="academia">Academic Institution</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Your organization type.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider_details.institution_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter institution name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your institution or company name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider_details.department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your department or division.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider_details.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your organization's website.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider_details.expertise_areas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas of Expertise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter areas of expertise (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your organization's areas of expertise.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider_details.trl_capabilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TRL Capabilities</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter TRL levels (comma-separated, e.g., 1,2,3)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your organization's TRL capabilities.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Verification Request"
          )}
        </Button>
      </form>
    </Form>
  );
} 
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Rocket, Upload } from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const formSchema = z.object({
  mission_name: z.string().min(1, "Mission name is required"),
  thread_text: z.string().min(1, "Tactics description is required"),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
  trl: z.number().min(1).max(9),
  urgency: z.enum(["critical", "high", "medium", "low"]),
  domain: z.string().min(1, "Domain is required"),
  environment: z.string().min(1, "Environment is required"),
  terrain: z.string().min(1, "Terrain is required"),
  threats: z.string().optional(),
  wind_kts: z.number().min(0).max(100),
  laps: z.number().min(1).max(100),
  is_anonymous: z.boolean().default(false),
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
      mission_name: "",
      thread_text: "",
      imageUrl: "",
      tags: "",
      trl: 1,
      urgency: "low",
      domain: "general",
      environment: "stadium",
      terrain: "",
      threats: "",
      wind_kts: 0,
      laps: 1,
      is_anonymous: false,
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
          Design your drone racing mission with custom tactics and optional visualization.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="mission_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter mission name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your mission a descriptive name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thread_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tactics Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the mission tactics and objectives..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the mission tactics.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageField(!showImageField)}
              >
                <Upload className="h-4 w-4 mr-2" />
                {showImageField ? "Remove Image" : "Add Image"}
              </Button>
            </div>

            {showImageField && (
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Add a URL to an image that represents your mission.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tags (comma-separated)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add relevant tags to categorize your mission.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technology Readiness Level (TRL)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
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
                      Select the technology readiness level.
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                      Set the urgency level of the mission.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                      Specify the domain of the mission.
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stadium">Stadium</SelectItem>
                        <SelectItem value="urban">Urban</SelectItem>
                        <SelectItem value="rural">Rural</SelectItem>
                        <SelectItem value="mountain">Mountain</SelectItem>
                        <SelectItem value="desert">Desert</SelectItem>
                        <SelectItem value="arctic">Arctic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the mission environment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="terrain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terrain</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter terrain" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the terrain of the mission.
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
                    <FormLabel>Threats</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter threats (comma-separated)" {...field} />
                    </FormControl>
                    <FormDescription>
                      List potential threats in the mission area.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wind_kts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Speed (knots)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Set the wind speed in knots.
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
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 1 : value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Set the number of laps for the mission.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
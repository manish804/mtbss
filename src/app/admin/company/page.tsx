"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  companyFormSchema,
  type CompanyFormData,
  type CompanyData,
  defaultCompanyData,
} from "@/lib/validation/company-schemas";
import {
  Building,
  FileText,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  Upload,
  Mail,
  Share2,
} from "lucide-react";

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyData | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: defaultCompanyData,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const socialLinkField = (key: string): Path<CompanyFormData> =>
    `socialLinks.${key}` as Path<CompanyFormData>;

  const loadCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/company?includeStats=true");
      const result = await response.json();

      if (result.success) {
        if (result.data) {
          setCompany(result.data);

          reset(result.data);
        } else {
          setIsEditing(true);
          reset(defaultCompanyData);
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load company data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => {
    void loadCompanyData();
  }, [loadCompanyData]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setSaving(true);

      const method = company ? "PUT" : "POST";
      const response = await fetch("/api/company", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setCompany(result.data);
        setIsEditing(false);
        toast({
          title: "Success",
          description: result.message,
        });
        loadCompanyData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save company data",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save company data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Company Management
          </h1>
          <p className="text-muted-foreground">
            Manage your company information and visibility settings
          </p>
        </div>

        {!isEditing && company && (
          <Button onClick={() => setIsEditing(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Edit Company
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social & Media</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Company Information
                </CardTitle>
                <CardDescription>
                  Core details about your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      disabled={!isEditing}
                      placeholder="Enter company name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      {...register("industry")}
                      disabled={!isEditing}
                      placeholder="e.g., Technology, Finance, Healthcare"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    disabled={!isEditing}
                    placeholder="Describe your company, mission, and values..."
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="foundedYear">Founded Year</Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      {...register("foundedYear")}
                      disabled={!isEditing}
                      placeholder="YYYY"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Input
                      id="employeeCount"
                      {...register("employeeCount")}
                      disabled={!isEditing}
                      placeholder="e.g., 1-10, 11-50, 51-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input
                      id="headquarters"
                      {...register("headquarters")}
                      disabled={!isEditing}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How customers can reach your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      disabled={!isEditing}
                      placeholder="contact@yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      disabled={!isEditing}
                      placeholder="+1 (000) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    {...register("website")}
                    disabled={!isEditing}
                    placeholder="https://www.yourcompany.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    {...register("address")}
                    disabled={!isEditing}
                    placeholder="Full business address including street, city, state, and postal code..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social & Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Media & Logo
                </CardTitle>
                <CardDescription>
                  Social media profiles and company branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo"
                      {...register("logo")}
                      disabled={!isEditing}
                      placeholder="https://example.com/logo.png"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isEditing}
                      className="shrink-0"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.watch("logo") && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.watch("logo") || ""}
                        alt="Company Logo Preview"
                        className="h-16 w-16 object-contain rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Social Media Links</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="socialLinks.linkedin">LinkedIn</Label>
                      <Input
                        id="socialLinks.linkedin"
                        {...register(socialLinkField("linkedin"))}
                        disabled={!isEditing}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="socialLinks.twitter">Twitter/X</Label>
                      <Input
                        id="socialLinks.twitter"
                        {...register(socialLinkField("twitter"))}
                        disabled={!isEditing}
                        placeholder="https://twitter.com/yourcompany"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="socialLinks.facebook">Facebook</Label>
                      <Input
                        id="socialLinks.facebook"
                        {...register(socialLinkField("facebook"))}
                        disabled={!isEditing}
                        placeholder="https://facebook.com/yourcompany"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="socialLinks.instagram">Instagram</Label>
                      <Input
                        id="socialLinks.instagram"
                        {...register(socialLinkField("instagram"))}
                        disabled={!isEditing}
                        placeholder="https://instagram.com/yourcompany"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="socialLinks.youtube">YouTube</Label>
                      <Input
                        id="socialLinks.youtube"
                        {...register(socialLinkField("youtube"))}
                        disabled={!isEditing}
                        placeholder="https://youtube.com/yourcompany"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visibility Settings Tab */}
          <TabsContent value="visibility">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visibility Settings
                </CardTitle>
                <CardDescription>
                  Control which information is displayed on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Company Active Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Show company profile on website
                      </p>
                    </div>
                    <Switch
                      checked={form.watch("isActive")}
                      onCheckedChange={(checked) => form.setValue("isActive", checked)}
                      disabled={!isEditing}
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Company Name</Label>
                      </div>
                      <Switch
                        checked={form.watch("showName")}
                        onCheckedChange={(checked) => form.setValue("showName", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Description</Label>
                      </div>
                      <Switch
                        checked={form.watch("showDescription")}
                        onCheckedChange={(checked) => form.setValue("showDescription", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Website</Label>
                      </div>
                      <Switch
                        checked={form.watch("showWebsite")}
                        onCheckedChange={(checked) => form.setValue("showWebsite", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Email</Label>
                      </div>
                      <Switch
                        checked={form.watch("showEmail")}
                        onCheckedChange={(checked) => form.setValue("showEmail", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Phone</Label>
                      </div>
                      <Switch
                        checked={form.watch("showPhone")}
                        onCheckedChange={(checked) => form.setValue("showPhone", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Address</Label>
                      </div>
                      <Switch
                        checked={form.watch("showAddress")}
                        onCheckedChange={(checked) => form.setValue("showAddress", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Logo</Label>
                      </div>
                      <Switch
                        checked={form.watch("showLogo")}
                        onCheckedChange={(checked) => form.setValue("showLogo", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Industry</Label>
                      </div>
                      <Switch
                        checked={form.watch("showIndustry")}
                        onCheckedChange={(checked) => form.setValue("showIndustry", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Founded Year</Label>
                      </div>
                      <Switch
                        checked={form.watch("showFoundedYear")}
                        onCheckedChange={(checked) => form.setValue("showFoundedYear", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Employee Count</Label>
                      </div>
                      <Switch
                        checked={form.watch("showEmployeeCount")}
                        onCheckedChange={(checked) => form.setValue("showEmployeeCount", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Headquarters</Label>
                      </div>
                      <Switch
                        checked={form.watch("showHeadquarters")}
                        onCheckedChange={(checked) => form.setValue("showHeadquarters", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Show Social Links</Label>
                      </div>
                      <Switch
                        checked={form.watch("showSocialLinks")}
                        onCheckedChange={(checked) => form.setValue("showSocialLinks", checked)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Buttons */}
          {isEditing && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={saving || !isDirty}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {company ? "Update Company" : "Create Company"}
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset(company || defaultCompanyData);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </Tabs>
      </form>

      {/* Company Status Display */}
      {company && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Company Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Company profile is {company.isActive ? "visible" : "hidden"} on the website
                </span>
              </div>
              {company.createdAt && (
                <span className="text-sm text-muted-foreground">
                  Created: {new Date(company.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

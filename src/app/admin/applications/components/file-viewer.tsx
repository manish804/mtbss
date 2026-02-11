"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  File,
  Image,
  FileVideo,
  FileAudio,
  Archive,
  Eye,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FileItem {
  id?: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  uploadedAt?: Date | string;
}

interface FileViewerProps {
  resumeUrl?: string;
  portfolioFiles?: unknown;
  applicantName: string;
  onFileAccess?: (fileType: string, fileName: string, action: string) => void;
}

export function FileViewer({
  resumeUrl,
  portfolioFiles,
  applicantName,
  onFileAccess,
}: FileViewerProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  const isFileItem = (file: unknown): file is FileItem => {
    if (!file || typeof file !== "object" || Array.isArray(file)) {
      return false;
    }
    const fileRecord = file as Record<string, unknown>;
    return (
      typeof fileRecord.name === "string" && typeof fileRecord.url === "string"
    );
  };

  const formatPortfolioFiles = (files: unknown): FileItem[] => {
    if (!files) return [];
    if (Array.isArray(files)) return files.filter(isFileItem);

    if (typeof files === "object" && !Array.isArray(files)) {
      const filesRecord = files as Record<string, unknown>;
      if ("files" in filesRecord) return formatPortfolioFiles(filesRecord.files);
      if ("portfolioFiles" in filesRecord) {
        return formatPortfolioFiles(filesRecord.portfolioFiles);
      }
    }

    return [];
  };

  const portfolioFilesList = formatPortfolioFiles(portfolioFiles);

  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const type = fileType?.toLowerCase();

    if (
      type?.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
    ) {
      return Image;
    }
    if (
      type?.includes("video") ||
      ["mp4", "avi", "mov", "wmv", "flv"].includes(extension || "")
    ) {
      return FileVideo;
    }
    if (
      type?.includes("audio") ||
      ["mp3", "wav", "ogg", "flac"].includes(extension || "")
    ) {
      return FileAudio;
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension || "")) {
      return Archive;
    }
    if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension || "")) {
      return FileText;
    }
    return File;
  };

  const getFileTypeLabel = (fileName: string, fileType?: string) => {
    const extension = fileName.split(".").pop()?.toUpperCase();
    if (fileType) {
      return fileType.split("/")[1]?.toUpperCase() || extension || "FILE";
    }
    return extension || "FILE";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = async (
    url: string,
    fileName: string,
    fileType: string
  ) => {
    if (!isValidUrl(url)) {
      toast({
        title: "Invalid File URL",
        description: "The file URL is not valid or accessible.",
        variant: "destructive",
      });
      return;
    }

    setLoadingFiles((prev) => new Set(prev).add(url));

    try {
      onFileAccess?.(fileType, fileName, "download");

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${fileName}...`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(url);
        return newSet;
      });
    }
  };

  const handleView = (url: string, fileName: string, fileType: string) => {
    if (!isValidUrl(url)) {
      toast({
        title: "Invalid File URL",
        description: "The file URL is not valid or accessible.",
        variant: "destructive",
      });
      return;
    }

    onFileAccess?.(fileType, fileName, "view");

    const extension = fileName.split(".").pop()?.toLowerCase();
    if (
      ["pdf", "jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")
    ) {
      setPreviewUrl(url);
      setPreviewTitle(fileName);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleFileError = (fileName: string) => {
    toast({
      title: "File Access Error",
      description: `Could not access ${fileName}. The file may have been moved or deleted.`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resumeUrl ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Resume</h4>
                  <p className="text-sm text-gray-500">
                    {applicantName}&apos;s Resume • PDF Document
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleView(
                      resumeUrl,
                      `${applicantName}_Resume.pdf`,
                      "resume"
                    )
                  }
                  disabled={loadingFiles.has(resumeUrl)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      resumeUrl,
                      `${applicantName}_Resume.pdf`,
                      "resume"
                    )
                  }
                  disabled={loadingFiles.has(resumeUrl)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loadingFiles.has(resumeUrl) ? "Downloading..." : "Download"}
                </Button>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No resume file was uploaded with this application.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Portfolio Files
            {portfolioFilesList.length > 0 && (
              <Badge variant="secondary">{portfolioFilesList.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portfolioFilesList.length > 0 ? (
            <div className="space-y-3">
              {portfolioFilesList.map((file, index) => {
                const IconComponent = getFileIcon(file.name, file.type);
                const fileTypeLabel = getFileTypeLabel(file.name, file.type);
                const isLoading = loadingFiles.has(file.url);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {file.name || `Portfolio File ${index + 1}`}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{fileTypeLabel}</span>
                          {file.size && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(file.size)}</span>
                            </>
                          )}
                          {file.uploadedAt && (
                            <>
                              <span>•</span>
                              <span>
                                Uploaded{" "}
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleView(file.url, file.name, "portfolio")
                        }
                        disabled={isLoading}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownload(file.url, file.name, "portfolio")
                        }
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isLoading ? "Downloading..." : "Download"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No portfolio files were uploaded with this application.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewTitle}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewUrl(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              File preview - Use the download button to save the file locally.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {previewUrl && (
              <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
                {previewTitle.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title={previewTitle}
                    onError={() => handleFileError(previewTitle)}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt={previewTitle}
                    className="w-full h-full object-contain bg-gray-100"
                    onError={() => handleFileError(previewTitle)}
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() =>
                window.open(previewUrl!, "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              onClick={() => {
                if (previewUrl) {
                  handleDownload(previewUrl, previewTitle, "preview");
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

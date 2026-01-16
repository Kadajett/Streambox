import { useState, useCallback, useEffect, useRef } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Upload, X, FileVideo, Loader2, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChannel } from '@/features/channels';
import { useUploadChannelVideo } from '@/features/videos/api/mutations';
import { useVideoStatus } from '@/features/videos';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/channel/$handle/studio/upload')({
  component: UploadPage,
});

type UploadStep = 'select' | 'details' | 'uploading' | 'processing' | 'complete' | 'error';

function UploadPage() {
  const { handle } = Route.useParams();
  const navigate = useNavigate();

  const { data: channel } = useChannel(handle);
  const uploadMutation = useUploadChannelVideo();

  const [step, setStep] = useState<UploadStep>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public' as 'public' | 'unlisted' | 'private',
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll video status after upload
  const { isReady, isFailed, progress } = useVideoStatus(uploadedVideoId ?? '', {
    enabled: step === 'processing' && !!uploadedVideoId,
    pollInterval: 2000,
  });

  console.log('UploadPage render', { step, uploadProgress, progress });

  // Watch for processing completion
  useEffect(() => {
    if (isReady) {
      setStep('complete');
    } else if (isFailed) {
      setStep('error');
      setError('Video processing failed. Please try uploading again.');
    }
  }, [isReady, isFailed]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreviewUrl, thumbnailPreview]);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }

      // Clear previous preview
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);

      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setError(null);

      // Auto-fill title from filename
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const formattedTitle = fileName.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
      setFormData((prev) => ({
        ...prev,
        title: prev.title || formattedTitle,
      }));

      // Generate thumbnail from video
      generateThumbnail(file);

      setStep('details');
    },
    [videoPreviewUrl]
  );

  // Generate thumbnail from video
  const generateThumbnail = (file: File) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration / 4); // Seek to 1s or 1/4 of duration
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnailPreview(thumbnailUrl);
      }
      URL.revokeObjectURL(video.src);
    };
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Handle upload
  const handleUpload = async () => {
    if (!videoFile || !channel?.id || !formData.title.trim()) return;

    setStep('uploading');
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('file', videoFile);
      formDataObj.append('title', formData.title.trim());
      formDataObj.append('description', formData.description.trim());
      formDataObj.append('visibility', formData.visibility);

      // Simulate upload progress (real progress would come from XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const result = await uploadMutation.mutateAsync({
        channelId: channel.id,
        formData: formDataObj,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedVideoId(result.id);
      setStep('processing');
    } catch (err: any) {
      setStep('error');
      setError(err?.message || 'Upload failed. Please try again.');
    }
  };

  // Reset and start over
  const handleReset = () => {
    setStep('select');
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
    setUploadedVideoId(null);
    setError(null);
    setFormData({ title: '', description: '', visibility: 'public' });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload video</h1>
        <p className="text-muted-foreground">Share your content with the world</p>
      </div>

      {/* Step: Select File */}
      {step === 'select' && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={cn(
                'relative border-2 border-dashed rounded-lg p-12 transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Drag and drop video files to upload</h3>
                <p className="text-muted-foreground mb-4">Or click to browse your files</p>
                <Button onClick={() => fileInputRef.current?.click()}>Select file</Button>
                <p className="text-xs text-muted-foreground mt-4">
                  MP4, MOV, AVI, MKV, WebM supported. Max 5GB.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step: Enter Details */}
      {step === 'details' && videoFile && (
        <div className="space-y-6">
          {/* Video preview card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {/* Video preview */}
                <div className="w-48 shrink-0">
                  <AspectRatio ratio={16 / 9}>
                    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
                      {videoPreviewUrl && (
                        <video
                          src={videoPreviewUrl}
                          className="w-full h-full object-contain"
                          controls
                          muted
                        />
                      )}
                    </div>
                  </AspectRatio>
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <FileVideo className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{videoFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(videoFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={handleReset}>
                    <X className="h-4 w-4 mr-1" />
                    Change file
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details form */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                Add information about your video to help viewers find it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Add a title that describes your video"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.title.length}/100
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers about your video"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  maxLength={5000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/5000
                </p>
              </div>

              {/* Thumbnail preview */}
              {thumbnailPreview && (
                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <div className="flex items-start gap-4">
                    <div className="w-40">
                      <AspectRatio ratio={16 / 9}>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover rounded"
                        />
                      </AspectRatio>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from video. Custom thumbnails coming soon.
                    </p>
                  </div>
                </div>
              )}

              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: 'public' | 'unlisted' | 'private') =>
                    setFormData((prev) => ({ ...prev, visibility: value }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.visibility === 'public' && 'Anyone can search for and view this video'}
                  {formData.visibility === 'unlisted' && 'Anyone with the link can view this video'}
                  {formData.visibility === 'private' && 'Only you can view this video'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleUpload} disabled={!formData.title.trim()}>
              Upload video
            </Button>
          </div>
        </div>
      )}

      {/* Step: Uploading */}
      {step === 'uploading' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Uploading video...</h3>
              <p className="text-muted-foreground mb-6">
                Please don't close this page while uploading
              </p>
              <div className="w-full max-w-md">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(uploadProgress)}% uploaded
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Processing video...</h3>
              <p className="text-muted-foreground mb-6">
                Your video is being processed. This may take a few minutes.
              </p>
              <div className="w-full max-w-md">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{progress}% processed</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                You can leave this page - we'll notify you when it's ready
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Complete */}
      {step === 'complete' && uploadedVideoId && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Video uploaded!</h3>
              <p className="text-muted-foreground mb-6">
                Your video "{formData.title}" is now ready
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleReset}>
                  Upload another
                </Button>
                <Button
                  variant="glow"
                  onClick={() =>
                    navigate({
                      to: '/watch/$slug',
                      params: { slug: uploadedVideoId },
                    })
                  }
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch video
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload failed</h3>
              <p className="text-muted-foreground mb-6">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <Button variant="glow" onClick={handleReset}>
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

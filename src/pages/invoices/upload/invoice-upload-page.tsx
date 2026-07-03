import * as React from "react";
import { useCallback, useEffect } from "react";
import {
  CameraIcon,
  CaretLeftIcon,
  CaretRightIcon,
  UploadSimpleIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react";

import { PageBackButton } from "@/components/navigation/page-back-button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { clearOcrSessionDrafts } from "@/features/invoice/invoice-slice";
import { bffService, uploadDraftStorageKey } from "@/services/bff-service";
import { useAppDispatch } from "@/store/hooks";

import "./invoice-upload.css";

interface CapturedPhoto {
  dataUrl: string;
  id: string;
  takenAt: string;
}

type CaptureMode = "idle" | "streaming" | "captured" | "file-capturing";
type SubmitState = "idle" | "submitted";

const canvasWidth = 960;
const canvasHeight = 640;

const createPhotoId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createPhoto = (dataUrl: string): CapturedPhoto => ({
  dataUrl,
  id: createPhotoId(),
  takenAt: new Date().toLocaleString("zh-CN"),
});

const readImageFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Invalid image result"));
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });

const InvoiceUploadPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const animationFrameRef = React.useRef<number | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const captureInputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);
  const continueFileCaptureRef = React.useRef(false);
  const streamRef = React.useRef<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const [cameraError, setCameraError] = React.useState("");
  const [captureMode, setCaptureMode] = React.useState<CaptureMode>("idle");
  const [draftPhoto, setDraftPhoto] = React.useState<CapturedPhoto | null>(
    null,
  );
  const [photos, setPhotos] = React.useState<CapturedPhoto[]>([]);
  const [isStartingCamera, setIsStartingCamera] = React.useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = React.useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = React.useState(false);
  const [isSubmittingPhotos, setIsSubmittingPhotos] = React.useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState(0);
  const [submitState, setSubmitState] = React.useState<SubmitState>("idle");

  const displayedPhoto = draftPhoto ?? photos[selectedPhotoIndex] ?? null;
  const isCaptured = captureMode === "captured";
  const isFileCapturing = captureMode === "file-capturing";
  const isStreaming = captureMode === "streaming";
  const isBusy =
    isStartingCamera || isSavingPhoto || isSubmittingPhotos || isUploadingFiles;

  const stopCanvasLoop = React.useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const stopCameraStream = React.useCallback(() => {
    stopCanvasLoop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopCanvasLoop]);

  const getCanvasContext = React.useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return null;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    return { canvas, context };
  }, []);

  const drawPlaceholder = React.useCallback(
    (message: string) => {
      const canvasState = getCanvasContext();

      if (!canvasState) {
        return;
      }

      const { context } = canvasState;
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = "#f7f7f7";
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = "#737373";
      context.font = "24px JetBrains Mono Variable, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(message, canvasWidth / 2, canvasHeight / 2);
    },
    [getCanvasContext],
  );

  const drawPhoto = React.useCallback(
    (photo: CapturedPhoto | null) => {
      const canvasState = getCanvasContext();

      if (!canvasState) {
        return undefined;
      }

      const { context } = canvasState;
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = "#f7f7f7";
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      if (!photo) {
        context.fillStyle = "#737373";
        context.font = "24px JetBrains Mono Variable, monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(
          t("invoiceUpload.canvas.empty"),
          canvasWidth / 2,
          canvasHeight / 2,
        );
        return undefined;
      }

      let cancelled = false;
      const image = new Image();

      image.onload = () => {
        if (cancelled) {
          return;
        }

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.fillStyle = "#050505";
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        const imageRatio = image.width / image.height;
        const canvasRatio = canvasWidth / canvasHeight;
        const drawWidth =
          imageRatio > canvasRatio ? canvasWidth : canvasHeight * imageRatio;
        const drawHeight =
          imageRatio > canvasRatio ? canvasWidth / imageRatio : canvasHeight;
        const drawX = (canvasWidth - drawWidth) / 2;
        const drawY = (canvasHeight - drawHeight) / 2;

        context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      };

      image.src = photo.dataUrl;

      return () => {
        cancelled = true;
      };
    },
    [getCanvasContext, t],
  );

  const drawCameraFrame = React.useCallback(() => {
    function drawFrame() {
      const canvasState = getCanvasContext();
      const video = videoRef.current;

      if (!canvasState || !video) {
        return;
      }

      const { context } = canvasState;

      if (!video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = window.requestAnimationFrame(drawFrame);
        return;
      }

      const videoRatio = video.videoWidth / video.videoHeight;
      const canvasRatio = canvasWidth / canvasHeight;
      const drawWidth =
        videoRatio > canvasRatio ? canvasWidth : canvasHeight * videoRatio;
      const drawHeight =
        videoRatio > canvasRatio ? canvasWidth / videoRatio : canvasHeight;
      const drawX = (canvasWidth - drawWidth) / 2;
      const drawY = (canvasHeight - drawHeight) / 2;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = "#050505";
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(video, drawX, drawY, drawWidth, drawHeight);
      animationFrameRef.current = window.requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }, [getCanvasContext]);

  useEffect(() => {
    if (isStreaming) {
      return undefined;
    }

    stopCanvasLoop();
    return drawPhoto(displayedPhoto);
  }, [displayedPhoto, drawPhoto, isStreaming, stopCanvasLoop]);

  useEffect(() => () => stopCameraStream(), [stopCameraStream]);

  const openFileCamera = useCallback(() => {
    window.setTimeout(() => captureInputRef.current?.click(), 0);
  }, []);

  const openFileUpload = useCallback(() => {
    if (isBusy || captureMode !== "idle") {
      return;
    }

    window.setTimeout(() => uploadInputRef.current?.click(), 0);
  }, [captureMode, isBusy]);

  const handleFileCaptured = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      continueFileCaptureRef.current = false;
      setCaptureMode("idle");
      drawPhoto(photos[selectedPhotoIndex] ?? null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setCaptureMode("idle");
      setCameraError(t("invoiceUpload.errors.invalidImage"));
      return;
    }

    try {
      const dataUrl = await readImageFile(file);
      setCameraError("");
      setDraftPhoto(createPhoto(dataUrl));
      setCaptureMode("captured");
    } catch {
      setCaptureMode("idle");
      setCameraError(t("invoiceUpload.errors.readFailed"));
    }
  };

  const handleFilesUploaded = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    if (files.some((file) => !getInvoiceUploadFileKind(file))) {
      setCameraError(t("invoiceUpload.errors.invalidFile"));
      return;
    }

    setIsUploadingFiles(true);
    setCameraError("");
    setSubmitState("idle");
    stopCameraStream();
    setDraftPhoto(null);
    setCaptureMode("idle");

    try {
      const nextPhotos = (
        await Promise.all(files.map((file) => fileToPhotos(file)))
      ).flat();

      if (nextPhotos.length === 0) {
        setCameraError(t("invoiceUpload.errors.invalidFile"));
        return;
      }

      setPhotos((currentPhotos) => {
        const mergedPhotos = [...currentPhotos, ...nextPhotos];
        setSelectedPhotoIndex(currentPhotos.length);
        return mergedPhotos;
      });
    } catch {
      setCameraError(t("invoiceUpload.errors.readFailed"));
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const startCamera = async () => {
    if (isStartingCamera) {
      return;
    }

    setIsStartingCamera(true);
    setCameraError("");
    setSubmitState("idle");
    setDraftPhoto(null);

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      continueFileCaptureRef.current = true;
      setCaptureMode("file-capturing");
      openFileCamera();
      setIsStartingCamera(false);
      return;
    }

    try {
      stopCameraStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
        },
      });
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      videoRef.current = video;
      streamRef.current = stream;

      await video.play();
      setCaptureMode("streaming");
      drawCameraFrame();
    } catch {
      setCaptureMode("idle");
      drawPlaceholder(t("invoiceUpload.errors.cameraUnavailable"));
      setCameraError(t("invoiceUpload.errors.cameraDenied"));
    } finally {
      setIsStartingCamera(false);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;

    if (!canvas || !isStreaming || isBusy) {
      return;
    }

    stopCanvasLoop();
    setDraftPhoto(createPhoto(canvas.toDataURL("image/jpeg", 0.92)));
    setCaptureMode("captured");
  };

  const resumeCameraPreview = () => {
    if (isBusy) {
      return;
    }

    setDraftPhoto(null);
    setSubmitState("idle");

    if (continueFileCaptureRef.current) {
      setCaptureMode("file-capturing");
      openFileCamera();
      return;
    }

    setCaptureMode("streaming");
    drawCameraFrame();
  };

  const saveDraftPhoto = () => {
    if (!draftPhoto || isSavingPhoto) {
      return;
    }

    const photoToSave = draftPhoto;
    setIsSavingPhoto(true);

    const savePhoto = new Promise<{ photo: CapturedPhoto }>((resolve) => {
      window.setTimeout(() => resolve({ photo: photoToSave }), 800);
    });

    toast.promise<{ photo: CapturedPhoto }>(savePhoto, {
      error: t("invoiceUpload.toast.saveFailed"),
      loading: t("invoiceUpload.toast.saving"),
      success: () => t("invoiceUpload.toast.saved"),
    });

    void savePhoto
      .then(({ photo }) => {
        setPhotos((currentPhotos) => {
          const nextPhotos = [...currentPhotos, photo];
          setSelectedPhotoIndex(nextPhotos.length - 1);
          return nextPhotos;
        });
        setDraftPhoto(null);
        setSubmitState("idle");

        if (continueFileCaptureRef.current) {
          setCaptureMode("file-capturing");
          openFileCamera();
          return;
        }

        setCaptureMode("streaming");
        drawCameraFrame();
      })
      .finally(() => setIsSavingPhoto(false));
  };

  const endCamera = () => {
    if (isBusy) {
      return;
    }

    continueFileCaptureRef.current = false;
    stopCameraStream();
    setDraftPhoto(null);
    setCaptureMode("idle");
    drawPhoto(photos[selectedPhotoIndex] ?? null);
  };

  const showPreviousPhoto = () => {
    setSelectedPhotoIndex((currentIndex) =>
      photos.length > 0
        ? (currentIndex - 1 + photos.length) % photos.length
        : currentIndex,
    );
  };

  const showNextPhoto = () => {
    setSelectedPhotoIndex((currentIndex) =>
      photos.length > 0 ? (currentIndex + 1) % photos.length : currentIndex,
    );
  };

  const submitPhotos = () => {
    if (photos.length === 0 || captureMode !== "idle" || isSubmittingPhotos) {
      return;
    }

    const uploadFiles = photos.map((photo, index) =>
      dataUrlToUploadFile(photo.dataUrl, index),
    );
    if (uploadFiles.some((file) => !file.contentBase64)) {
      setCameraError(t("invoiceUpload.errors.readFailed"));
      return;
    }
    setIsSubmittingPhotos(true);
    dispatch(clearOcrSessionDrafts());
    window.localStorage.removeItem(uploadDraftStorageKey);
    const submit = bffService.invoices.recognizeUpload(uploadFiles);

    void submit
      .then((response) => {
        const batchId = readCreatedBatchId(response);
        const sessions = readCreatedSessions(response);
        if (sessions.some((session) => !session.recognitionSessionId)) {
          throw new Error("Invoice upload did not return an OCR session ID.");
        }
        if (!batchId) {
          throw new Error("Invoice upload did not return an OCR batch ID.");
        }
        window.localStorage.setItem(
          uploadDraftStorageKey,
          JSON.stringify({
            batchId,
            fileId: sessions[0]?.fileId,
            photoCount: photos.length,
            recognitionSessionId: sessions[0]?.recognitionSessionId,
            sessions,
          }),
        );
        setSubmitState("submitted");
        continueFileCaptureRef.current = false;
        stopCameraStream();
        setCaptureMode("idle");
        navigate(`/invoice/upload/ocr?batchId=${encodeURIComponent(batchId)}`);
      })
      .finally(() => setIsSubmittingPhotos(false));
  };

  const selectedPhotoPosition =
    photos.length > 0
      ? `${selectedPhotoIndex + 1} / ${photos.length}`
      : "0 / 0";

  return (
    <main className="invoice-upload-page">
      <section className="invoice-upload-page__content">
        <input
          accept="image/*"
          capture="environment"
          className="invoice-upload-page__file-input"
          onChange={handleFileCaptured}
          ref={captureInputRef}
          type="file"
        />
        <input
          accept="application/pdf,image/jpeg,image/png"
          className="invoice-upload-page__file-input"
          multiple
          onChange={handleFilesUploaded}
          ref={uploadInputRef}
          type="file"
        />

        <header className="invoice-upload-page__heading">
          <div>
            <h1 className="invoice-upload-page__title">
              {t("invoiceUpload.title")}
            </h1>
          </div>
        </header>

        <section className="invoice-upload-page__workspace">
          <div className="invoice-upload-page__preview-panel">
            <div className="invoice-upload-page__canvas-header">
              <span>{t("invoiceUpload.canvas.preview")}</span>
              <span>
                {isStreaming || isFileCapturing
                  ? t("invoiceUpload.canvas.liveCamera")
                  : selectedPhotoPosition}
              </span>
            </div>

            <div className="invoice-upload-page__canvas-frame">
              <Button
                aria-label={t("invoiceUpload.aria.previousPhoto")}
                className="invoice-upload-page__nav-button invoice-upload-page__nav-button--left"
                disabled={
                  photos.length < 2 ||
                  isStreaming ||
                  isCaptured ||
                  isFileCapturing ||
                  isBusy
                }
                onClick={showPreviousPhoto}
                size="icon"
                type="button"
                variant="secondary"
              >
                <CaretLeftIcon />
              </Button>
              <canvas
                aria-label={t("invoiceUpload.aria.photoPreview")}
                className="invoice-upload-page__canvas"
                ref={canvasRef}
              />
              <Button
                aria-label={t("invoiceUpload.aria.nextPhoto")}
                className="invoice-upload-page__nav-button invoice-upload-page__nav-button--right"
                disabled={
                  photos.length < 2 ||
                  isStreaming ||
                  isCaptured ||
                  isFileCapturing ||
                  isBusy
                }
                onClick={showNextPhoto}
                size="icon"
                type="button"
                variant="secondary"
              >
                <CaretRightIcon />
              </Button>
            </div>
          </div>
        </section>

        {cameraError ? (
          <p className="invoice-upload-page__error">{cameraError}</p>
        ) : null}

        <footer className="invoice-upload-page__footer">
          <div className="invoice-upload-page__footer-back">
            <PageBackButton disabled={isBusy} />
          </div>

          <div className="invoice-upload-page__footer-center">
            {captureMode === "idle" ? (
              <>
                <Button
                  disabled={
                    isStartingCamera || isSubmittingPhotos || isUploadingFiles
                  }
                  onClick={startCamera}
                  type="button"
                >
                  {isStartingCamera ? <Spinner /> : <CameraIcon />}
                  {t("invoiceUpload.actions.startCamera")}
                </Button>
                <Button
                  disabled={isBusy}
                  onClick={openFileUpload}
                  type="button"
                  variant="outline"
                >
                  {isUploadingFiles ? <Spinner /> : <UploadSimpleIcon />}
                  {t("invoiceUpload.actions.uploadFile")}
                </Button>
              </>
            ) : null}

            {captureMode === "streaming" || captureMode === "file-capturing" ? (
              <>
                <Button
                  disabled={isFileCapturing || isBusy}
                  onClick={capturePhoto}
                  type="button"
                >
                  <CameraIcon />
                  {t("invoiceUpload.actions.capture")}
                </Button>
                <Button
                  disabled={isBusy}
                  onClick={endCamera}
                  type="button"
                  variant="outline"
                >
                  {t("invoiceUpload.actions.end")}
                </Button>
              </>
            ) : null}

            {captureMode === "captured" ? (
              <>
                <Button
                  disabled={isSavingPhoto}
                  onClick={saveDraftPhoto}
                  type="button"
                >
                  {isSavingPhoto ? <Spinner /> : null}
                  {t("invoiceUpload.actions.save")}
                </Button>
                <Button
                  disabled={isSavingPhoto}
                  onClick={resumeCameraPreview}
                  type="button"
                  variant="outline"
                >
                  {t("invoiceUpload.actions.cancel")}
                </Button>
              </>
            ) : null}
          </div>

          <div className="invoice-upload-page__footer-submit">
            <Button
              disabled={photos.length === 0 || captureMode !== "idle" || isBusy}
              onClick={submitPhotos}
              type="button"
            >
              {isSubmittingPhotos ? <Spinner /> : <PaperPlaneTiltIcon />}
              {t("invoiceUpload.actions.submit")}
            </Button>
          </div>
        </footer>

        {submitState === "submitted" ? (
          <p className="invoice-upload-page__result">
            {t("invoiceUpload.result", { count: photos.length })}
          </p>
        ) : null}
      </section>
    </main>
  );
};

function dataUrlToUploadFile(dataUrl: string, index: number) {
  const [metadata = "", contentBase64 = ""] = dataUrl.split(",", 2);
  const mimeType = metadata.match(/^data:([^;]+);base64$/)?.[1] ?? "image/jpeg";
  const binary = window.atob(contentBase64);
  return {
    contentBase64,
    fileName: `invoice-${Date.now()}-${index + 1}.${mimeType === "image/png" ? "png" : "jpg"}`,
    mimeType,
    size: binary.length,
  };
}

async function fileToPhotos(file: File) {
  const fileKind = getInvoiceUploadFileKind(file);

  if (fileKind === "pdf") {
    return pdfFileToPhotos(file);
  }

  if (fileKind === "image") {
    return [createPhoto(await readImageFile(file))];
  }

  throw new Error("Unsupported file type");
}

function getInvoiceUploadFileKind(file: File): "pdf" | "image" | null {
  const lowerFileName = file.name.toLowerCase();
  const isPdf =
    file.type === "application/pdf" || lowerFileName.endsWith(".pdf");
  const isJpeg =
    file.type === "image/jpeg" ||
    lowerFileName.endsWith(".jpg") ||
    lowerFileName.endsWith(".jpeg");
  const isPng = file.type === "image/png" || lowerFileName.endsWith(".png");

  if (isPdf) {
    return "pdf";
  }

  if (isJpeg || isPng) {
    return "image";
  }

  return null;
}

async function pdfFileToPhotos(file: File) {
  const [pdfjsLib, pdfWorker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.mjs?url"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const photos: CapturedPhoto[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      continue;
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    photos.push(createPhoto(canvas.toDataURL("image/png")));
  }

  return photos;
}

function readCreatedFileId(response: unknown) {
  const object = asRecord(response);
  const data = asRecord(object.data);
  const id = object.fileId ?? object.file_id ?? data.fileId ?? data.file_id;

  return typeof id === "string" && id ? id : "";
}

function readCreatedBatchId(response: unknown) {
  const object = asRecord(response);
  const data = asRecord(object.data);
  const id = object.batchId ?? object.batch_id ?? data.batchId ?? data.batch_id;

  return typeof id === "string" && id ? id : "";
}

function readCreatedSessions(response: unknown) {
  const object = asRecord(response);
  const data = asRecord(object.data);
  const sessions =
    (Array.isArray(object.sessions) ? object.sessions : undefined) ??
    (Array.isArray(data.sessions) ? data.sessions : undefined);

  if (sessions && sessions.length > 0) {
    return sessions.map((session) => {
      const item = asRecord(session);
      const sessionId =
        item.sessionId ??
        item.recognitionSessionId ??
        item.ocrSessionId ??
        item.id;
      return {
        fileId: typeof item.fileId === "string" ? item.fileId : "",
        recognitionSessionId:
          typeof sessionId === "string" && sessionId ? sessionId : "",
      };
    });
  }

  const recognitionSessionId = readCreatedSessionId(response);
  return recognitionSessionId
    ? [{ fileId: readCreatedFileId(response), recognitionSessionId }]
    : [];
}

function readCreatedSessionId(response: unknown) {
  const object = asRecord(response);
  const data = asRecord(object.data);
  const sessions =
    (Array.isArray(object.sessions) ? object.sessions : undefined) ??
    (Array.isArray(data.sessions) ? data.sessions : undefined);
  const firstSession = asRecord(sessions?.[0]);
  const id =
    object.sessionId ??
    firstSession.sessionId ??
    object.invoiceId ??
    object.id ??
    object.invoice_id ??
    data.sessionId ??
    data.invoiceId ??
    data.id ??
    data.invoice_id;

  if (typeof id === "string" && id) {
    return id;
  }

  return "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export { InvoiceUploadPage };

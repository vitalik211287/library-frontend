import {
  useEffect,
  useMemo,
  useState,
} from "react";

const CAMERA_STORAGE_KEY = "library-scanner-camera";

const useScannerCameras = ({
  scanLockRef,
  setIsScanned,
}) => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCameras = async () => {
      try {
        setCameraError("");

        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraError(
            "Камера недоступна в цьому браузері",
          );

          return;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: {
                ideal: "environment",
              },
            },
            audio: false,
          });

        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        const devices =
          await navigator.mediaDevices.enumerateDevices();

        if (cancelled) {
          return;
        }

        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );

        if (videoDevices.length === 0) {
          setCameraError("Камеру не знайдено");

          return;
        }

        const rearCameras = videoDevices.filter(
          (camera) => {
            const label = camera.label.toLowerCase();

            return (
              label.includes("back") ||
              label.includes("rear") ||
              label.includes("environment") ||
              label.includes("зад")
            );
          },
        );

        const availableCameras =
          rearCameras.length > 0
            ? rearCameras
            : videoDevices;

        setCameras(availableCameras);

        const savedCameraId =
          localStorage.getItem(CAMERA_STORAGE_KEY);

        const savedCamera = availableCameras.find(
          (camera) =>
            camera.deviceId === savedCameraId,
        );

        if (savedCamera) {
          setSelectedCamera(savedCamera.deviceId);

          return;
        }

        const preferredCamera =
          availableCameras.find((camera) => {
            const label = camera.label.toLowerCase();

            return (
              label.includes("camera 0") ||
              label.includes("back camera") ||
              label.includes("rear camera")
            );
          }) || availableCameras[0];

        if (preferredCamera) {
          setSelectedCamera(preferredCamera.deviceId);
        }
      } catch (error) {
        console.error(
          "Помилка отримання камер:",
          error,
        );

        if (error?.name === "NotAllowedError") {
          setCameraError(
            "Немає дозволу на використання камери",
          );

          return;
        }

        if (error?.name === "NotFoundError") {
          setCameraError("Камеру не знайдено");

          return;
        }

        setCameraError(
          "Не вдалося відкрити камеру",
        );
      }
    };

    loadCameras();

    return () => {
      cancelled = true;
      scanLockRef.current = true;
    };
  }, [scanLockRef]);

  const currentCameraIndex = useMemo(
    () =>
      cameras.findIndex(
        (camera) =>
          camera.deviceId === selectedCamera,
      ),
    [cameras, selectedCamera],
  );

  const handleSwitchCamera = () => {
    if (cameras.length < 2) {
      return;
    }

    const nextIndex =
      currentCameraIndex < 0
        ? 0
        : (currentCameraIndex + 1) %
          cameras.length;

    const nextCamera = cameras[nextIndex];

    if (!nextCamera) {
      return;
    }

    scanLockRef.current = false;
    setIsScanned(false);
    setSelectedCamera(nextCamera.deviceId);

    localStorage.setItem(
      CAMERA_STORAGE_KEY,
      nextCamera.deviceId,
    );
  };

  return {
    cameras,
    selectedCamera,
    cameraError,
    setCameraError,
    handleSwitchCamera,
  };
};

export default useScannerCameras;

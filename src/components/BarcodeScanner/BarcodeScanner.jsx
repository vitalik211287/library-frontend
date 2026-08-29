import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useZxing,
} from "react-zxing";

import "./BarcodeScanner.css";

const BarcodeScanner = ({
  onScan,
  onClose,
}) => {
  const [
    cameras,
    setCameras,
  ] = useState([]);

  const [
    selectedCamera,
    setSelectedCamera,
  ] = useState("");

  const [
    isScanned,
    setIsScanned,
  ] = useState(false);

  const [
    cameraError,
    setCameraError,
  ] = useState("");

  const scanLockRef =
    useRef(false);

  /* =========================
     LOAD CAMERAS
  ========================= */

  useEffect(() => {
    let cancelled =
      false;

    const loadCameras =
      async () => {
        try {
          setCameraError(
            "",
          );

          if (
            !navigator
              .mediaDevices
              ?.getUserMedia
          ) {
            setCameraError(
              "Камера недоступна в цьому браузері",
            );

            return;
          }

          /*
           * Спочатку запитуємо
           * доступ до камери,
           * щоб браузер відкрив
           * назви пристроїв.
           */
          const stream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: {
                  facingMode: {
                    ideal:
                      "environment",
                  },
                },
                audio: false,
              },
            );

          stream
            .getTracks()
            .forEach(
              (
                track,
              ) => {
                track.stop();
              },
            );

          const devices =
            await navigator.mediaDevices.enumerateDevices();

          if (cancelled) {
            return;
          }

          const videoDevices =
            devices.filter(
              (
                device,
              ) =>
                device.kind ===
                "videoinput",
            );

          if (
            videoDevices.length ===
            0
          ) {
            setCameraError(
              "Камеру не знайдено",
            );

            return;
          }

          /*
           * Задні камери.
           */
          const rearCameras =
            videoDevices.filter(
              (
                camera,
              ) => {
                const label =
                  camera.label
                    .toLowerCase();

                return (
                  label.includes(
                    "back",
                  ) ||
                  label.includes(
                    "rear",
                  ) ||
                  label.includes(
                    "environment",
                  ) ||
                  label.includes(
                    "зад",
                  )
                );
              },
            );

          const availableCameras =
            rearCameras.length >
            0
              ? rearCameras
              : videoDevices;

          setCameras(
            availableCameras,
          );

          /*
           * Якщо користувач уже
           * вибирав камеру —
           * використовуємо її.
           */
          const savedCameraId =
            localStorage.getItem(
              "library-scanner-camera",
            );

          const savedCamera =
            availableCameras.find(
              (
                camera,
              ) =>
                camera.deviceId ===
                savedCameraId,
            );

          if (savedCamera) {
            setSelectedCamera(
              savedCamera.deviceId,
            );

            return;
          }

          /*
           * Пробуємо вибрати
           * нормальну основну
           * задню камеру,
           * а не macro / ultra wide.
           */
          const preferredCamera =
            availableCameras.find(
              (
                camera,
              ) => {
                const label =
                  camera.label
                    .toLowerCase();

                return (
                  label.includes(
                    "camera 0",
                  ) ||
                  label.includes(
                    "back camera",
                  ) ||
                  label.includes(
                    "rear camera",
                  )
                );
              },
            ) ||
            availableCameras[0];

          if (
            preferredCamera
          ) {
            setSelectedCamera(
              preferredCamera.deviceId,
            );
          }
        } catch (error) {
          console.error(
            "Помилка отримання камер:",
            error,
          );

          if (
            error?.name ===
            "NotAllowedError"
          ) {
            setCameraError(
              "Немає дозволу на використання камери",
            );

            return;
          }

          if (
            error?.name ===
            "NotFoundError"
          ) {
            setCameraError(
              "Камеру не знайдено",
            );

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

      scanLockRef.current =
        true;
    };
  }, []);

  /* =========================
     CURRENT CAMERA INDEX
  ========================= */

  const currentCameraIndex =
    useMemo(() => {
      return cameras.findIndex(
        (
          camera,
        ) =>
          camera.deviceId ===
          selectedCamera,
      );
    }, [
      cameras,
      selectedCamera,
    ]);

  /* =========================
     SWITCH CAMERA
  ========================= */

  const handleSwitchCamera =
    () => {
      if (
        cameras.length <
        2
      ) {
        return;
      }

      const nextIndex =
        currentCameraIndex <
        0
          ? 0
          : (
              currentCameraIndex +
              1
            ) %
            cameras.length;

      const nextCamera =
        cameras[
          nextIndex
        ];

      if (!nextCamera) {
        return;
      }

      scanLockRef.current =
        false;

      setIsScanned(
        false,
      );

      setSelectedCamera(
        nextCamera.deviceId,
      );

      localStorage.setItem(
        "library-scanner-camera",
        nextCamera.deviceId,
      );
    };

  /* =========================
     VALIDATE ISBN-13
  ========================= */

  const isValidIsbn13 = (
    value,
  ) => {
    if (
      !/^\d{13}$/.test(
        value,
      )
    ) {
      return false;
    }

    /*
     * ISBN-13 книги:
     * 978 або 979.
     */
    if (
      !value.startsWith(
        "978",
      ) &&
      !value.startsWith(
        "979",
      )
    ) {
      return false;
    }

    /*
     * Перевірка контрольної
     * цифри ISBN-13.
     */
    let sum = 0;

    for (
      let index = 0;
      index < 12;
      index += 1
    ) {
      const digit =
        Number(
          value[index],
        );

      sum +=
        index % 2 === 0
          ? digit
          : digit * 3;
    }

    const checkDigit =
      (
        10 -
        (
          sum % 10
        )
      ) %
      10;

    return (
      checkDigit ===
      Number(
        value[12],
      )
    );
  };

  /* =========================
     SCAN RESULT
  ========================= */

  const handleScanResult =
    (
      value,
    ) => {
      if (
        scanLockRef.current
      ) {
        return;
      }

      const cleanIsbn =
        String(
          value ?? "",
        ).replace(
          /\D/g,
          "",
        );

      if (
        !isValidIsbn13(
          cleanIsbn,
        )
      ) {
        return;
      }

      /*
       * ZXing може розпізнати
       * один штрихкод багато
       * разів поспіль.
       *
       * Тому блокуємо все
       * після першого результату.
       */
      scanLockRef.current =
        true;

      setIsScanned(
        true,
      );

      if (
        selectedCamera
      ) {
        localStorage.setItem(
          "library-scanner-camera",
          selectedCamera,
        );
      }

      /*
       * Це одразу передає ISBN
       * у AddBookPage.
       *
       * Там handleScan:
       * setIsbn()
       * setScannerOpen(false)
       * lookupBook()
       */
      onScan(
        cleanIsbn,
      );
    };

  /* =========================
     ZXING
  ========================= */

  const {
    ref,
    torch,
  } = useZxing({
    paused:
      !selectedCamera ||
      isScanned,

    deviceId:
      selectedCamera ||
      undefined,

    formats: [
      "ean_13",
    ],

    trySkew: true,

    timeBetweenDecodingAttempts:
      120,

    constraints: {
      audio: false,

      video:
        selectedCamera
          ? {
              deviceId: {
                exact:
                  selectedCamera,
              },

              width: {
                ideal:
                  1920,
              },

              height: {
                ideal:
                  1080,
              },
            }
          : {
              facingMode: {
                ideal:
                  "environment",
              },

              width: {
                ideal:
                  1920,
              },

              height: {
                ideal:
                  1080,
              },
            },
    },

    onDecodeResult: (
      result,
    ) => {
      handleScanResult(
        result.rawValue,
      );
    },

    onError: (
      error,
    ) => {
      console.error(
        "Помилка камери сканера:",
        error,
      );

      if (
        error?.name ===
        "NotAllowedError"
      ) {
        setCameraError(
          "Немає дозволу на використання камери",
        );

        return;
      }

      setCameraError(
        "Не вдалося запустити сканер",
      );
    },
  });

  /* =========================
     CLOSE
  ========================= */

  const handleClose =
    () => {
      scanLockRef.current =
        true;

      onClose();
    };

  /* =========================
     TORCH
  ========================= */

  const handleTorch =
    async () => {
      try {
        if (
          !torch
            ?.isAvailable
        ) {
          return;
        }

        if (
          torch.isOn
        ) {
          await torch.off();

          return;
        }

        await torch.on();
      } catch (error) {
        console.error(
          "Помилка ліхтарика:",
          error,
        );
      }
    };

  /* =========================
     JSX
  ========================= */

  return (
    <div
      className="scanner-overlay"
      onClick={
        handleClose
      }
    >
      <div
        className="scanner-modal"
        onClick={(
          event,
        ) => {
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          className="scanner-close"
          onClick={
            handleClose
          }
          aria-label="Закрити сканер"
        >
          ×
        </button>

        <h2>
          Сканувати ISBN
        </h2>

        <p>
          {isScanned
            ? "ISBN розпізнано. Шукаємо книгу..."
            : "Наведіть камеру на штрихкод книги"}
        </p>

        {cameraError ? (
          <div className="scanner-error">
            {
              cameraError
            }
          </div>
        ) : (
          <div className="scanner-camera">
            <video
              ref={ref}
              className="scanner-video"
              muted
              playsInline
              autoPlay
            />

            <div
              className={
                isScanned
                  ? "scanner-frame scanner-frame--success"
                  : "scanner-frame"
              }
            />

            {!isScanned &&
              cameras.length >
                1 && (
                <button
                  type="button"
                  className="scanner-switch-camera"
                  onClick={
                    handleSwitchCamera
                  }
                  aria-label="Змінити камеру"
                  title="Змінити камеру"
                >
                  ↻
                </button>
              )}

            {!isScanned &&
              torch
                ?.isAvailable && (
                <button
                  type="button"
                  className="scanner-torch"
                  onClick={
                    handleTorch
                  }
                  aria-label={
                    torch.isOn
                      ? "Вимкнути ліхтарик"
                      : "Увімкнути ліхтарик"
                  }
                  title={
                    torch.isOn
                      ? "Вимкнути ліхтарик"
                      : "Увімкнути ліхтарик"
                  }
                >
                  {torch.isOn
                    ? "☀"
                    : "⚡"}
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
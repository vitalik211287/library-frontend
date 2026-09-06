const useScannerControls = ({
  onClose,
  scanLockRef,
  torch,
}) => {
  const handleClose = () => {
    scanLockRef.current = true;
    onClose();
  };

  const handleTorch = async () => {
    try {
      if (!torch?.isAvailable) {
        return;
      }

      if (torch.isOn) {
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

  return {
    handleClose,
    handleTorch,
  };
};

export default useScannerControls;

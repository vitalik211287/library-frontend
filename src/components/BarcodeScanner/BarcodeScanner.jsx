const { ref } = useZxing({
  onDecodeResult(result) {
    const scannedValue = result.getText();

    if (scannedValue) {
      onScan(scannedValue);
    }
  },

  constraints: {
    video: {
      facingMode: "environment",
    },
  },
});
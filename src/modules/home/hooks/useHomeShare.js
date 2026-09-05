const useHomeShare = (streak) => {
  const handleShare = async () => {
    const text =
      streak > 0
        ? `Моя серія читання — ${streak} дн. поспіль 📚`
        : "Я читаю у своїй бібліотеці 📚";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Моя серія читання",
          text,
        });

        return;
      }

      await navigator.clipboard.writeText(text);
    } catch (shareError) {
      console.error("Share error:", shareError);
    }
  };

  return {
    handleShare,
  };
};

export default useHomeShare;

import { useState } from "react";
import toast from "react-hot-toast";

const useHomeLibraryActions = ({
  activeLibraryId,
  createLibrary,
  addLibraryMember,
  setActiveLibraryId,
  setIsLibraryMenuOpen,
}) => {
  const [modalType, setModalType] = useState(null);
  const [libraryName, setLibraryName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectLibrary = (libraryId) => {
    setActiveLibraryId(libraryId);
    setIsLibraryMenuOpen(false);
  };

  const handleCreateLibrary = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      await createLibrary(libraryName);

      toast.success("Бібліотеку створено");

      setLibraryName("");
      setModalType(null);
    } catch (createError) {
      toast.error(
        createError instanceof Error
          ? createError.message
          : "Не вдалося створити бібліотеку",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!activeLibraryId) {
      toast.error("Спочатку виберіть бібліотеку");
      return;
    }

    try {
      setIsSubmitting(true);

      await addLibraryMember(
        activeLibraryId,
        memberEmail,
      );

      toast.success("Учасника додано");

      setMemberEmail("");
      setModalType(null);
    } catch (memberError) {
      toast.error(
        memberError instanceof Error
          ? memberError.message
          : "Не вдалося додати учасника",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    modalType,
    setModalType,
    libraryName,
    setLibraryName,
    memberEmail,
    setMemberEmail,
    isSubmitting,
    handleSelectLibrary,
    handleCreateLibrary,
    handleAddMember,
  };
};

export default useHomeLibraryActions;

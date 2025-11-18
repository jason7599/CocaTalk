import type React from "react";
import { useModal } from "../context/ModalContext";
import { useState } from "react";

const FriendRequestModal: React.FC = () => {
    const { closeModal } = useModal();

    const [username, setUsername] = useState("");
    const [error, setError] = useState<String | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            setError("Please enter a username!");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        
    }
};

export default FriendRequestModal;
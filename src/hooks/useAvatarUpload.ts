import { useEffect, useRef, useState, type RefObject } from 'react';
import { toast } from 'sonner';

import { rpcClient } from '@/lib/rpc.client';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database.types';

type AvatarRow = Tables<'avatars'>;

interface UseAvatarUploadOptions {
    userId: string | null;
    onCustomAvatarSelected?: () => void;
}

interface UseAvatarUploadResult {
    avatarImageSrc: string | null;
    pendingAvatarBlob: Blob | null;
    pendingAvatarPreviewUrl: string | null;
    isUploadingAvatar: boolean;
    avatarInputRef: RefObject<HTMLInputElement>;
    handleAvatarFileSelected: (file: File) => void;
    handleAvatarCropped: (blob: Blob) => void;
    uploadAvatar: (blob: Blob) => Promise<AvatarRow | null>;
    resetPendingAvatar: () => void;
}

export function useAvatarUpload({
    userId,
    onCustomAvatarSelected,
}: UseAvatarUploadOptions): UseAvatarUploadResult {
    const [avatarImageSrc, setAvatarImageSrc] = useState<string | null>(null);
    const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
    const [pendingAvatarPreviewUrl, setPendingAvatarPreviewUrl] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const pendingAvatarUrlRef = useRef<string | null>(null);

    const scheduleRevoke = (url: string | null): void => {
        if (!url) return;
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 0);
    };

    const revokePendingUrl = (): void => {
        if (pendingAvatarUrlRef.current) {
            scheduleRevoke(pendingAvatarUrlRef.current);
            pendingAvatarUrlRef.current = null;
        }
    };

    const resetPendingAvatar = (): void => {
        revokePendingUrl();
        setAvatarImageSrc(null);
        setPendingAvatarPreviewUrl(null);
        setPendingAvatarBlob(null);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    useEffect(() => () => {
        revokePendingUrl();
    }, []);

    const handleAvatarFileSelected = (file: File): void => {
        if (!file) return;
        if (pendingAvatarUrlRef.current) {
            scheduleRevoke(pendingAvatarUrlRef.current);
            pendingAvatarUrlRef.current = null;
        }
        setPendingAvatarPreviewUrl(null);
        setPendingAvatarBlob(null);
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setAvatarImageSrc(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarCropped = (blob: Blob): void => {
        const previousUrl = pendingAvatarUrlRef.current;
        const previewUrl = URL.createObjectURL(blob);
        pendingAvatarUrlRef.current = previewUrl;
        setPendingAvatarPreviewUrl(previewUrl);
        setPendingAvatarBlob(blob);
        setAvatarImageSrc(null);
        onCustomAvatarSelected?.();
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
        if (previousUrl && previousUrl !== previewUrl) {
            scheduleRevoke(previousUrl);
        }
    };

    const listAllAvatarFiles = async (): Promise<string[]> => {
        if (!userId) return [];
        const files: string[] = [];
        const limit = 100;
        let offset = 0;
        while (true) {
            const { data: storedFiles } = await supabase.storage
                .from('avatars-personal')
                .list(userId, { limit, offset });
            const batch = Array.isArray(storedFiles) ? storedFiles : [];
            files.push(...batch.map((item) => `${userId}/${item.name}`));
            if (batch.length < limit) break;
            offset += limit;
        }
        return files;
    };

    const uploadAvatar = async (blob: Blob): Promise<AvatarRow | null> => {
        if (!userId) return null;
        setIsUploadingAvatar(true);

        try {
            const ext = blob.type?.split('/').pop() ?? 'jpg';
            const fileName = `${crypto.randomUUID()}.${ext}`;
            const filePath = `${userId}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('avatars-personal')
                .upload(filePath, blob, { upsert: false, contentType: blob.type || 'image/jpeg' });

            if (error) {
                throw error;
            }

            const { data: publicUrlData } = supabase.storage
                .from('avatars-personal')
                .getPublicUrl(data.path);

            const publicUrl = publicUrlData?.publicUrl;
            if (!publicUrl) {
                throw new Error('Unable to generate avatar URL');
            }

            const storedFiles = await listAllAvatarFiles();
            const removePaths = storedFiles.filter((path) => path !== data.path);
            if (removePaths.length > 0) {
                await supabase.storage.from('avatars-personal').remove(removePaths);
            }

            const updatedRows = await rpcClient.upsert_my_avatar({
                p_url: publicUrl,
                p_is_preset: false,
            });

            const updatedAvatar = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
            if (!updatedAvatar) {
                throw new Error('Unable to save avatar');
            }

            return updatedAvatar;
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : String(err);
            const isNetworkError = message.includes('Failed to fetch')
                || message.includes('ERR_CONNECTION_CLOSED')
                || message.includes('NetworkError');
            toast.error(isNetworkError ? 'Network error, try again in a minute.' : 'Unable to upload avatar');
            return null;
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    return {
        avatarImageSrc,
        pendingAvatarBlob,
        pendingAvatarPreviewUrl,
        isUploadingAvatar,
        avatarInputRef,
        handleAvatarFileSelected,
        handleAvatarCropped,
        uploadAvatar,
        resetPendingAvatar,
    };
}

import { useEffect, useRef, useState, type RefObject } from 'react';

import { rpcClient } from '@/lib/rpc.client';
import { logBackendError } from '@/lib/backendErrors';
import { getStoragePublicUrl, listStoragePaths, removeStoragePaths, uploadStorageFile } from '@/lib/storageClient';
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
    uploadAvatar: (blob: Blob) => Promise<AvatarRow>;
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
        return listStoragePaths('avatars-personal', userId, {
            module: 'AvatarUpload',
            operation: 'list previous avatar files',
            trigger: 'user',
            ids: { userId },
        });
    };

    const uploadAvatar = async (blob: Blob): Promise<AvatarRow> => {
        if (!userId) {
            throw new Error('Unable to upload avatar without an active user.');
        }
        setIsUploadingAvatar(true);

        try {
            const ext = blob.type?.split('/').pop() ?? 'jpg';
            const fileName = `${crypto.randomUUID()}.${ext}`;
            const filePath = `${userId}/${fileName}`;

            const storedPath = await uploadStorageFile('avatars-personal', filePath, blob, {
                module: 'AvatarUpload',
                operation: 'upload avatar file',
                trigger: 'user',
                ids: { userId, filePath },
            });
            const publicUrl = getStoragePublicUrl('avatars-personal', storedPath, {
                module: 'AvatarUpload',
                operation: 'resolve avatar public url',
                trigger: 'user',
                ids: { userId, filePath: storedPath },
            });

            const storedFiles = await listAllAvatarFiles();
            const removePaths = storedFiles.filter((path) => path !== storedPath);
            if (removePaths.length > 0) {
                await removeStoragePaths('avatars-personal', removePaths, {
                    module: 'AvatarUpload',
                    operation: 'remove previous avatar files',
                    trigger: 'user',
                    ids: { userId },
                });
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
            logBackendError({
                module: 'AvatarUpload',
                operation: 'upload avatar',
                trigger: 'user',
                error: err,
                ids: { userId },
            });
            throw err;
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

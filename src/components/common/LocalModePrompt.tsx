import { useContext, useState, useEffect } from 'react';
import { FileSystemBackupContext } from '../../contexts/FileSystemBackupContext';
import { useTranslation } from 'react-i18next';

export const LocalModePrompt = () => {
    const { t } = useTranslation();
    const { status, requestAccess, restoreHandle, verifyStoredHandlePermission } = useContext(FileSystemBackupContext);
    const [localError, setLocalError] = useState<string | null>(null);
    const [hasStoredHandle, setHasStoredHandle] = useState(false);
    const [checking, setChecking] = useState(true);

    // Initial check for stored handle
    useEffect(() => {
        if (!restoreHandle) return;

        restoreHandle().then((ready) => {
            if (ready) {
                // If ready (permission already granted), we are good!
                // The status.isConnected will flip to true and this component will unmount
            } else {
                // If not ready, but we found a handle (e.g. need verify), we know we have one
                // We can check if fileSystemBackupService.getRootHandle() is not null
                // But effectively if restoreHandle returned false, either no handle OR no permission
                // We'll optimistically try to verify
                setHasStoredHandle(true);
            }
            setChecking(false);
        });
    }, [restoreHandle]);

    // If already connected, do not show anything
    if (status.isConnected) {
        return null;
    }

    if (checking) return null; // Or a spinner

    const supportsFs = 'showDirectoryPicker' in window;

    const handleConnect = async () => {
        setLocalError(null);
        try {
            console.log("Requesting access...");
            await requestAccess();
        } catch (error) {
            console.error("Failed to connect local storage:", error);
            setLocalError(String(error));
        }
    };

    const handleResume = async () => {
        try {
            const success = await verifyStoredHandlePermission();
            if (!success) {
                // If verify failed (e.g. user denied), fall back to full connect
                await handleConnect();
            }
        } catch (error) {
            console.error("Failed to resume:", error);
            await handleConnect();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <article style={{ maxWidth: '500px', padding: '2rem' }}>
                <header>
                    <h3>{t('Local Mode Setup')}</h3>
                </header>
                <p>
                    {t('TeXlyre is running in "Local Mode". Please select a folder on your computer to store your projects.')}
                </p>

                {!supportsFs && (
                    <div style={{ backgroundColor: '#ffdddd', color: 'red', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
                        <strong>{t('Error:')}</strong> {t('Your browser does not support the File System Access API. Please use Chrome, Edge, or Opera.')}
                    </div>
                )}

                {(status.error || localError) && (
                    <div style={{ backgroundColor: '#ffdddd', color: 'red', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
                        {t('Error:')} {status.error || localError}
                    </div>
                )}

                <p>
                    <strong>{t('Recommendation:')}</strong> {t('Select the "Local Storage" folder in the project root.')}
                </p>
                <footer>
                    {hasStoredHandle ? (
                        <button onClick={handleResume} disabled={!supportsFs} style={{ width: '100%', marginBottom: '0.5rem', backgroundColor: '#4caf50' }}>
                            {t('Reconnect to Existing Storage')}
                        </button>
                    ) : null}

                    <button onClick={handleConnect} disabled={!supportsFs} style={{ width: '100%' }}>
                        {t(hasStoredHandle ? 'Select Different Folder' : 'Connect Local Storage Folder')}
                    </button>
                    {/* Debug info */}
                    <small style={{ display: 'block', marginTop: '1rem', color: '#666' }}>
                        Status: {status.status} | Enabled: {String(status.isEnabled)}
                    </small>
                </footer>
            </article>
        </div>
    );
};

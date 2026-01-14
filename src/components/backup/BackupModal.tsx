// src/components/backup/BackupModal.tsx
import { t } from '@/i18n';
import type React from 'react';
import { useEffect, useState } from 'react';

import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/NotificationService';
import { formatDate } from '../../utils/dateUtils';
import {
  DisconnectIcon,
  ExportIcon,
  FileSystemIcon,
  FolderIcon,
  ImportIcon,
  SettingsIcon,
  TrashIcon
} from
  '../common/Icons';
import Modal from '../common/Modal';
import SettingsModal from '../settings/SettingsModal';

interface BackupStatus {
  isConnected: boolean;
  isEnabled: boolean;
  lastSync: number | null;
  status: 'idle' | 'syncing' | 'error';
  error?: string;
}

interface BackupActivity {
  id: string;
  type:
  'backup_start' |
  'backup_complete' |
  'backup_error' |
  'import_start' |
  'import_complete' |
  'import_error';
  message: string;
  timestamp: number;
  data?: any;
}

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BackupStatus;
  activities: BackupActivity[];
  onRequestAccess: (isAutoStart?: boolean) => Promise<boolean>;
  onSynchronize: (projectId?: string) => Promise<void>;
  onExportToFileSystem: (projectId?: string) => Promise<void>;
  onImportChanges: (projectId?: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onClearActivity: (id: string) => void;
  onClearAllActivities: () => void;
  onChangeDirectory: () => Promise<boolean>;
  currentProjectId?: string | null;
  isInEditor?: boolean;
}

const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  status,
  activities = [],
  onRequestAccess,
  onSynchronize,
  onExportToFileSystem,
  onImportChanges,
  onDisconnect,
  onClearActivity,
  onClearAllActivities,
  onChangeDirectory,
  currentProjectId,
  isInEditor = false
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [syncScope, setSyncScope] = useState<'current' | 'all'>('current');
  const [isOperating, setIsOperating] = useState(false);
  const { getProjectById } = useAuth();
  const [currentProjectName, setCurrentProjectName] = useState<string>('');

  useEffect(() => {
    const loadProjectName = async () => {
      if (currentProjectId) {
        try {
          const project = await getProjectById(currentProjectId);
          setCurrentProjectName(project?.name || 'Current project only');
        } catch (_error) {
          setCurrentProjectName('Current project only');
        }
      }
    };

    if (isInEditor && currentProjectId) {
      loadProjectName();
    }
  }, [currentProjectId, getProjectById, isInEditor]);

  const getStatusText = () => {
    if (!status.isConnected) return t('Select a folder');
    if (status.status === 'error') return t('Storage error');
    if (status.status === 'syncing') return t('Syncing...');
    if (status.lastSync) {
      return t('Last Saved: {date}', { date: formatDate(status.lastSync) });
    }
    return t('Ready to save');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'backup_error':
      case 'import_error':
        return '❌';
      case 'backup_complete':
      case 'import_complete':
        return '✅';
      case 'backup_start':
        return '📤';
      case 'import_start':
        return '📥';
      default:
        return 'ℹ️';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'backup_error':
      case 'import_error':
        return '#dc3545';
      case 'backup_complete':
      case 'import_complete':
        return '#28a745';
      case 'backup_start':
        return '#007bff';
      case 'import_start':
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  };

  const handleExport = async () => {
    if (isOperating) return;

    setIsOperating(true);
    const projectId =
      isInEditor && syncScope === 'current' ? currentProjectId : undefined;
    const operationId = `backup-export-${Date.now()}`;

    try {
      const loadingMessage = projectId ?
        t('Saving {projectName} to PC...', { projectName: currentProjectName }) :
        t('Saving all projects to PC...');
      notificationService.showLoading(loadingMessage, operationId);

      await onExportToFileSystem(projectId || undefined);

      const successMessage = projectId ?
        t('{projectName} saved successfully', { projectName: currentProjectName }) :
        t('All projects saved successfully');
      notificationService.showSuccess(successMessage, { operationId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('Unknown error');
      notificationService.showError(
        t('Save failed: {error}', { error: errorMessage }),
        { operationId }
      );
    } finally {
      setIsOperating(false);
    }
  };

  const handleImport = async () => {
    if (isOperating) return;

    setIsOperating(true);
    const projectId =
      isInEditor && syncScope === 'current' ? currentProjectId : undefined;
    const operationId = `backup-import-${Date.now()}`;

    try {
      const loadingMessage = projectId ?
        t('Loading changes for {projectName}...', { projectName: currentProjectName }) :
        t('Loading all changes from PC...');
      notificationService.showLoading(loadingMessage, operationId);

      await onImportChanges(projectId || undefined);

      const successMessage = projectId ?
        t('Changes loaded for {projectName}', { projectName: currentProjectName }) :
        t('All changes loaded successfully');
      notificationService.showSuccess(successMessage, { operationId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('Unknown error');
      notificationService.showError(
        t('Load failed: {error}', { error: errorMessage }),
        { operationId }
      );
    } finally {
      setIsOperating(false);
    }
  };

  const handleChangeDirectory = async () => {
    if (isOperating) return;

    setIsOperating(true);
    const operationId = `backup-change-dir-${Date.now()}`;

    try {
      notificationService.showLoading(
        t('Changing storage directory...'),
        operationId
      );
      await onChangeDirectory();
      notificationService.showSuccess(t('Storage directory changed successfully'), {
        operationId
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('Unknown error');
      notificationService.showError(
        t('Failed to change directory: {error}', { error: errorMessage }),
        { operationId }
      );
    } finally {
      setIsOperating(false);
    }
  };

  const handleRequestAccess = async () => {
    // Re-use logic for initial connection
    if (isOperating) return;
    setIsOperating(true);
    try {
      await onRequestAccess();
    } finally {
      setIsOperating(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('Local Storage Settings')}
        icon={FileSystemIcon}
        size="medium"
        headerActions={
          <button
            className="modal-close-button"
            onClick={() => setShowSettings(true)}
            title={t('Settings')}>
            <SettingsIcon />
          </button>
        }>

        <div className="backup-modal">
          <div className="backup-status">
            <div className="status-header">
              <div className="backup-controls">
                {!status.isConnected ?
                  <>
                    <div style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
                      <p>{t('Local Storage is currently disconnected.')}</p>
                      <button
                        className="button primary"
                        onClick={handleRequestAccess}
                        disabled={isOperating}>
                        <FolderIcon />
                        {isOperating ? t('Connecting...') : t('Connect Local Storage')}
                      </button>
                    </div>
                  </> :

                  <>
                    <div className="current-location" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '1rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FolderIcon />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.9em' }}>{t('Storage Location')}</strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{t('Connected to Local Folder')}</span>
                        </div>
                      </div>
                      <button
                        className="button secondary small"
                        onClick={handleChangeDirectory}
                        disabled={isOperating}
                        title={t('Change folder')}>
                        {t('Change')}
                      </button>
                    </div>

                    {isInEditor &&
                      <div
                        className="sync-scope-selector"
                        style={{ marginBottom: '1rem' }}>

                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                          }}>{t('Operation Scope:')}
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>

                            <input
                              type="radio"
                              name="syncScope"
                              value="current"
                              checked={syncScope === 'current'}
                              onChange={(e) =>
                                setSyncScope(
                                  e.target.value as 'current' | 'all'
                                )
                              }
                              disabled={isOperating} />

                            <span>{t('Current project')}</span>
                          </label>
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>

                            <input
                              type="radio"
                              name="syncScope"
                              value="all"
                              checked={syncScope === 'all'}
                              onChange={(e) =>
                                setSyncScope(
                                  e.target.value as 'current' | 'all'
                                )
                              }
                              disabled={isOperating} />

                            <span>{t('All projects')}</span>
                          </label>
                        </div>
                      </div>
                    }
                    <div className="backup-toolbar">
                      <div className="primary-actions" style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button
                          className="button secondary"
                          style={{ flex: 1 }}
                          onClick={handleExport}
                          disabled={status.status === 'syncing' || isOperating}>
                          <ExportIcon />{t('Save to Disk')}
                        </button>
                        <button
                          className="button secondary"
                          style={{ flex: 1 }}
                          onClick={handleImport}
                          disabled={status.status === 'syncing' || isOperating}>
                          <ImportIcon />{t('Load from Disk')}
                        </button>
                      </div>
                    </div>
                  </>
                }
              </div>
            </div>

            <div className="status-info">
              {status.isConnected &&
                <div className="status-item">
                  <strong>{t('Status: ')}</strong> {getStatusText()}
                </div>
              }
              {status.error &&
                <div className="error-message">{status.error}</div>
              }
            </div>
          </div>

          {activities.length > 0 &&
            <div className="backup-activities">
              <div className="activities-header">
                <h3>{t('Recent Activity')}</h3>
                <button
                  className="button small secondary"
                  onClick={onClearAllActivities}
                  title={t('Clear all activities')}
                  disabled={isOperating}>

                  <TrashIcon />{t('Clear All')}

                </button>
              </div>

              <div className="activities-list">
                {activities.
                  slice(-10).
                  reverse().
                  map((activity) =>
                    <div
                      key={activity.id}
                      className="activity-item"
                      style={{
                        borderLeft: `3px solid ${getActivityColor(activity.type)}`
                      }}>

                      <div className="activity-content">
                        <div className="activity-header">
                          <span className="activity-icon">
                            {getActivityIcon(activity.type)}
                          </span>
                          <span className="activity-message">
                            {activity.message}
                          </span>
                          <button
                            className="activity-close"
                            onClick={() => onClearActivity(activity.id)}
                            title={t('Dismiss')}
                            disabled={isOperating}>

                            ×
                          </button>
                        </div>
                        <div className="activity-time">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          }

          <div className="backup-info">
            <h3>{t('How Local Storage Works')}</h3>
            <div className="info-content">
              <p>{t('Local Storage saves all your projects directly to your computer.')}</p>
              <ul>
                <li>
                  <strong>{t('Save to Disk: ')}</strong>&nbsp;{t('Writes all current project data to the selected folder')}
                </li>
                <li>
                  <strong>{t('Load from Disk: ')}</strong>&nbsp;{t('Reads potentially changed files from the folder back into TeXlyre')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        initialCategory={t("Backup")}
        initialSubcategory={t("File System")} />

    </>);

};

export default BackupModal;
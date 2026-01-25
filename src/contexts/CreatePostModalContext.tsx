'use client';

import React, { Dispatch, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useOverlayTriggerState } from 'react-stately';
import { AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/Modal';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { ToEditValues } from '@/lib/createPost';

// Separate the `data` and `api` part of the context to prevent
// re-rendering of the `api` consumers when the `data` changes
const CreatePostModalContextData = createContext<{
  toEditValues: ToEditValues | null;
  shouldOpenFileInputOnMount: boolean;
  initialFilesForCreate: File[] | null;
}>({
  toEditValues: null,
  shouldOpenFileInputOnMount: false,
  initialFilesForCreate: null,
});

const CreatePostModalContextApi = createContext<{
  setShown: (isOpen: boolean) => void;
  setToEditValues: Dispatch<SetStateAction<ToEditValues | null>>;
  setShouldOpenFileInputOnMount: Dispatch<SetStateAction<boolean>>;
  setInitialFilesForCreate: Dispatch<SetStateAction<File[] | null>>;
}>({
  setShown: () => {},
  setToEditValues: () => {},
  setShouldOpenFileInputOnMount: () => {},
  setInitialFilesForCreate: () => {},
});

export function CreatePostModalContextProvider({ children }: { children: React.ReactNode }) {
  const state = useOverlayTriggerState({});
  const [toEditValues, setToEditValues] = useState<ToEditValues | null>(null);
  const [shouldOpenFileInputOnMount, setShouldOpenFileInputOnMount] = useState(false);
  const [initialFilesForCreate, setInitialFilesForCreate] = useState<File[] | null>(null);

  const dataValue = useMemo(
    () => ({ toEditValues, shouldOpenFileInputOnMount, initialFilesForCreate }),
    [shouldOpenFileInputOnMount, toEditValues, initialFilesForCreate],
  );
  const setShownWithCleanup = useCallback(
    (isOpen: boolean) => {
      state.setOpen(isOpen);
      if (!isOpen) setInitialFilesForCreate(null);
    },
    [state],
  );
  const apiValue = useMemo(
    () => ({
      setShown: setShownWithCleanup,
      setToEditValues,
      setShouldOpenFileInputOnMount,
      setInitialFilesForCreate,
    }),
    [setShownWithCleanup],
  );

  return (
    <CreatePostModalContextData.Provider value={dataValue}>
      <CreatePostModalContextApi.Provider value={apiValue}>
        {children}
        <AnimatePresence>
          {state.isOpen && (
            // Set `isKeyboardDismissDisabled`, clicking the `Escape` key must be handled by <CreatePostDialog> instead.
            <Modal state={state} isKeyboardDismissDisabled>
              <CreatePostDialog
                toEditValues={toEditValues}
                shouldOpenFileInputOnMount={shouldOpenFileInputOnMount}
                setShown={setShownWithCleanup}
                initialFiles={initialFilesForCreate ?? undefined}
              />
            </Modal>
          )}
        </AnimatePresence>
      </CreatePostModalContextApi.Provider>
    </CreatePostModalContextData.Provider>
  );
}

export const useCreatePostModalContextData = () => useContext(CreatePostModalContextData);
export const useCreatePostModalContextApi = () => useContext(CreatePostModalContextApi);

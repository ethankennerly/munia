import { useCreatePostModalContextApi } from '@/contexts/CreatePostModalContext';
import { GetVisualMedia } from '@/types/definitions';

export function useCreatePostModal() {
  const { setShown, setShouldOpenFileInputOnMount, setToEditValues, setInitialFilesForCreate } =
    useCreatePostModalContextApi();

  const launchCreatePost = ({
    shouldOpenFileInputOnMount = false,
    initialFiles,
  }: { shouldOpenFileInputOnMount?: boolean; initialFiles?: File[] } = {}) => {
    setToEditValues(null);
    setShouldOpenFileInputOnMount(shouldOpenFileInputOnMount);
    setInitialFilesForCreate(initialFiles ?? null);
    setShown(true);
  };

  const launchEditPost = ({
    initialContent,
    initialVisualMedia,
    postId,
  }: {
    initialContent: string;
    initialVisualMedia: GetVisualMedia[];
    postId: number;
  }) => {
    setToEditValues({
      postId,
      initialContent,
      initialVisualMedia,
    });
    setShown(true);
  };

  const exitCreatePostModal = () => {
    setShown(false);
  };

  return { launchCreatePost, launchEditPost, exitCreatePostModal };
}

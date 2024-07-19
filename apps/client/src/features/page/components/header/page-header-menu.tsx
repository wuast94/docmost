import { ActionIcon, Group, Menu, Tooltip } from "@mantine/core";
import {
  IconArrowsHorizontal,
  IconDots,
  IconDownload,
  IconHistory,
  IconLink,
  IconMessage,
  IconPrinter,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import React from "react";
import useToggleAside from "@/hooks/use-toggle-aside.tsx";
import { useAtom } from "jotai";
import { historyAtoms } from "@/features/page-history/atoms/history-atoms.ts";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { usePageQuery } from "@/features/page/queries/page-query.ts";
import { buildPageUrl } from "@/features/page/page.utils.ts";
import { notifications } from "@mantine/notifications";
import { getAppUrl } from "@/lib/config.ts";
import { extractPageSlugId } from "@/lib";
import { treeApiAtom } from "@/features/page/tree/atoms/tree-api-atom.ts";
import { useDeletePageModal } from "@/features/page/hooks/use-delete-page-modal.tsx";
import { PageWidthToggle } from "@/features/user/components/page-width-pref.tsx";
import PageExportModal from "@/features/page/components/page-export-modal.tsx";
import PageImportModal from "@/features/page/components/page-import-modal.tsx";

interface PageHeaderMenuProps {
  readOnly?: boolean;
}
export default function PageHeaderMenu({ readOnly }: PageHeaderMenuProps) {
  const toggleAside = useToggleAside();

  return (
    <>
      <Tooltip label="Comments" openDelay={250} withArrow>
        <ActionIcon
          variant="default"
          style={{ border: "none" }}
          onClick={() => toggleAside("comments")}
        >
          <IconMessage size={20} stroke={2} />
        </ActionIcon>
      </Tooltip>

      <PageActionMenu readOnly={readOnly} />
    </>
  );
}

interface PageActionMenuProps {
  readOnly?: boolean;
}
function PageActionMenu({ readOnly }: PageActionMenuProps) {
  const [, setHistoryModalOpen] = useAtom(historyAtoms);
  const clipboard = useClipboard({ timeout: 500 });
  const { pageSlug, spaceSlug } = useParams();
  const { data: page, isLoading } = usePageQuery({
    pageId: extractPageSlugId(pageSlug),
  });
  const { openDeleteModal } = useDeletePageModal();
  const [tree] = useAtom(treeApiAtom);
  const [exportOpened, { open: openExportModal, close: closeExportModal }] =
    useDisclosure(false);
  const [importOpened, { open: openImportModal, close: closeImportModal }] =
    useDisclosure(false);

  const handleCopyLink = () => {
    const pageUrl =
      getAppUrl() + buildPageUrl(spaceSlug, page.slugId, page.title);

    clipboard.copy(pageUrl);
    notifications.show({ message: "Link copied" });
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const openHistoryModal = () => {
    setHistoryModalOpen(true);
  };

  const handleDeletePage = () => {
    openDeleteModal({ onConfirm: () => tree?.delete(page.id) });
  };

  return (
    <>
      <Menu
        shadow="xl"
        position="bottom-end"
        offset={20}
        width={200}
        withArrow
        arrowPosition="center"
      >
        <Menu.Target>
          <ActionIcon variant="default" style={{ border: "none" }}>
            <IconDots size={20} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconLink size={16} />}
            onClick={handleCopyLink}
          >
            Copy link
          </Menu.Item>
          <Menu.Divider />

          <Menu.Item leftSection={<IconArrowsHorizontal size={16} />}>
            <Group wrap="nowrap">
              <PageWidthToggle label="Full width" />
            </Group>
          </Menu.Item>

          <Menu.Item
            leftSection={<IconHistory size={16} />}
            onClick={openHistoryModal}
          >
            Page history
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            leftSection={<IconUpload size={16} />}
            onClick={openImportModal}
          >
            Import
          </Menu.Item>

          <Menu.Item
            leftSection={<IconDownload size={16} />}
            onClick={openExportModal}
          >
            Export
          </Menu.Item>

          <Menu.Item
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            Print PDF
          </Menu.Item>

          {!readOnly && (
            <>
              <Menu.Divider />
              <Menu.Item
                color={"red"}
                leftSection={<IconTrash size={16} />}
                onClick={handleDeletePage}
              >
                Delete
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>

      <PageExportModal
        pageId={page.id}
        open={exportOpened}
        onClose={closeExportModal}
      />
      {/* temporary location */}
      <PageImportModal
        spaceId={page.spaceId}
        open={importOpened}
        onClose={closeImportModal}
      />
    </>
  );
}

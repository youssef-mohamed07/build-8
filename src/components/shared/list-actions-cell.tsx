"use client";

import { EntityActions } from "@/components/shared/entity-actions";
import type { ActionResult } from "@/types";

export function ListActionsCell({
  viewHref,
  editHref,
  entityName,
  deleteAction,
  listPath,
}: {
  viewHref: string;
  editHref?: string;
  entityName: string;
  deleteAction?: () => Promise<ActionResult>;
  listPath: string;
}) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
    <EntityActions
      viewHref={viewHref}
      editHref={editHref}
      entityName={entityName}
      deleteAction={deleteAction}
      redirectAfterDelete={listPath}
    />
    </div>
  );
}

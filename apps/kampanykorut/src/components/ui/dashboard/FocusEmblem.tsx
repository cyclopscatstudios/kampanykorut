import classNames from "classnames";
import type { FocusView } from "@/shared/domain";
import { Icon } from "../../../../../../shared/ui/Icon";
import { focusStatusStyle } from "./focusStatusStyle";

export function FocusEmblem({ focus }: { focus: FocusView }) {
  const style = focusStatusStyle[focus.status];

  return (
    <span aria-hidden="true" className="relative inline-flex">
      <span
        className={classNames(
          "inline-flex size-[72px] items-center justify-center rounded-full",
          style.emblem,
        )}
      >
        <Icon
          name={focus.icon ?? "signpost-split-fill"}
          size={focus.icon?.startsWith("/") ? 72 : 30}
          color="currentColor"
          className="rounded-full"
        />
      </span>
      {style.badge && (
        <span
          className={classNames(
            "absolute -bottom-1 -right-1 inline-flex size-7 items-center justify-center rounded-full shadow-[0_0_0_3px_#0f172a]",
            style.badge.className,
          )}
        >
          <Icon name={style.badge.icon} size={14} color="currentColor" />
        </span>
      )}
    </span>
  );
}

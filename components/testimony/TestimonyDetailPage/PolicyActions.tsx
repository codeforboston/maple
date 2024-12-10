import { Card, ListItem, ListItemProps } from "components/Card";
import { useFlags } from "components/featureFlags";
import { formatBillId } from "components/formatting";
import { formUrl } from "components/publish";
import { isNotNull } from "components/utils";
import { FC, ReactElement, useState, useEffect } from "react";
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice";
import { useTranslation } from "next-i18next";
import { followBill, unfollowBill } from "../api/bills"; // Adjust the import path as needed

interface PolicyActionsProps {
  className?: string;
  isUser?: boolean;
  isReporting: boolean;
  setReporting: (boolean: boolean) => void;
}

const PolicyActionItem: FC<React.PropsWithChildren<ListItemProps>> = (props) => (
  <ListItem action active={false} variant="secondary" {...props} />
);

export const PolicyActions: FC<React.PropsWithChildren<PolicyActionsProps>> = ({
  className,
  isUser,
  isReporting,
  setReporting,
}) => {
  const { bill } = useCurrentTestimonyDetails(),
    billLabel = formatBillId(bill.id);
  const { notifications } = useFlags();

  const [isFollowing, setIsFollowing] = useState(false); // Track follow state
  const [loading, setLoading] = useState(false); // Track loading state

  // Fetch initial follow state
  useEffect(() => {
    const userIsFollowing = bill.followers?.includes("currentUserId"); // Replace "currentUserId" with actual user ID logic
    setIsFollowing(userIsFollowing || false);
  }, [bill]);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowBill({ court: bill.court, id: bill.id }); // Backend call to unfollow
      } else {
        await followBill({ court: bill.court, id: bill.id }); // Backend call to follow
      }
      setIsFollowing(!isFollowing); // Toggle state
    } catch (error) {
      console.error("Error toggling follow state:", error);
    } finally {
      setLoading(false);
    }
  };

  const items: ReactElement[] = [
    notifications && (
      <div key="follow" className="follow-button-container">
        <button disabled={loading} onClick={handleFollowToggle}>
          {loading
            ? "Loading..."
            : isFollowing
            ? `Unfollow ${billLabel}`
            : `Follow ${billLabel}`}
        </button>
      </div>
    ),
    <PolicyActionItem
      key="report-testimony"
      billName="Report Testimony"
      onClick={() => setReporting(!isReporting)}
    />,
    <PolicyActionItem
      key="add-testimony"
      billName={`${isUser ? "Edit" : "Add"} Testimony for ${billLabel}`}
      href={formUrl(bill.id, bill.court)}
    />,
  ].filter(isNotNull);

  const { t } = useTranslation("testimony");

  return (
    <Card
      className={className}
      header={t("policyActions.actions") ?? "Actions"}
      items={items}
    />
  );
};

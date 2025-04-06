import Link from "next/link";
import React from "react";
import { Progress } from "./ui/progress";

type Props = {
  userId: string | undefined;
};

const UpgradeButton: React.FC<Props> = () => {
  return (
    <div className="m-3">
      {/* Dummy UI for now, you can add real logic later */}
      <>
        <Progress value={66} /> {/* example: 66% progress */}
        <p>
          2 out of 3 forms generated.{" "}
          <Link
            href={"/dashboard/upgrade"}
            className="text-blue-600 underline"
          >
            Upgrade
          </Link>{" "}
          to generate more forms
        </p>
      </>
    </div>
  );
};

export default UpgradeButton;

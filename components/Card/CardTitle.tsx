import clsx from "clsx";
import React from "react";

type CardTitleBaseProps = {
  title?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

const CardTitle: React.FC<CardTitleBaseProps> = ({ title, children, className }) => {
  return <div className={clsx("card-title", className)}>{title ?? children}</div>;
};

// keep both named + default so existing imports don’t break
export { CardTitle };
export default CardTitle;


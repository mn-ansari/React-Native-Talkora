import poppinsBold from "@/assets/fonts/Poppins-Bold.ttf";
import poppinsMedium from "@/assets/fonts/Poppins-Medium.ttf";
import poppinsRegular from "@/assets/fonts/Poppins-Regular.ttf";
import poppinsSemiBold from "@/assets/fonts/Poppins-SemiBold.ttf";

import { fontFamily } from "./typography";

export const fontAssets = {
  [fontFamily.regular]: poppinsRegular,
  [fontFamily.medium]: poppinsMedium,
  [fontFamily.semiBold]: poppinsSemiBold,
  [fontFamily.bold]: poppinsBold,
};

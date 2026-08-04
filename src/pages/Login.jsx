import React from "react";
import { AuthComponent } from "@/components/ui/sign-up";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";

export default function Login() {
  return (
    <AuthComponent
      logo={<VerifiCasaLogo size={36} tagline={false} />}
      brandName="VerifiCasa"
    />
  );
}
import Image from "next/image";
import Link from "next/link";
import { Stack, Text } from "@mantine/core";
import classes from "./Logo.module.css";

export function Logo({ locale }: { locale?: string }) {
  const homeHref = locale ? `/${locale}` : "/";
  return (
    <Link href={homeHref} className={classes.root}>
      <Image
        src="/logo.jpg"
        alt="Well Da Factory Limited logo"
        width={52}
        height={52}
        priority
      />
      <Stack gap={0} className={classes.text}>
        <Text className={classes.chinese} component="span">
          滙達五金廠
        </Text>
        <Text className={classes.english} component="span">
          Well Da Factory Limited
        </Text>
      </Stack>
    </Link>
  );
}

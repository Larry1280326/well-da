"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Burger,
  Button,
  Container,
  Group,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import { Logo } from "@/components/ui/Logo";
import { MobileNav } from "./MobileNav";
import classes from "./MainHeader.module.css";

export function MainHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpened, { toggle, close }] = useDisclosure(false);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <>
      <div className={classes.root}>
        <Container size="xl" className={classes.container}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="md" wrap="nowrap" className={classes.left}>
              <Box hiddenFrom="sm">
                <Burger
                  opened={mobileOpened}
                  onClick={toggle}
                  size="sm"
                  aria-label="Toggle navigation"
                />
              </Box>
              <Logo />
            </Group>

            <Group gap="md" wrap="nowrap" className={classes.right}>
              <form
                onSubmit={handleSearchSubmit}
                className={classes.searchForm}
              >
                <TextInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  leftSection={<IconSearch size={16} stroke={1.75} />}
                  classNames={{ input: classes.searchInput }}
                  visibleFrom="sm"
                  aria-label="Search site"
                  suppressHydrationWarning
                />
              </form>

              <Link href="/quotation" className={classes.ctaLink}>
                <Button
                  color="green"
                  radius="md"
                  rightSection={<IconArrowRight size={16} stroke={2} />}
                  className={classes.cta}
                >
                  Request for Quotation
                </Button>
              </Link>
            </Group>
          </Group>
        </Container>
      </div>

      <MobileNav opened={mobileOpened} onClose={close} />
    </>
  );
}

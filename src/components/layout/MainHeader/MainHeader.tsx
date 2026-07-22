"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ActionIcon,
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
import { MobileNav } from "../MobileNav/MobileNav";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { useLocale } from "@/i18n/locale-context";
import classes from "./MainHeader.module.css";

export function MainHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpened, { toggle, close }] = useDisclosure(false);
  const [overlayOpened, { open: openOverlay, close: closeOverlay }] =
    useDisclosure(false);
  const { locale, dict } = useLocale();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click-outside to close overlay
  useEffect(() => {
    if (!overlayOpened) return;
    function handleClick(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        closeOverlay();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [overlayOpened, closeOverlay]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (value.trim()) {
        openOverlay();
      } else {
        closeOverlay();
      }
    },
    [openOverlay, closeOverlay],
  );

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.trim()) {
      openOverlay();
    }
  }, [searchQuery, openOverlay]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      closeOverlay();
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
    }
  }

  function handleMobileSearchClick() {
    router.push(`/${locale}/search`);
  }

  return (
    <>
      <div className={classes.root}>
        <Container size="xl" className={classes.container}>
          <Group justify="space-between" align="center" wrap="nowrap" className={classes.row}>
            <Group gap="md" wrap="nowrap" className={classes.left}>
              <Box hiddenFrom="sm">
                <Burger
                  opened={mobileOpened}
                  onClick={toggle}
                  size="sm"
                  aria-label="Toggle navigation"
                />
              </Box>
              <Logo locale={locale} />
            </Group>

            <Group gap="md" wrap="nowrap" className={classes.right}>
              {/* Desktop search */}
              <Box
                ref={searchContainerRef}
                className={classes.searchWrapper}
                visibleFrom="sm"
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className={classes.searchForm}
                >
                  <TextInput
                    placeholder={dict.mainHeader.searchPlaceholder}
                    value={searchQuery}
                    onChange={(event) =>
                      handleSearchChange(event.currentTarget.value)
                    }
                    onFocus={handleSearchFocus}
                    leftSection={<IconSearch size={16} stroke={1.75} />}
                    classNames={{ input: classes.searchInput }}
                    aria-label="Search site"
                    suppressHydrationWarning
                  />
                </form>
                <SearchOverlay
                  opened={overlayOpened}
                  onClose={closeOverlay}
                  query={searchQuery}
                  locale={locale}
                />
              </Box>

              {/* Mobile search icon */}
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                hiddenFrom="sm"
                onClick={handleMobileSearchClick}
                aria-label="Search"
                className={classes.mobileSearchButton}
              >
                <IconSearch size={20} stroke={1.75} />
              </ActionIcon>

              <Link href={`/${locale}/quotation`} className={classes.ctaLink}>
                <Button
                  color="green"
                  radius="md"
                  rightSection={<IconArrowRight size={16} stroke={2} />}
                  className={classes.cta}
                >
                  <span className={classes.ctaFull}>{dict.mainHeader.cta}</span>
                  <span className={classes.ctaShort}>
                    {dict.mainHeader.ctaShort}
                  </span>
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

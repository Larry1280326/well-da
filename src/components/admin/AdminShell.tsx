"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  Badge,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconFileDescription,
  IconUsers,
  IconLogout,
} from "@tabler/icons-react";
import { logout } from "@/app/actions/admin";
import type { SessionUser } from "@/lib/auth/types";

export function AdminShell({
  children,
  lang,
  initialUser,
}: {
  children: React.ReactNode;
  lang: string;
  initialUser: SessionUser | null;
}) {
  const [opened, { toggle }] = useDisclosure();
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const router = useRouter();
  const pathname = usePathname();

  const rfqPath = `/${lang}/administrator`;
  const accountsPath = `/${lang}/administrator/accounts`;
  const isRfqActive = pathname === rfqPath || pathname === `${rfqPath}/`;
  const isAccountsActive = pathname === accountsPath || pathname === `${accountsPath}/`;

  // Re-fetch session when navigating between admin pages (pathname changes).
  // Skip the initial render since we already have initialUser from the server.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    fetch("/api/admin/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.authenticated ? d.user : null))
      .catch(() => setUser(null));
  }, [pathname]);

  // Not authenticated — render children (login form)
  if (user === null) {
    return <>{children}</>;
  }

  const roleColor =
    user.role === "root" ? "red" : user.role === "owner" ? "blue" : "gray";

  const handleSignOut = async () => {
    setUser(null);
    await logout();
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={4}>Well Da Admin</Title>
          </Group>
          <Group gap="sm">
            <span>{user.displayName ?? user.username}</span>
            <Badge color={roleColor} variant="filled">
              {user.role}
            </Badge>
            <Button
              variant="subtle"
              color="red"
              size="xs"
              leftSection={<IconLogout size={16} />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <NavLink
          label="RFQ Submissions"
          leftSection={<IconFileDescription size={18} />}
          onClick={() => router.push(rfqPath)}
          active={isRfqActive}
          styles={{ root: { borderRadius: "var(--mantine-radius-sm)" } }}
        />
        {user.role === "root" && (
          <NavLink
            label="Account Management"
            leftSection={<IconUsers size={18} />}
            onClick={() => router.push(accountsPath)}
            active={isAccountsActive}
            styles={{ root: { borderRadius: "var(--mantine-radius-sm)" } }}
          />
        )}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
